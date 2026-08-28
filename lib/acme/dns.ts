import "server-only";
import Dns20150109, { AddDomainRecordRequest, DeleteDomainRecordRequest } from "@alicloud/alidns20150109";
import { $OpenApiUtil } from "@alicloud/openapi-core";

function getClient(accessKeyId: string, accessKeySecret: string) {
  const config = new $OpenApiUtil.Config({ accessKeyId, accessKeySecret, endpoint: "alidns.aliyuncs.com" });
  return new Dns20150109(config);
}

function normalizeDomain(domain: string) {
  return domain.trim().replace(/^\*\./, "").replace(/\.$/, "").toLowerCase();
}

// AliDNS 的 domainName 是托管的根域名，RR 则包含根域名下的相对记录名。
// 例如在 fzzsai.com 解析区创建 _acme-challenge.edu.fzzsai.com，RR 应为 _acme-challenge.edu。
export function getChallengeRecordName(dnsZone: string, challengeDomain: string) {
  const zone = normalizeDomain(dnsZone);
  const identifier = normalizeDomain(challengeDomain);
  if (identifier === zone) return "_acme-challenge";
  if (!identifier.endsWith(`.${zone}`)) throw new Error(`ACME challenge domain ${challengeDomain} 不属于 DNS zone ${dnsZone}`);
  return `_acme-challenge.${identifier.slice(0, -(zone.length + 1))}`;
}

// 创建 ACME DNS-01 挑战用的 TXT 记录，返回记录 ID（用于验证通过后删除）
export async function createChallengeRecord(accessKeyId: string, accessKeySecret: string, dnsZone: string, challengeDomain: string, value: string): Promise<string> {
  const client = getClient(accessKeyId, accessKeySecret);
  const rr = getChallengeRecordName(dnsZone, challengeDomain);
  const request = new AddDomainRecordRequest({ domainName: dnsZone, RR: rr, type: "TXT", value });
  const response = await client.addDomainRecord(request);
  const recordId = response.body?.recordId;
  if (!recordId) throw new Error("创建 DNS 校验记录失败：没有拿到 recordId");
  return recordId;
}

export async function removeChallengeRecord(accessKeyId: string, accessKeySecret: string, recordId: string): Promise<void> {
  const client = getClient(accessKeyId, accessKeySecret);
  const request = new DeleteDomainRecordRequest({ recordId });
  await client.deleteDomainRecord(request);
}
