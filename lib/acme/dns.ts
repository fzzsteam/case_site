import "server-only";
import Dns20150109, { AddDomainRecordRequest, DeleteDomainRecordRequest } from "@alicloud/alidns20150109";
import { $OpenApiUtil } from "@alicloud/openapi-core";

function getClient(accessKeyId: string, accessKeySecret: string) {
  const config = new $OpenApiUtil.Config({ accessKeyId, accessKeySecret, endpoint: "alidns.aliyuncs.com" });
  return new Dns20150109(config);
}

// 创建 ACME DNS-01 挑战用的 _acme-challenge TXT 记录，返回记录 ID（用于验证通过后删除）
export async function createChallengeRecord(accessKeyId: string, accessKeySecret: string, domain: string, value: string): Promise<string> {
  const client = getClient(accessKeyId, accessKeySecret);
  const request = new AddDomainRecordRequest({ domainName: domain, RR: "_acme-challenge", type: "TXT", value });
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
