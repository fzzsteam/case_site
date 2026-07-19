import "server-only";
import * as acme from "acme-client";
import { getAcmeConfig } from "./config";
import { getCachedCertificate, saveCertificate } from "./store";
import { createChallengeRecord, removeChallengeRecord } from "./dns";
import { bindListenerCertificate, deleteCertificate, getListenerCertificateId, uploadCertificate } from "./alb";

function log(message: string) {
  console.log(`[acme ${new Date().toISOString()}] ${message}`);
}

async function bindAndCleanup(
  accessKeyId: string,
  accessKeySecret: string,
  regionId: string,
  listenerId: string,
  certName: string,
  fullchain: string,
  privateKey: string,
) {
  const oldCertId = await getListenerCertificateId(accessKeyId, accessKeySecret, regionId, listenerId).catch(() => null);

  log("上传证书到数字证书管理服务（CAS）...");
  const certId = await uploadCertificate(accessKeyId, accessKeySecret, certName, fullchain, privateKey);
  log(`新证书 ID: ${certId}`);

  log(`更新 ALB 监听器 (${listenerId}) 的默认证书...`);
  await bindListenerCertificate(accessKeyId, accessKeySecret, regionId, listenerId, certId);
  log(`完成，ALB 监听器 ${listenerId} 现在用的证书是 ${certId}（名称: ${certName}）`);

  if (oldCertId && oldCertId !== certId) {
    log(`清理旧证书 ${oldCertId} ...`);
    await deleteCertificate(accessKeyId, accessKeySecret, oldCertId).catch((error) => log(`旧证书删除失败，可以忽略，不影响新证书生效: ${error}`));
  }
}

async function issueNewCertificate(config: Extract<ReturnType<typeof getAcmeConfig>, { enabled: true }>) {
  const { domain, accessKeyId, accessKeySecret, albRegionId, albListenerId, certName, email } = config;

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

  await bindAndCleanup(accessKeyId, accessKeySecret, albRegionId, albListenerId, certName, fullchain, privateKey);
}

export async function syncCertificate(): Promise<void> {
  const config = getAcmeConfig();
  if (!config.enabled) {
    log("未配置 ALIYUN_ACCESS_KEY_ID/ALIYUN_ACCESS_KEY_SECRET/ALB_REGION_ID/ALB_LISTENER_ID，跳过证书自动续签");
    return;
  }

  try {
    log("检查数据库里是否已有未到期的证书...");
    const cached = await getCachedCertificate(config.domain);

    if (cached) {
      const remainingDays = Math.floor((cached.notAfter.getTime() - Date.now()) / 86_400_000);
      if (remainingDays > config.renewBeforeDays) {
        log(`数据库里的证书还有 ${remainingDays} 天到期（超过阈值 ${config.renewBeforeDays} 天），直接复用，不请求 Let's Encrypt`);
        await bindAndCleanup(config.accessKeyId, config.accessKeySecret, config.albRegionId, config.albListenerId, config.certName, cached.fullchain, cached.privateKey);
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
