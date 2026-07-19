import "server-only";

type AcmeConfig =
  | { enabled: false }
  | {
      enabled: true;
      domain: string;
      accessKeyId: string;
      accessKeySecret: string;
      albRegionId: string;
      albListenerId: string;
      certName: string;
      email: string | undefined;
      renewBeforeDays: number;
      renewIntervalMs: number;
    };

export function getAcmeConfig(): AcmeConfig {
  const domain = process.env.ACME_DOMAIN || "fzzsai.com";
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
  const albRegionId = process.env.ALB_REGION_ID;
  const albListenerId = process.env.ALB_LISTENER_ID;

  if (!accessKeyId || !accessKeySecret || !albRegionId || !albListenerId) return { enabled: false };

  return {
    enabled: true,
    domain,
    accessKeyId,
    accessKeySecret,
    albRegionId,
    albListenerId,
    certName: process.env.ACME_CERT_NAME || `${domain}-wildcard`,
    email: process.env.ACME_EMAIL,
    renewBeforeDays: process.env.ACME_RENEW_BEFORE_DAYS ? Number(process.env.ACME_RENEW_BEFORE_DAYS) : 30,
    renewIntervalMs: process.env.ACME_RENEW_INTERVAL_SECONDS ? Number(process.env.ACME_RENEW_INTERVAL_SECONDS) * 1000 : 12 * 60 * 60 * 1000,
  };
}
