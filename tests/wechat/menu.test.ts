import { createMenu, deleteMenu, getMenu } from "@/lib/wechat/menu";
import { getJson, postJson } from "@/lib/wechat/client";

vi.mock("@/lib/wechat/client", () => ({ getJson: vi.fn(), postJson: vi.fn() }));

const buttons = [{ type: "view", name: "官网", url: "https://example.com" }];

beforeEach(() => {
  vi.clearAllMocks();
});

it("创建自定义菜单", async () => {
  vi.mocked(postJson).mockResolvedValue({ errcode: 0 } as never);

  await createMenu(buttons);
  expect(vi.mocked(postJson).mock.calls[0][0]).toBe("/cgi-bin/menu/create");
  expect(vi.mocked(postJson).mock.calls[0][1]).toEqual({ button: buttons });
});

it("查询自定义菜单配置", async () => {
  vi.mocked(getJson).mockResolvedValue({ menu: { button: buttons } } as never);

  await expect(getMenu()).resolves.toMatchObject({ menu: { button: buttons } });
  expect(vi.mocked(getJson).mock.calls[0][0]).toBe("/cgi-bin/menu/get");
});

it("删除自定义菜单", async () => {
  vi.mocked(getJson).mockResolvedValue({ errcode: 0 } as never);

  await deleteMenu();
  expect(vi.mocked(getJson).mock.calls[0][0]).toBe("/cgi-bin/menu/delete");
});
