import { deleteDraft, getDraft } from "@/lib/wechat/draft";
import { postJson } from "@/lib/wechat/client";

vi.mock("@/lib/wechat/client", () => ({ postJson: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

it("获取草稿详情并映射出文章数组", async () => {
  vi.mocked(postJson).mockResolvedValue({
    media_id: "draft-1",
    news_item: [
      { title: "标题", content: "<p>正文</p>", author: "作者", digest: "摘要", thumb_media_id: "thumb-1", content_source_url: "https://x.com", update_time: 1700000000 },
    ],
  } as never);

  await expect(getDraft("draft-1")).resolves.toEqual({
    mediaId: "draft-1",
    articles: [
      {
        title: "标题",
        content: "<p>正文</p>",
        author: "作者",
        digest: "摘要",
        thumbMediaId: "thumb-1",
        contentSourceUrl: "https://x.com",
        updatedAt: new Date(1700000000 * 1000).toISOString(),
      },
    ],
  });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/draft/get");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ media_id: "draft-1" });
});

it("删除草稿", async () => {
  vi.mocked(postJson).mockResolvedValue({ errcode: 0 } as never);

  await expect(deleteDraft("draft-1")).resolves.toMatchObject({ errcode: 0 });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/draft/delete");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ media_id: "draft-1" });
});
