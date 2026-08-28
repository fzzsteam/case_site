import "server-only";

type AcmeConfig =
  | { enabled: false }
  | {
      enabled: true;
      domain: string;
      certificateDomains: string[];
      dnsZone: string;
      accessKeyId: string;
      accessKeySecret: string;
      albRegionId: string;
      albInstanceId: string;
      saeNamespaceId: string;
      listenerPort: string;
      certName: string;
      email: string | undefined;
      renewBeforeDays: number;
      renewIntervalMs: number;
    };

export function getAcmeConfig(): AcmeConfig {
  const domain = process.env.ACME_DOMAIN || "fzzsai.com";
  const certificateDomains = Array.from(new Set((process.env.ACME_CERT_DOMAINS || `${domain},*.${domain},*.edu.${domain}`).split(",").map((item) => item.trim().toLowerCase()).filter(Boolean)));
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
  const albRegionId = process.env.ALB_REGION_ID;
  const albInstanceId = process.env.ALB_INSTANCE_ID;

  if (!accessKeyId || !accessKeySecret || !albRegionId || !albInstanceId) return { enabled: false };

  return {
    enabled: true,
    domain,
    certificateDomains,
    dnsZone: process.env.ACME_DNS_ZONE || domain,
    accessKeyId,
    accessKeySecret,
    albRegionId,
    albInstanceId,
    // SAE 命名空间默认等于地域 ID（默认命名空间的规则），自定义命名空间需要显式配置
    saeNamespaceId: process.env.SAE_NAMESPACE_ID || albRegionId,
    listenerPort: process.env.ALB_LISTENER_PORT || "443",
    certName: process.env.ACME_CERT_NAME || `${domain}-wildcard`,
    email: process.env.ACME_EMAIL,
    renewBeforeDays: process.env.ACME_RENEW_BEFORE_DAYS ? Number(process.env.ACME_RENEW_BEFORE_DAYS) : 30,
    renewIntervalMs: process.env.ACME_RENEW_INTERVAL_SECONDS ? Number(process.env.ACME_RENEW_INTERVAL_SECONDS) * 1000 : 12 * 60 * 60 * 1000,
  };
}
