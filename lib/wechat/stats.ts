import "server-only";
import { postJson } from "./client";

/** 发表内容系列数据接口的数据存储起始日，更早的日期查不到有效数据。 */
export const DATA_START_DATE = "2025-11-01";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 统计接口最大只能查到昨天，且建议每天 8 点后查询前一天。 */
export function yesterdayIso(): string {
  return daysAgoIso(1);
}

/** 今天往前数 days 天的日期（YYYY-MM-DD），用于给汇总接口算默认窗口。 */
export function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return isoDate(date);
}

function assertStatsDate(date: string): void {
  if (!DATE_PATTERN.test(date)) throw new Error(`日期格式应为 YYYY-MM-DD，收到：${date}`);
  if (date < DATA_START_DATE) throw new Error(`数据从 ${DATA_START_DATE} 起才有效，更早的日期查不到有效数据。`);
  const yesterday = yesterdayIso();
  if (date > yesterday) throw new Error(`当天数据尚未统计完成，最大可查日期是昨天（${yesterday}），建议每天 8 点后查询。`);
}

function assertStatsRange(beginDate: string, endDate: string): void {
  assertStatsDate(beginDate);
  assertStatsDate(endDate);
  if (beginDate > endDate) throw new Error("begin_date 不能晚于 end_date。");
  const days = (Date.parse(endDate) - Date.parse(beginDate)) / 86_400_000 + 1;
  if (days > 30) throw new Error("日期范围最长支持 30 天。");
}

type Source = { user_count?: number; scene_desc?: string };

function mapSources(sources: Source[] | undefined): Array<{ userCount: number; scene: string }> {
  return (sources ?? []).map((source) => ({ userCount: source.user_count ?? 0, scene: source.scene_desc ?? "" }));
}

type ArticleReadResponse = {
  list?: Array<{
    ref_date?: string;
    msgid?: string;
    detail?: { read_user?: number; read_user_source?: Source[] };
  }>;
  is_delay?: boolean;
};

export type ArticleReadResult = {
  date: string;
  isDelay: boolean;
  articles: Array<{ msgid: string; readUser: number; sources: Array<{ userCount: number; scene: string }> }>;
};

/** 某天所有被阅读过的发表内容的阅读指标（阅读人数 + 来源）。 */
export async function getArticleRead(date: string): Promise<ArticleReadResult> {
  assertStatsDate(date);
  const data = await postJson<ArticleReadResponse>("/datacube/getarticleread", { begin_date: date, end_date: date });
  return {
    date,
    isDelay: data.is_delay === true,
    articles: (data.list ?? []).map((item) => ({
      msgid: item.msgid ?? "",
      readUser: item.detail?.read_user ?? 0,
      sources: mapSources(item.detail?.read_user_source),
    })),
  };
}

type ArticleStatsDetailResponse = {
  list?: Array<{
    ref_date?: string;
    msgid?: string;
    publish_type?: number;
    title?: string;
    content_url?: string;
    detail_list?: Array<{
      stat_date?: string;
      read_user?: number;
      share_user?: number;
      zaikan_user?: number;
      like_user?: number;
      comment_count?: number;
      collection_user?: number;
      praise_money?: number;
      read_subscribe_user?: number;
      read_delivery_rate?: number;
      read_finish_rate?: number;
      read_avg_activetime?: number;
      read_user_source?: Source[];
    }>;
  }>;
  is_delay?: boolean;
};

export type ArticleStatsDetailResult = {
  date: string;
  isDelay: boolean;
  articles: Array<{
    msgid: string;
    publishType?: number;
    title: string;
    contentUrl?: string;
    stats: Array<{
      statDate: string;
      readUser: number;
      shareUser: number;
      zaikanUser: number;
      likeUser: number;
      commentCount: number;
      collectionUser: number;
      praiseMoney: number;
      readSubscribeUser: number;
      readDeliveryRate: number;
      readFinishRate: number;
      readAvgActiveTime: number;
      sources: Array<{ userCount: number; scene: string }>;
    }>;
  }>;
};

/** 某天发表的所有发表内容的详细数据（含标题、链接；每篇统计发表后 30 天）。 */
export async function getArticleStatsDetail(date: string): Promise<ArticleStatsDetailResult> {
  assertStatsDate(date);
  const data = await postJson<ArticleStatsDetailResponse>("/datacube/getarticletotaldetail", { begin_date: date, end_date: date });
  return {
    date,
    isDelay: data.is_delay === true,
    articles: (data.list ?? []).map((item) => ({
      msgid: item.msgid ?? "",
      publishType: item.publish_type,
      title: item.title ?? "",
      contentUrl: item.content_url,
      stats: (item.detail_list ?? []).map((stat) => ({
        statDate: stat.stat_date ?? "",
        readUser: stat.read_user ?? 0,
        shareUser: stat.share_user ?? 0,
        zaikanUser: stat.zaikan_user ?? 0,
        likeUser: stat.like_user ?? 0,
        commentCount: stat.comment_count ?? 0,
        collectionUser: stat.collection_user ?? 0,
        praiseMoney: stat.praise_money ?? 0,
        readSubscribeUser: stat.read_subscribe_user ?? 0,
        readDeliveryRate: stat.read_delivery_rate ?? 0,
        readFinishRate: stat.read_finish_rate ?? 0,
        readAvgActiveTime: stat.read_avg_activetime ?? 0,
        sources: mapSources(stat.read_user_source),
      })),
    })),
  };
}

type BizSummaryResponse = {
  list?: Array<{
    ref_date?: string;
    detail?: {
      read_user?: number;
      share_user?: number;
      zaikan_user?: number;
      like_user?: number;
      comment_count?: number;
      collection_user?: number;
      redirect_ori_page_user?: number;
      send_page_count?: number;
      read_user_source?: Source[];
    };
  }>;
  is_delay?: boolean;
};

export type ArticleStatsSummaryResult = {
  beginDate: string;
  endDate: string;
  isDelay: boolean;
  days: Array<{
    date: string;
    readUser: number;
    shareUser: number;
    zaikanUser: number;
    likeUser: number;
    commentCount: number;
    collectionUser: number;
    redirectOriPageUser: number;
    sendPageCount: number;
    sources: Array<{ userCount: number; scene: string }>;
  }>;
};

/** 圈选日期内账号发表内容的汇总概览，最长 30 天。 */
export async function getArticleStatsSummary(beginDate: string, endDate: string): Promise<ArticleStatsSummaryResult> {
  assertStatsRange(beginDate, endDate);
  const data = await postJson<BizSummaryResponse>("/datacube/getbizsummary", { begin_date: beginDate, end_date: endDate });
  return {
    beginDate,
    endDate,
    isDelay: data.is_delay === true,
    days: (data.list ?? []).map((item) => ({
      date: item.ref_date ?? "",
      readUser: item.detail?.read_user ?? 0,
      shareUser: item.detail?.share_user ?? 0,
      zaikanUser: item.detail?.zaikan_user ?? 0,
      likeUser: item.detail?.like_user ?? 0,
      commentCount: item.detail?.comment_count ?? 0,
      collectionUser: item.detail?.collection_user ?? 0,
      redirectOriPageUser: item.detail?.redirect_ori_page_user ?? 0,
      sendPageCount: item.detail?.send_page_count ?? 0,
      sources: mapSources(item.detail?.read_user_source),
    })),
  };
}
