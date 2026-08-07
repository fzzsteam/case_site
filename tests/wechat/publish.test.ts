import { deletePublished, getPublishedArticle, listPublished } from "@/lib/wechat/publish";
import { postJson } from "@/lib/wechat/client";

vi.mock("@/lib/wechat/client", () => ({ postJson: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

it("获取已发布列表并映射出文章摘要", async () => {
  vi.mocked(postJson).mockResolvedValue({
    total_count: 1,
    item_count: 1,
    item: [{ article_id: "a-1", update_time: 1700000000, content: { news_item: [{ title: "已发布标题" }] } }],
  } as never);

  await expect(listPublished(0, 10)).resolves.toEqual({
    total: 1,
    items: [{ articleId: "a-1", title: "已发布标题", updatedAt: new Date(1700000000 * 1000).toISOString() }],
  });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/freepublish/batchget");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ offset: 0, count: 10, no_content: 1 });
});

it("删除已发布文章", async () => {
  vi.mocked(postJson).mockResolvedValue({ errcode: 0 } as never);

  await deletePublished("a-1");
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/freepublish/delete");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ article_id: "a-1" });
});

it("获取已发布图文详情", async () => {
  vi.mocked(postJson).mockResolvedValue({ article_id: "a-1", news_item: [{ title: "标题" }] } as never);

  await expect(getPublishedArticle("a-1")).resolves.toMatchObject({ article_id: "a-1" });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/freepublish/getarticle");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ article_id: "a-1" });
});
