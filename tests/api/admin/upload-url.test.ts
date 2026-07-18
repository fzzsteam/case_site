import { POST } from "@/app/api/admin/media/upload-url/route";
import { prepareUpload, getSignedUploadUrl } from "@/lib/oss/upload";

vi.mock("@/lib/oss/upload", () => ({
  prepareUpload: vi.fn(),
  getSignedUploadUrl: vi.fn(),
}));

const request = (body: unknown) => new Request("http://localhost/api/admin/media/upload-url", { method: "POST", body: JSON.stringify(body) });

beforeEach(() => vi.clearAllMocks());

it("returns a signed upload url and object path for a valid request", async () => {
  vi.mocked(prepareUpload).mockReturnValue({ objectPath: "case-site/cases/uploads/abc-cover.png", contentType: "image/png" });
  vi.mocked(getSignedUploadUrl).mockResolvedValue("https://oss.example.com/signed");
  const response = await POST(request({ fileName: "cover.png", kind: "cover" }));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ uploadUrl: "https://oss.example.com/signed", objectPath: "case-site/cases/uploads/abc-cover.png", contentType: "image/png" });
});

it("rejects an unsupported file extension", async () => {
  vi.mocked(prepareUpload).mockImplementation(() => { throw new Error("Unsupported file type"); });
  const response = await POST(request({ fileName: "malware.exe", kind: "cover" }));
  expect(response.status).toBe(400);
});

it("rejects a malformed request body", async () => {
  const response = await POST(request({ fileName: "" }));
  expect(response.status).toBe(400);
  expect(prepareUpload).not.toHaveBeenCalled();
});

it("returns 503 if signing fails", async () => {
  vi.mocked(prepareUpload).mockReturnValue({ objectPath: "case-site/cases/uploads/abc-cover.png", contentType: "image/png" });
  vi.mocked(getSignedUploadUrl).mockRejectedValue(new Error("OSS is not configured"));
  const response = await POST(request({ fileName: "cover.png", kind: "cover" }));
  expect(response.status).toBe(503);
});
