import { deleteMaterial, getMaterial, getMaterialCount, listMaterials } from "@/lib/wechat/material";
import { postJson } from "@/lib/wechat/client";

vi.mock("@/lib/wechat/client", () => ({ postJson: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

it("按类型获取永久素材列表并映射出摘要", async () => {
  vi.mocked(postJson).mockResolvedValue({
    total_count: 1,
    item_count: 1,
    item: [{ media_id: "m-1", name: "封面.png", update_time: 1700000000, url: "https://mmbiz.qpic.cn/x" }],
  } as never);

  await expect(listMaterials("image", 0, 20)).resolves.toEqual({
    total: 1,
    items: [{ mediaId: "m-1", name: "封面.png", updatedAt: new Date(1700000000 * 1000).toISOString(), url: "https://mmbiz.qpic.cn/x" }],
  });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/material/batchget_material");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ type: "image", offset: 0, count: 20 });
});

it("删除永久素材", async () => {
  vi.mocked(postJson).mockResolvedValue({ errcode: 0 } as never);

  await deleteMaterial("m-1");
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/material/del_material");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ media_id: "m-1" });
});

it("获取永久素材详情", async () => {
  vi.mocked(postJson).mockResolvedValue({ media_id: "m-1", name: "封面.png" } as never);

  await expect(getMaterial("m-1")).resolves.toMatchObject({ media_id: "m-1" });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/material/get_material");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ media_id: "m-1" });
});

it("获取永久素材总数", async () => {
  vi.mocked(postJson).mockResolvedValue({ image_count: 3, video_count: 1, voice_count: 0, news_count: 2 } as never);

  await expect(getMaterialCount()).resolves.toMatchObject({ image_count: 3, news_count: 2 });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/material/get_materialcount");
});
