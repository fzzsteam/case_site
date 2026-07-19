import "server-only";
import SaeClient, { ListIngressesRequest, UpdateIngressRequest } from "@alicloud/sae20190506";
import { $OpenApiUtil } from "@alicloud/openapi-core";

// SAE 的"网关路由"就是 Ingress，它在自己的数据库里保存了一份监听/证书/转发规则配置，
// 并会周期性同步覆盖到 ALB 监听器上。所以证书必须通过这个 Ingress API 更新，
// 直接调 ALB 的 UpdateListenerAttribute 迟早会被 SAE 的同步覆盖回去。
const CAS_ALB_CERT_SUFFIX = "-cn-hangzhou"; // ALB 场景下 CAS 证书 ID 的固定后缀，与证书实际所在地域无关

function getSaeClient(accessKeyId: string, accessKeySecret: string, regionId: string) {
  const config = new $OpenApiUtil.Config({ accessKeyId, accessKeySecret, regionId, endpoint: `sae.${regionId}.aliyuncs.com` });
  return new SaeClient(config);
}

export type AlbIngress = { ingressId: number; certIds: string | null };

export async function findAlbIngress(
  accessKeyId: string,
  accessKeySecret: string,
  regionId: string,
  namespaceId: string,
  albInstanceId: string,
  listenerPort: string,
): Promise<AlbIngress | null> {
  const client = getSaeClient(accessKeyId, accessKeySecret, regionId);
  const response = await client.listIngresses(new ListIngressesRequest({ namespaceId, pageSize: 50 }));
  const list = response.body?.data?.ingressList ?? [];
  const match = list.find((item) => item.loadBalanceType === "alb" && item.slbId === albInstanceId && item.listenerPort === listenerPort);
  if (!match || match.id === undefined || match.id === null) return null;
  return { ingressId: match.id, certIds: match.certIds ?? null };
}

export function toSaeCertId(rawCertId: string): string {
  return `${rawCertId}${CAS_ALB_CERT_SUFFIX}`;
}

export function fromSaeCertId(saeCertId: string): string {
  return saeCertId.endsWith(CAS_ALB_CERT_SUFFIX) ? saeCertId.slice(0, -CAS_ALB_CERT_SUFFIX.length) : saeCertId;
}

// 只传 ingressId + certIds，不带上其它字段，依赖 SAE 这类 Update API 的惯例：不传的字段保持原值不动。
// 首次上线后要人工确认一下这条路由的转发规则等配置没有被意外改动。
export async function updateIngressCertIds(accessKeyId: string, accessKeySecret: string, regionId: string, ingressId: number, certIds: string): Promise<void> {
  const client = getSaeClient(accessKeyId, accessKeySecret, regionId);
  await client.updateIngress(new UpdateIngressRequest({ ingressId, certIds }));
}
