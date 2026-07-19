import "server-only";
import CasClient, { DeleteUserCertificateRequest, UploadUserCertificateRequest } from "@alicloud/cas20200407";
import { $OpenApiUtil } from "@alicloud/openapi-core";

function getCasClient(accessKeyId: string, accessKeySecret: string) {
  const config = new $OpenApiUtil.Config({ accessKeyId, accessKeySecret, endpoint: "cas.aliyuncs.com" });
  return new CasClient(config);
}

export async function uploadCertificate(accessKeyId: string, accessKeySecret: string, name: string, fullchain: string, privateKey: string): Promise<string> {
  const client = getCasClient(accessKeyId, accessKeySecret);
  const request = new UploadUserCertificateRequest({ name, cert: fullchain, key: privateKey });
  const response = await client.uploadUserCertificate(request);
  const certId = response.body?.certId;
  if (certId === undefined || certId === null) throw new Error("上传证书失败：没有拿到 certId");
  return String(certId);
}

export async function deleteCertificate(accessKeyId: string, accessKeySecret: string, certId: string): Promise<void> {
  const client = getCasClient(accessKeyId, accessKeySecret);
  const request = new DeleteUserCertificateRequest({ certId: Number(certId) });
  await client.deleteUserCertificate(request);
}
