import "server-only";
import * as acme from "acme-client";
import { getAcmeConfig } from "./config";
import { getCachedCertificate, saveCertificate, updateCertId } from "./store";
import { createChallengeRecord, removeChallengeRecord } from "./dns";
import { deleteCertificate, uploadCertificate } from "./alb";
import { findAlbIngress, fromSaeCertId, toSaeCertId, updateIngressCertIds } from "./sae";

function log(message: string) {
  console.log(`[acme ${new Date().toISOString()}] ${message}`);
}

type EnabledAcmeConfig = Extract<ReturnType<typeof getAcmeConfig>, { enabled: true }>;

async function bindAndCleanup(config: EnabledAcmeConfig, fullchain: string, privateKey: string): Promise<string> {
  const { accessKeyId, accessKeySecret, albRegionId, albInstanceId, saeNamespaceId, listenerPort, certName } = config;

  const ingress = await findAlbIngress(accessKeyId, accessKeySecret, albRegionId, saeNamespaceId, albInstanceId, listenerPort);
  if (!ingress) {
    throw new Error(
      `在 SAE 命名空间 ${saeNamespaceId} 下没找到绑定 ALB 实例 ${albInstanceId}、监听端口 ${listenerPort} 的网关路由，请检查 SAE_NAMESPACE_ID / ALB_INSTANCE_ID / ALB_LISTENER_PORT 配置`,
    );
  }
  const oldRawCertId = ingress.certIds ? fromSaeCertId(ingress.certIds.split(",")[0]) : null;

  // 名称带上此次上传时刻的毫秒时间戳，避免同名证书在 CAS 里重复上传报 NameRepeat；
  // 用固定的到期日期做后缀不够，绑定失败重试时到期日期不会变，还是会撞名
  const uniqueCertName = `${certName}-${Date.now()}`;

  log("上传证书到数字证书管理服务（CAS）...");
  const certId = await uploadCertificate(accessKeyId, accessKeySecret, uniqueCertName, fullchain, privateKey);
  log(`新证书 ID: ${certId}`);

  log(`更新 SAE 网关路由 (ingressId=${ingress.ingressId}) 的证书...`);
  await updateIngressCertIds(accessKeyId, accessKeySecret, albRegionId, ingress.ingressId, toSaeCertId(certId));
  log(`完成，网关路由现在用的证书是 ${certId}（名称: ${uniqueCertName}）`);

  if (oldRawCertId && oldRawCertId !== certId) {
    log(`清理旧证书 ${oldRawCertId} ...`);
    await deleteCertificate(accessKeyId, accessKeySecret, oldRawCertId).catch((error) => log(`旧证书删除失败，可以忽略，不影响新证书生效: ${error}`));
  }

  return certId;
}

async function issueNewCertificate(config: EnabledAcmeConfig) {
  const { domain, accessKeyId, accessKeySecret, email } = config;

  log("向 Let's Encrypt 申请新证书（DNS-01，走阿里云云解析）...");

  const accountKey = await acme.crypto.createPrivateKey();
  const client = new acme.Client({
    directoryUrl: acme.directory.letsencrypt.production,
    accountKey,
  });

  const [privateKeyBuffer, csr] = await acme.crypto.createCsr({ altNames: [domain, `*.${domain}`] });

  const pendingRecords = new Map<string, string>();

  const fullchain = await client.auto({
    csr,
    email,
    termsOfServiceAgreed: true,
    challengePriority: ["dns-01"],
    challengeCreateFn: async (_authz, challenge, keyAuthorization) => {
      if (challenge.type !== "dns-01") return;
      const recordId = await createChallengeRecord(accessKeyId, accessKeySecret, domain, keyAuthorization);
      pendingRecords.set(challenge.token, recordId);
    },
    challengeRemoveFn: async (_authz, challenge) => {
      if (challenge.type !== "dns-01") return;
      const recordId = pendingRecords.get(challenge.token);
      if (recordId) await removeChallengeRecord(accessKeyId, accessKeySecret, recordId);
    },
  });

  const info = acme.crypto.readCertificateInfo(fullchain);
  const privateKey = privateKeyBuffer.toString();

  log(`签发成功，到期时间: ${info.notAfter.toISOString()}，写入数据库...`);
  await saveCertificate(domain, fullchain, privateKey, info.notAfter);

  const certId = await bindAndCleanup(config, fullchain, privateKey);
  await updateCertId(domain, certId);
}

export async function syncCertificate(): Promise<void> {
  const config = getAcmeConfig();
  if (!config.enabled) {
    log("未配置 ALIYUN_ACCESS_KEY_ID/ALIYUN_ACCESS_KEY_SECRET/ALB_REGION_ID/ALB_INSTANCE_ID，跳过证书自动续签");
    return;
  }

  try {
    log("检查数据库里是否已有未到期的证书...");
    const cached = await getCachedCertificate(config.domain);

    if (cached) {
      const remainingDays = Math.floor((cached.notAfter.getTime() - Date.now()) / 86_400_000);
      if (remainingDays > config.renewBeforeDays) {
        log(`数据库里的证书还有 ${remainingDays} 天到期（超过阈值 ${config.renewBeforeDays} 天），直接复用，不请求 Let's Encrypt`);

        const ingress = await findAlbIngress(config.accessKeyId, config.accessKeySecret, config.albRegionId, config.saeNamespaceId, config.albInstanceId, config.listenerPort);
        const currentRawCertId = ingress?.certIds ? fromSaeCertId(ingress.certIds.split(",")[0]) : null;
        if (cached.certId && currentRawCertId === cached.certId) {
          log(`SAE 网关路由上已经绑定的就是这张证书（${cached.certId}），无需重复上传`);
          return;
        }

        const certId = await bindAndCleanup(config, cached.fullchain, cached.privateKey);
        await updateCertId(config.domain, certId);
        return;
      }
      log(`数据库里的证书还有 ${remainingDays} 天到期，进入续签窗口（阈值 ${config.renewBeforeDays} 天），重新申请`);
    } else {
      log("数据库里没有证书记录");
    }

    await issueNewCertificate(config);
  } catch (error) {
    console.error(`[acme ${new Date().toISOString()}] 证书同步失败:`, error);
  }
}

let timer: ReturnType<typeof setInterval> | undefined;

export function startAcmeRenewalLoop(): void {
  const config = getAcmeConfig();
  if (!config.enabled) {
    log("未配置证书自动续签所需的环境变量，跳过");
    return;
  }
  if (timer) return; // 避免重复调用时起多个定时器

  void syncCertificate();
  timer = setInterval(() => void syncCertificate(), config.renewIntervalMs);
  if (typeof timer.unref === "function") timer.unref();
}
