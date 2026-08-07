import { createDraft, createMultiDraft, deleteDraft, getDraft } from "@/lib/wechat/draft";
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

it("单篇建草稿实际走多图文接口的数组包装", async () => {
  vi.mocked(postJson).mockResolvedValue({ media_id: "draft-1" } as never);

  await createDraft({ title: "标题", content: "<p>正文</p>", thumbMediaId: "thumb-1" });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/draft/add");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({
    articles: [{ title: "标题", author: "", digest: "", content: "<p>正文</p>", content_source_url: "", thumb_media_id: "thumb-1", need_open_comment: 0, only_fans_can_comment: 0 }],
  });
});

it("一次创建多图文草稿（多篇文章）", async () => {
  vi.mocked(postJson).mockResolvedValue({ media_id: "multi-1" } as never);

  await expect(
    createMultiDraft([
      { title: "头条", content: "<p>一</p>", thumbMediaId: "thumb-1" },
      { title: "次条", content: "<p>二</p>", thumbMediaId: "thumb-2" },
    ]),
  ).resolves.toEqual({ media_id: "multi-1" });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/draft/add");
  const body = vi.mocked(postJson).mock.calls[0][1] as { articles: Array<{ title: string; thumb_media_id: string }> };
  expect(body.articles).toHaveLength(2);
  expect(body.articles[0]).toMatchObject({ title: "头条", thumb_media_id: "thumb-1" });
  expect(body.articles[1]).toMatchObject({ title: "次条", thumb_media_id: "thumb-2" });
});
