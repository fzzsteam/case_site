import "server-only";
import { getJson, postJson } from "./client";

export type MenuButton = Record<string, unknown>;

/** 创建自定义菜单。button 是微信菜单结构的数组（最多 3 个一级菜单）。 */
export function createMenu(button: MenuButton[]): Promise<unknown> {
  return postJson("/cgi-bin/menu/create", { button });
}

export function getMenu(): Promise<unknown> {
  return getJson("/cgi-bin/menu/get");
}

/** 删除当前使用的自定义菜单（会连个性化菜单一起删，删除后需重新创建）。 */
export function deleteMenu(): Promise<unknown> {
  return getJson("/cgi-bin/menu/delete");
}
