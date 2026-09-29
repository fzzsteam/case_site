import "server-only";
import { TOOLS, type ToolDefinition } from "./tools";

export type McpPermission = { id: string; name: string; description: string };
export type McpPermissionGroup = { id: string; name: string; permissions: McpPermission[] };

const CASE_PERMISSIONS: McpPermission[] = [
  { id: "cases_list", name: "查询案例列表", description: "查看已创建案例及排序。" },
  { id: "cases_get", name: "查看案例详情", description: "读取案例内容和分集视频信息。" },
  { id: "cases_create", name: "创建案例", description: "新增案例并立即发布到网站。" },
  { id: "cases_update", name: "编辑案例", description: "修改案例字段；未传入的字段保持原值。" },
  { id: "cases_reorder", name: "调整案例排序", description: "调整案例在网站上的展示顺序。" },
  { id: "cases_delete", name: "删除案例", description: "删除案例记录；需要 Agent 先取得用户明确确认。" },
  { id: "categories_list", name: "查询分类", description: "查看案例分类列表。" },
  { id: "categories_create", name: "新建分类", description: "创建案例分类。" },
  { id: "categories_rename", name: "重命名分类", description: "重命名分类并同步更新案例关联。" },
  { id: "categories_delete", name: "删除分类", description: "删除未被案例使用的分类；需要用户明确确认。" },
  { id: "case_create_upload_url", name: "上传案例素材", description: "为本地封面图片或视频签发本站限时上传地址。" },
];

function firstSentence(description: string): string {
  return description.split(/[。！\n]/, 1)[0]?.trim() || description;
}

export function getPermissionGroups(): McpPermissionGroup[] {
  const wechatPermissions = TOOLS
    .filter((tool) => tool.name.startsWith("wechat_"))
    .map((tool) => ({ id: tool.name, name: firstSentence(tool.description), description: tool.name }));

  return [
    { id: "wechat", name: "公众号管理", permissions: wechatPermissions },
    { id: "cases", name: "案例管理", permissions: CASE_PERMISSIONS },
  ];
}

export function getToolPermission(tool: ToolDefinition): string {
  return tool.permission ?? tool.name;
}

export function hasToolPermission(permissions: string[], tool: ToolDefinition): boolean {
  const permission = getToolPermission(tool);
  if (permissions.includes(permission)) return true;
  // 历史 Token 迁移为 wechat.*，继续访问其原有公众号工具，但不会获得案例权限。
  return permission.startsWith("wechat_") && permissions.includes("wechat.*");
}

export function validPermissionIds(): Set<string> {
  return new Set(getPermissionGroups().flatMap((group) => group.permissions.map((permission) => permission.id)));
}
