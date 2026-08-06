import "server-only";

export type WechatConfig = { appId: string; appSecret: string };

export function getWechatConfig(): WechatConfig {
  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;
  if (!appId || !appSecret) throw new Error("WECHAT_APP_ID / WECHAT_APP_SECRET 未配置");
  return { appId, appSecret };
}

export function isWechatConfigured(): boolean {
  return Boolean(process.env.WECHAT_APP_ID && process.env.WECHAT_APP_SECRET);
}
