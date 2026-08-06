/**
 * 上传接口返回的 ref 是自描述的，服务端不保存任何映射：
 * 封面返回 "wxmedia:<永久素材 media_id>"，正文图直接返回微信域名的图片地址。
 */
export const COVER_HANDLE_PREFIX = "wxmedia:";
