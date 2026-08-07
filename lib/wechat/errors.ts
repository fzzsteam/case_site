import "server-only";

/** access_token 失效类错误，遇到这些要强制刷新 token 后重试一次。 */
export const TOKEN_INVALID_ERRCODES = new Set([40001, 40014, 42001]);

/**
 * 微信的 errmsg 对排查几乎没有帮助（"invalid credential"、"api unauthorized"），
 * 而调用方是 agent，只能看到我们返回的文本。所以这里把高频错误翻译成
 * 「发生了什么 + 该去哪里改」，让 agent 能直接把处理办法转述给人。
 */
export function describeWechatError(errcode: number, errmsg: string): string {
  switch (errcode) {
    case 40164: {
      const ip = /invalid ip ([0-9.]+)/.exec(errmsg)?.[1];
      return `服务器出口 IP${ip ? ` ${ip}` : ""} 不在公众号的 IP 白名单里。请到微信公众平台「设置与开发 → 基本配置 → IP 白名单」把该 IP 加进去，几分钟后生效。`;
    }
    case 48001:
      return "公众号没有这个接口的权限。草稿箱、素材、发布接口只对已认证的服务号/订阅号开放，请确认公众号已通过微信认证。";
    case 40001:
    case 40014:
    case 42001:
      return "access_token 无效或已过期（重试后依然失败）。请确认 WECHAT_APP_SECRET 与公众号后台一致，且没有在别处用传统 token 接口把它顶掉。";
    case 40007:
    case 40008:
      return "media_id 不合法或已过期。草稿的 media_id 请通过 wechat_list_drafts 重新获取。";
    case 41005:
      return "缺少媒体文件内容，上传的文件可能是空的。";
    case 45009:
    case 45011:
      return "接口调用频率超出微信限制，请稍后再试。";
    case 45065:
      return "相同 clientmsgid 已存在群发记录（24 小时内防重）。这是重复提交被拦截，不是新群发；请用返回的 msg_id 调用 wechat_mass_status 查询那次群发的状态。";
    case 40002:
      return "群发全员触发了公众号的 API 群发保护，管理员 30 分钟内未在微信后台确认，该次群发已超时失败。";
    case 45002:
      return "内容超出微信长度限制，请缩短标题或正文。";
    case 53404:
      return "该公众号已被限制或封禁，无法调用发布相关接口。";
    case 53501:
      return "该草稿正在被其他操作占用（发布中），请稍后再试。";
    case 88000:
      return "公众号没有留言（评论）功能权限。留言管理接口需要账号具备留言功能，请确认公众号类型与留言功能开通状态。";
    case 88010:
      return "评论分页参数不合法：count 必须在 1-50 之间。";
    case 9001056:
      return "封面图不符合要求，请更换一张常规比例的 jpg/png 图片。";
    default:
      return `微信接口返回错误 ${errcode}：${errmsg}`;
  }
}

export class WechatApiError extends Error {
  constructor(
    readonly errcode: number,
    readonly errmsg: string,
  ) {
    super(describeWechatError(errcode, errmsg));
    this.name = "WechatApiError";
  }
}
