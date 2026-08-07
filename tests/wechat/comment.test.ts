import { deleteComment, listComments, markComment, replyComment, unmarkComment } from "@/lib/wechat/comment";
import { postJson } from "@/lib/wechat/client";

vi.mock("@/lib/wechat/client", () => ({ postJson: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

it("查看指定文章的评论并映射出列表", async () => {
  vi.mocked(postJson).mockResolvedValue({
    total: 2,
    comment: [
      {
        user_comment_id: 11,
        create_time: 1700000000,
        content: "好看",
        comment_type: 1,
        openid: "o-1",
        reply: { content: "谢谢", create_time: 1700000100 },
      },
    ],
  } as never);

  await expect(listComments({ msgDataId: 1001, index: 0, begin: 0, count: 20, type: 0 })).resolves.toEqual({
    total: 2,
    comments: [
      {
        userCommentId: 11,
        createdAt: new Date(1700000000 * 1000).toISOString(),
        content: "好看",
        commentType: 1,
        openid: "o-1",
        reply: { content: "谢谢", createdAt: new Date(1700000100 * 1000).toISOString() },
      },
    ],
  });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/comment/list");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ msg_data_id: 1001, index: 0, begin: 0, count: 20, type: 0 });
});

it("回复评论", async () => {
  vi.mocked(postJson).mockResolvedValue({ errcode: 0 } as never);

  await replyComment({ msgDataId: 1001, index: 0, userCommentId: 11, content: "谢谢支持" });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/comment/reply/add");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ msg_data_id: 1001, index: 0, user_comment_id: 11, content: "谢谢支持" });
});

it("标记精选 / 取消精选 / 删除评论都走对应接口", async () => {
  vi.mocked(postJson).mockResolvedValue({ errcode: 0 } as never);

  await markComment({ msgDataId: 1001, index: 0, userCommentId: 11 });
  await unmarkComment({ msgDataId: 1001, index: 0, userCommentId: 11 });
  await deleteComment({ msgDataId: 1001, index: 0, userCommentId: 11 });

  expect(vi.mocked(postJson).mock.calls.map(([path]) => path)).toEqual([
    "/cgi-bin/comment/markelect",
    "/cgi-bin/comment/unmarkelect",
    "/cgi-bin/comment/delete",
  ]);
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ msg_data_id: 1001, index: 0, user_comment_id: 11 });
});
