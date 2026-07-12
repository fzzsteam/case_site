import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import HomePage from "@/app/page";

afterEach(() => {
  vi.restoreAllMocks();
});

it("renders the primary heading", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { level: 1, name: /重新定义\s*文旅表达/ })).toBeInTheDocument();
});

it("shows case titles with project descriptions underneath", () => {
  const { container } = render(<HomePage />);
  expect(container.querySelectorAll(".editorial-caption h3")).toHaveLength(10);
  expect(screen.getByRole("heading", { level: 3, name: "苏东坡带货增城荔枝" })).toBeInTheDocument();
  expect(screen.getByText("广州六榕寺文旅宣传片。")).toBeInTheDocument();
  expect(screen.getByText("增城荔枝创意广告。")).toBeInTheDocument();
});

it("reconstructs the hero layers inside one original-image coordinate canvas", () => {
  const { container } = render(<HomePage />);
  const canvas = container.querySelector(".hero-art-canvas");
  expect(canvas).toBeInTheDocument();
  expect(canvas?.querySelectorAll("[data-origin-layer]")).toHaveLength(6);
});

it("keeps the transition viewport without a full-hero copy mask or scroll prompt", () => {
  const { container } = render(<HomePage />);
  expect(container.querySelector(".hero-copy-mask")).not.toBeInTheDocument();
  expect(container.querySelector(".hero-art-viewport > .hero-art-canvas")).toBeInTheDocument();
  expect(screen.queryByText("向下展开画卷")).not.toBeInTheDocument();
  expect(screen.queryByText("宣传片、广告片与短剧项目。点击封面即可播放。")).not.toBeInTheDocument();
});

it("uses two split mist layers for the opening reveal", () => {
  const { container } = render(<HomePage />);
  expect(container.querySelectorAll(".hero-mist")).toHaveLength(2);
  expect(container.querySelectorAll(".hero-mist-half")).toHaveLength(4);
});

it("renders the about section with company information and services under the cases chapter", () => {
  const { container } = render(<HomePage />);
  expect(screen.getByRole("heading", { level: 2, name: "关于我们" })).toBeInTheDocument();
  expect(screen.getByText(/深圳市方直智胜科技有限公司系A股上市公司方直科技/)).toBeInTheDocument();
  expect(screen.getByText("深圳市方直智胜科技有限公司")).toBeInTheDocument();
  expect(screen.getAllByText("深圳市南山区南头街道马家龙社区大新路198号创新大厦B栋901").length).toBeGreaterThan(0);
  expect(screen.queryByText("粤ICP备2026044251号")).not.toBeInTheDocument();
  expect(screen.getByText("城市文旅 AI 宣传片")).toBeInTheDocument();
  expect(container.querySelector(".cases-chapter .compact-services")).toBeInTheDocument();
  expect(container.querySelector(".about-chapter .compact-services")).not.toBeInTheDocument();
  expect(screen.queryByText("从理解开始，到传播发生")).not.toBeInTheDocument();
  expect(screen.queryByText("需求沟通")).not.toBeInTheDocument();
  expect(container.querySelector(".about-landscape")).not.toBeInTheDocument();
});

it("renders every quote plan expanded without click-to-expand controls", () => {
  const { container } = render(<HomePage />);
  expect(container.querySelectorAll(".quote-plan-detail")).toHaveLength(3);
  expect(container.querySelectorAll(".quote-plans article > button")).toHaveLength(0);
  expect(screen.queryByText("lanyanfeng@fzzsedu.cn")).not.toBeInTheDocument();
  expect(screen.getAllByText("0755-86336966").length).toBeGreaterThan(0);
  expect(screen.getByAltText("万象元生微信咨询二维码")).toHaveAttribute("src", "/qrcode.png");
  expect(container.querySelector(".quote-contact")).not.toHaveTextContent("深圳市南山区南头街道马家龙社区大新路198号创新大厦B栋901");
  expect(container.querySelector(".quote-contact")).not.toHaveTextContent("互联网信息服务；人工智能技术研发；影视内容制作；软件开发");
});

it("keeps video navigation inside the opened case", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ url: "/video.mp4" }) })));
  render(<HomePage />);

  fireEvent.click(screen.getByRole("button", { name: "苏东坡与六榕寺封面" }));
  expect(screen.queryByRole("button", { name: "上一个视频" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "下一个视频" })).not.toBeInTheDocument();
  expect(screen.getByText("01 / 01")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "关闭案例" }));
  fireEvent.click(screen.getByRole("button", { name: "疯狂的荔枝封面" }));
  expect(screen.queryByRole("button", { name: "上一个视频" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "下一个视频" }));

  await waitFor(() => expect(screen.getByText("02 / 04")).toBeInTheDocument());
  expect(screen.getByRole("button", { name: "上一个视频" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "下一个视频" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "上一个视频" }).querySelector("svg")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "下一个视频" }).querySelector("svg")).toBeInTheDocument();
});
