import { getArticleRead, getArticleStatsDetail, getArticleStatsSummary, getUserCumulate, getUserSummary, yesterdayIso } from "@/lib/wechat/stats";
import { postJson } from "@/lib/wechat/client";

vi.mock("@/lib/wechat/client", () => ({ postJson: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

it("昨日返回 YYYY-MM-DD 格式", () => {
  expect(yesterdayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

it("getArticleRead 按日期查询并映射出阅读列表", async () => {
  vi.mocked(postJson).mockResolvedValue({
    list: [
      {
        ref_date: "2026-08-06",
        msgid: "10000050_1",
        detail: {
          read_user: 4123,
          read_user_source: [
            { user_count: 4123, scene_desc: "全部" },
            { user_count: 234, scene_desc: "公众号消息" },
          ],
        },
      },
    ],
    is_delay: false,
  } as never);

  await expect(getArticleRead("2026-08-06")).resolves.toEqual({
    date: "2026-08-06",
    isDelay: false,
    articles: [
      {
        msgid: "10000050_1",
        readUser: 4123,
        sources: [
          { userCount: 4123, scene: "全部" },
          { userCount: 234, scene: "公众号消息" },
        ],
      },
    ],
  });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/datacube/getarticleread");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ begin_date: "2026-08-06", end_date: "2026-08-06" });
});

it("getArticleStatsDetail 映射出带标题链接的完整指标", async () => {
  vi.mocked(postJson).mockResolvedValue({
    list: [
      {
        ref_date: "2026-08-06",
        msgid: "2247490098_1",
        publish_type: 0,
        title: "标题",
        content_url: "https://mp.weixin.qq.com/s/abc",
        detail_list: [
          {
            stat_date: "2026-08-06",
            read_user: 4123,
            share_user: 366,
            zaikan_user: 191,
            like_user: 386,
            comment_count: 33,
            collection_user: 233,
            praise_money: 361,
            read_subscribe_user: 327,
            read_delivery_rate: 0.0271002,
            read_finish_rate: 0.6304348,
            read_avg_activetime: 1.0588236,
            read_user_source: [{ user_count: 4123, scene_desc: "全部" }],
          },
        ],
      },
    ],
    is_delay: false,
  } as never);

  await expect(getArticleStatsDetail("2026-08-06")).resolves.toEqual({
    date: "2026-08-06",
    isDelay: false,
    articles: [
      {
        msgid: "2247490098_1",
        publishType: 0,
        title: "标题",
        contentUrl: "https://mp.weixin.qq.com/s/abc",
        stats: [
          {
            statDate: "2026-08-06",
            readUser: 4123,
            shareUser: 366,
            zaikanUser: 191,
            likeUser: 386,
            commentCount: 33,
            collectionUser: 233,
            praiseMoney: 361,
            readSubscribeUser: 327,
            readDeliveryRate: 0.0271002,
            readFinishRate: 0.6304348,
            readAvgActiveTime: 1.0588236,
            sources: [{ userCount: 4123, scene: "全部" }],
          },
        ],
      },
    ],
  });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/datacube/getarticletotaldetail");
});

it("getArticleStatsSummary 支持最长 30 天的账号汇总", async () => {
  vi.mocked(postJson).mockResolvedValue({
    list: [
      {
        ref_date: "2026-08-06",
        detail: { read_user: 4123, share_user: 366, zaikan_user: 191, like_user: 386, comment_count: 33, collection_user: 233, redirect_ori_page_user: 369, send_page_count: 512 },
      },
    ],
    is_delay: false,
  } as never);

  await expect(getArticleStatsSummary("2026-08-06", "2026-08-06")).resolves.toEqual({
    beginDate: "2026-08-06",
    endDate: "2026-08-06",
    isDelay: false,
    days: [
      {
        date: "2026-08-06",
        readUser: 4123,
        shareUser: 366,
        zaikanUser: 191,
        likeUser: 386,
        commentCount: 33,
        collectionUser: 233,
        redirectOriPageUser: 369,
        sendPageCount: 512,
        sources: [],
      },
    ],
  });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/datacube/getbizsummary");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ begin_date: "2026-08-06", end_date: "2026-08-06" });
});

it("日期格式非法时报错", async () => {
  await expect(getArticleRead("2026/08/06")).rejects.toThrow(/YYYY-MM-DD/);
  expect(postJson).not.toHaveBeenCalled();
});

it("早于数据起始日或晚于昨天的日期被拒绝", async () => {
  await expect(getArticleRead("2025-10-31")).rejects.toThrow(/2025-11-01/);
  await expect(getArticleRead("2099-01-01")).rejects.toThrow(/昨天/);
  expect(postJson).not.toHaveBeenCalled();
});

it("汇总日期范围超过 30 天被拒绝", async () => {
  await expect(getArticleStatsSummary("2026-07-01", "2026-08-06")).rejects.toThrow(/30 天/);
  expect(postJson).not.toHaveBeenCalled();
});

it("汇总的开始日期不能晚于结束日期", async () => {
  await expect(getArticleStatsSummary("2026-08-06", "2026-08-01")).rejects.toThrow(/不能晚于/);
  expect(postJson).not.toHaveBeenCalled();
});

it("getUserSummary 查某天粉丝增减并映射", async () => {
  vi.mocked(postJson).mockResolvedValue({
    list: [{ ref_date: "2026-08-06", user_source: 0, new_user: 12, cancel_user: 3 }],
    is_delay: false,
  } as never);

  await expect(getUserSummary("2026-08-06")).resolves.toEqual({
    date: "2026-08-06",
    isDelay: false,
    items: [{ date: "2026-08-06", userSource: 0, newUsers: 12, cancelUsers: 3 }],
  });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/datacube/getusersummary");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ begin_date: "2026-08-06", end_date: "2026-08-06" });
});

it("getUserCumulate 查某天累计关注", async () => {
  vi.mocked(postJson).mockResolvedValue({ list: [{ ref_date: "2026-08-06", cumulate_user: 1000 }] } as never);

  await expect(getUserCumulate("2026-08-06")).resolves.toEqual({
    date: "2026-08-06",
    isDelay: false,
    items: [{ date: "2026-08-06", totalUsers: 1000 }],
  });
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/datacube/getusercumulate");
});

it("用户统计接口要求起止日期是同一天", async () => {
  await expect(getUserSummary("2026-08-01", "2026-08-06")).rejects.toThrow(/同一天/);
  expect(postJson).not.toHaveBeenCalled();
});

it("用户统计接口拒绝 2014-12-01 之前的日期", async () => {
  await expect(getUserCumulate("2014-11-30")).rejects.toThrow(/2014-12-01/);
  expect(postJson).not.toHaveBeenCalled();
});
