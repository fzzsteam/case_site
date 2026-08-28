import { getAcmeConfig } from "@/lib/acme/config";

const ENV_KEYS = [
  "ALIYUN_ACCESS_KEY_ID",
  "ALIYUN_ACCESS_KEY_SECRET",
  "ALB_REGION_ID",
  "ALB_INSTANCE_ID",
  "SAE_NAMESPACE_ID",
  "ALB_LISTENER_PORT",
  "ACME_DOMAIN",
  "ACME_CERT_DOMAINS",
  "ACME_DNS_ZONE",
  "ACME_CERT_NAME",
  "ACME_RENEW_BEFORE_DAYS",
  "ACME_RENEW_INTERVAL_SECONDS",
] as const;

beforeEach(() => {
  for (const key of ENV_KEYS) delete process.env[key];
});

it("is disabled when required env vars are missing", () => {
  expect(getAcmeConfig()).toEqual({ enabled: false });
});

it("is disabled when only some required env vars are set", () => {
  process.env.ALIYUN_ACCESS_KEY_ID = "id";
  process.env.ALIYUN_ACCESS_KEY_SECRET = "secret";
  expect(getAcmeConfig()).toEqual({ enabled: false });
});

it("is enabled with sensible defaults when all required env vars are set", () => {
  process.env.ALIYUN_ACCESS_KEY_ID = "id";
  process.env.ALIYUN_ACCESS_KEY_SECRET = "secret";
  process.env.ALB_REGION_ID = "cn-shenzhen";
  process.env.ALB_INSTANCE_ID = "alb-123";

  const config = getAcmeConfig();
  expect(config.enabled).toBe(true);
  if (!config.enabled) return;
  expect(config.domain).toBe("fzzsai.com");
  expect(config.certificateDomains).toEqual(["fzzsai.com", "*.fzzsai.com", "*.edu.fzzsai.com"]);
  expect(config.dnsZone).toBe("fzzsai.com");
  expect(config.certName).toBe("fzzsai.com-wildcard");
  expect(config.saeNamespaceId).toBe("cn-shenzhen");
  expect(config.listenerPort).toBe("443");
  expect(config.renewBeforeDays).toBe(30);
  expect(config.renewIntervalMs).toBe(12 * 60 * 60 * 1000);
});

it("honors optional overrides", () => {
  process.env.ALIYUN_ACCESS_KEY_ID = "id";
  process.env.ALIYUN_ACCESS_KEY_SECRET = "secret";
  process.env.ALB_REGION_ID = "cn-shenzhen";
  process.env.ALB_INSTANCE_ID = "alb-123";
  process.env.SAE_NAMESPACE_ID = "cn-shenzhen:custom";
  process.env.ALB_LISTENER_PORT = "8443";
  process.env.ACME_DOMAIN = "example.com";
  process.env.ACME_CERT_DOMAINS = "example.com,*.example.com,*.edu.example.com";
  process.env.ACME_DNS_ZONE = "example.com";
  process.env.ACME_CERT_NAME = "custom-name";
  process.env.ACME_RENEW_BEFORE_DAYS = "10";
  process.env.ACME_RENEW_INTERVAL_SECONDS = "60";

  const config = getAcmeConfig();
  expect(config.enabled).toBe(true);
  if (!config.enabled) return;
  expect(config.domain).toBe("example.com");
  expect(config.certificateDomains).toEqual(["example.com", "*.example.com", "*.edu.example.com"]);
  expect(config.dnsZone).toBe("example.com");
  expect(config.certName).toBe("custom-name");
  expect(config.saeNamespaceId).toBe("cn-shenzhen:custom");
  expect(config.listenerPort).toBe("8443");
  expect(config.renewBeforeDays).toBe(10);
  expect(config.renewIntervalMs).toBe(60_000);
});
