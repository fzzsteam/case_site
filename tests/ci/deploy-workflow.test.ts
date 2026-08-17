import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const workflow = readFileSync(resolve(process.cwd(), ".github/workflows/deploy-sae.yml"), "utf8");

describe("SAE 部署 workflow", () => {
  it("使用 Node 24 兼容的 Actions 运行时", () => {
    expect(workflow).toContain("actions/checkout@v6");
    expect(workflow).toContain("actions/setup-node@v6");
    expect(workflow).toContain("docker/setup-buildx-action@v4");
    expect(workflow).toContain("docker/login-action@v4");
    expect(workflow).toContain("docker/build-push-action@v7");
  });

  it("向 ACR Personal 推送时关闭不兼容的 OCI attestations", () => {
    expect(workflow).toMatch(/provenance:\s*false/);
    expect(workflow).toMatch(/sbom:\s*false/);
  });
});
