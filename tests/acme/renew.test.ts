import { syncCertificate } from "@/lib/acme/renew";
import { createChallengeRecord, removeChallengeRecord } from "@/lib/acme/dns";
import { bindListenerCertificate, deleteCertificate, getListenerCertificateId, uploadCertificate } from "@/lib/acme/alb";
import { getCachedCertificate, saveCertificate, updateCertId } from "@/lib/acme/store";

const { mockAuto, mockCreatePrivateKey, mockCreateCsr, mockReadCertificateInfo } = vi.hoisted(() => ({
  mockAuto: vi.fn(),
  mockCreatePrivateKey: vi.fn(),
  mockCreateCsr: vi.fn(),
  mockReadCertificateInfo: vi.fn(),
}));

vi.mock("acme-client", () => ({
  Client: vi.fn().mockImplementation(function AcmeClientMock() {
    return { auto: mockAuto };
  }),
  crypto: {
    createPrivateKey: mockCreatePrivateKey,
    createCsr: mockCreateCsr,
    readCertificateInfo: mockReadCertificateInfo,
  },
  directory: { letsencrypt: { production: "https://acme-v02.api.letsencrypt.org/directory" } },
}));

vi.mock("@/lib/acme/dns", () => ({
  createChallengeRecord: vi.fn(),
  removeChallengeRecord: vi.fn(),
}));

vi.mock("@/lib/acme/alb", () => ({
  uploadCertificate: vi.fn(),
  deleteCertificate: vi.fn(),
  getListenerCertificateId: vi.fn(),
  bindListenerCertificate: vi.fn(),
}));

vi.mock("@/lib/acme/store", () => ({
  getCachedCertificate: vi.fn(),
  saveCertificate: vi.fn(),
  updateCertId: vi.fn(),
}));

const ENV_KEYS = ["ALIYUN_ACCESS_KEY_ID", "ALIYUN_ACCESS_KEY_SECRET", "ALB_REGION_ID", "ALB_LISTENER_ID", "ACME_DOMAIN", "ACME_RENEW_BEFORE_DAYS"] as const;

function enableConfig() {
  process.env.ALIYUN_ACCESS_KEY_ID = "test-key";
  process.env.ALIYUN_ACCESS_KEY_SECRET = "test-secret";
  process.env.ALB_REGION_ID = "cn-shenzhen";
  process.env.ALB_LISTENER_ID = "lsn-test";
  process.env.ACME_DOMAIN = "fzzsai.com";
}

beforeEach(() => {
  vi.clearAllMocks();
  for (const key of ENV_KEYS) delete process.env[key];
  vi.mocked(getListenerCertificateId).mockResolvedValue("old-cert-id");
  vi.mocked(deleteCertificate).mockResolvedValue(undefined);
});

it("does nothing when acme is not configured", async () => {
  await syncCertificate();
  expect(getCachedCertificate).not.toHaveBeenCalled();
  expect(mockAuto).not.toHaveBeenCalled();
});

it("reuses a cached certificate that is not close to expiry, without calling Let's Encrypt", async () => {
  enableConfig();
  const notAfter = new Date(Date.now() + 60 * 86_400_000);
  vi.mocked(getCachedCertificate).mockResolvedValue({ fullchain: "cached-fullchain", privateKey: "cached-key", notAfter, certId: null });
  vi.mocked(uploadCertificate).mockResolvedValue("new-cert-id");

  await syncCertificate();

  expect(mockAuto).not.toHaveBeenCalled();
  expect(saveCertificate).not.toHaveBeenCalled();
  expect(uploadCertificate).toHaveBeenCalledWith("test-key", "test-secret", expect.stringMatching(/^fzzsai\.com-wildcard-\d+$/), "cached-fullchain", "cached-key");
  expect(bindListenerCertificate).toHaveBeenCalledWith("test-key", "test-secret", "cn-shenzhen", "lsn-test", "new-cert-id");
  expect(deleteCertificate).toHaveBeenCalledWith("test-key", "test-secret", "old-cert-id");
  expect(updateCertId).toHaveBeenCalledWith("fzzsai.com", "new-cert-id");
});

it("skips upload entirely when the ALB listener already has the cached certificate bound", async () => {
  enableConfig();
  const notAfter = new Date(Date.now() + 60 * 86_400_000);
  vi.mocked(getCachedCertificate).mockResolvedValue({ fullchain: "cached-fullchain", privateKey: "cached-key", notAfter, certId: "old-cert-id" });

  await syncCertificate();

  expect(mockAuto).not.toHaveBeenCalled();
  expect(uploadCertificate).not.toHaveBeenCalled();
  expect(bindListenerCertificate).not.toHaveBeenCalled();
  expect(updateCertId).not.toHaveBeenCalled();
});

it("issues a new certificate via Let's Encrypt when nothing is cached", async () => {
  enableConfig();
  vi.mocked(getCachedCertificate).mockResolvedValue(null);
  mockCreatePrivateKey.mockResolvedValue(Buffer.from("account-key"));
  mockCreateCsr.mockResolvedValue([Buffer.from("private-key-bytes"), Buffer.from("csr-bytes")]);
  mockAuto.mockResolvedValue("-----BEGIN CERTIFICATE-----\nfullchain\n-----END CERTIFICATE-----");
  const notAfter = new Date("2026-10-01T00:00:00Z");
  mockReadCertificateInfo.mockReturnValue({ notAfter });
  vi.mocked(uploadCertificate).mockResolvedValue("new-cert-id");

  await syncCertificate();

  expect(mockCreateCsr).toHaveBeenCalledWith({ altNames: ["fzzsai.com", "*.fzzsai.com"] });
  expect(mockAuto).toHaveBeenCalledWith(
    expect.objectContaining({ termsOfServiceAgreed: true, challengePriority: ["dns-01"] }),
  );
  expect(saveCertificate).toHaveBeenCalledWith("fzzsai.com", expect.stringContaining("BEGIN CERTIFICATE"), "private-key-bytes", notAfter);
  expect(uploadCertificate).toHaveBeenCalledWith("test-key", "test-secret", expect.stringMatching(/^fzzsai\.com-wildcard-\d+$/), expect.stringContaining("BEGIN CERTIFICATE"), "private-key-bytes");
  expect(bindListenerCertificate).toHaveBeenCalledWith("test-key", "test-secret", "cn-shenzhen", "lsn-test", "new-cert-id");
  expect(updateCertId).toHaveBeenCalledWith("fzzsai.com", "new-cert-id");
});

it("issues a new certificate when the cached one is close to expiry", async () => {
  enableConfig();
  const notAfter = new Date(Date.now() + 5 * 86_400_000);
  vi.mocked(getCachedCertificate).mockResolvedValue({ fullchain: "old-fullchain", privateKey: "old-key", notAfter, certId: "old-cert-id" });
  mockCreatePrivateKey.mockResolvedValue(Buffer.from("account-key"));
  mockCreateCsr.mockResolvedValue([Buffer.from("private-key-bytes"), Buffer.from("csr-bytes")]);
  mockAuto.mockResolvedValue("new-fullchain");
  mockReadCertificateInfo.mockReturnValue({ notAfter: new Date(Date.now() + 90 * 86_400_000) });
  vi.mocked(uploadCertificate).mockResolvedValue("new-cert-id");

  await syncCertificate();

  expect(mockAuto).toHaveBeenCalled();
  expect(saveCertificate).toHaveBeenCalled();
});

it("wires the DNS-01 challenge callbacks to createChallengeRecord and removeChallengeRecord", async () => {
  enableConfig();
  vi.mocked(getCachedCertificate).mockResolvedValue(null);
  mockCreatePrivateKey.mockResolvedValue(Buffer.from("account-key"));
  mockCreateCsr.mockResolvedValue([Buffer.from("private-key-bytes"), Buffer.from("csr-bytes")]);
  mockReadCertificateInfo.mockReturnValue({ notAfter: new Date() });
  vi.mocked(createChallengeRecord).mockResolvedValue("record-1");
  vi.mocked(uploadCertificate).mockResolvedValue("new-cert-id");
  mockAuto.mockImplementation(async (opts: { challengeCreateFn: Function; challengeRemoveFn: Function }) => {
    const challenge = { type: "dns-01", token: "token-1" };
    await opts.challengeCreateFn({}, challenge, "key-authorization-value");
    await opts.challengeRemoveFn({}, challenge, "key-authorization-value");
    return "fullchain";
  });

  await syncCertificate();

  expect(createChallengeRecord).toHaveBeenCalledWith("test-key", "test-secret", "fzzsai.com", "key-authorization-value");
  expect(removeChallengeRecord).toHaveBeenCalledWith("test-key", "test-secret", "record-1");
});
