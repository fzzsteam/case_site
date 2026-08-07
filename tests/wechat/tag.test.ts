import { listTags } from "@/lib/wechat/tag";
import { getJson } from "@/lib/wechat/client";

vi.mock("@/lib/wechat/client", () => ({ getJson: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

it("获取标签列表并映射出 id/name/count", async () => {
  vi.mocked(getJson).mockResolvedValue({ tags: [{ id: 1, name: "vip", count: 3 }] } as never);

  await expect(listTags()).resolves.toEqual([{ id: 1, name: "vip", count: 3 }]);
  expect(vi.mocked(getJson).mock.calls[0][0]).toBe("/cgi-bin/tags/get");
});

it("标签为空时返回空数组", async () => {
  vi.mocked(getJson).mockResolvedValue({} as never);
  await expect(listTags()).resolves.toEqual([]);
});
