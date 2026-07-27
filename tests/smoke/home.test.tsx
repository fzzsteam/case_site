import { render, screen } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import HomePage from "@/app/(site)/page";
import { slugify } from "@/lib/cases/slug";

vi.mock("@/lib/cases/queries", async () => {
  const { seedCases } = await import("@/lib/cases/seed-data");
  const { slugify } = await import("@/lib/cases/slug");
  const mockCases = seedCases.map((item, index) => ({
    ...item,
    id: `case-${index}`,
    slug: slugify(item.title),
    createdAt: new Date("2026-01-01"),
    episodes: item.episodes.map((episode, episodeIndex) => ({ ...episode, id: `case-${index}-episode-${episodeIndex}`, durationSeconds: null })),
  }));
  return { listCases: () => Promise.resolve(mockCases) };
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("renders the primary heading", async () => {
  render(await HomePage());
  expect(screen.getByRole("heading", { level: 1, name: /重新定义\s*文旅表达/ })).toBeInTheDocument();
});

it("shows case titles with project descriptions underneath", async () => {
  const { container } = render(await HomePage());
  expect(container.querySelectorAll(".editorial-caption h3")).toHaveLength(11);
  expect(screen.getByRole("heading", { level: 3, name: "苏东坡带货增城荔枝" })).toBeInTheDocument();
  expect(screen.getByText("广州六榕寺文旅宣传片。")).toBeInTheDocument();
  expect(screen.getByText("增城荔枝创意广告。")).toBeInTheDocument();
});

it("reconstructs the hero layers inside one original-image coordinate canvas", async () => {
  const { container } = render(await HomePage());
  const canvas = container.querySelector(".hero-art-canvas");
  expect(canvas).toBeInTheDocument();
  expect(canvas?.querySelectorAll("[data-origin-layer]")).toHaveLength(6);
});

it("keeps the transition viewport without a full-hero copy mask or scroll prompt", async () => {
  const { container } = render(await HomePage());
  expect(container.querySelector(".hero-copy-mask")).not.toBeInTheDocument();
  expect(container.querySelector(".hero-art-viewport > .hero-art-canvas")).toBeInTheDocument();
  expect(screen.queryByText("向下展开画卷")).not.toBeInTheDocument();
  expect(screen.queryByText("宣传片、广告片与短剧项目。点击封面即可播放。")).not.toBeInTheDocument();
});

it("uses two split mist layers for the opening reveal", async () => {
  const { container } = render(await HomePage());
  expect(container.querySelectorAll(".hero-mist")).toHaveLength(2);
  expect(container.querySelectorAll(".hero-mist-half")).toHaveLength(4);
});

it("renders the about section with company information and services under the about chapter", async () => {
  const { container } = render(await HomePage());
  expect(screen.getByRole("heading", { level: 2, name: "关于我们" })).toBeInTheDocument();
  expect(screen.getByText(/深圳市方直智胜科技有限公司系A股上市公司方直科技/)).toBeInTheDocument();
  expect(screen.getByText("深圳市方直智胜科技有限公司")).toBeInTheDocument();
  expect(screen.getAllByText("深圳市南山区南头街道马家龙社区大新路198号创新大厦B栋901").length).toBeGreaterThan(0);
  expect(screen.queryByText("粤ICP备2026044251号")).not.toBeInTheDocument();
  expect(screen.getByText("城市文旅 AI 宣传片")).toBeInTheDocument();
  expect(container.querySelector(".about-chapter .about-services")).toBeInTheDocument();
  expect(container.querySelector(".cases-chapter .about-services")).not.toBeInTheDocument();
  expect(container.querySelector(".closing-cta-layout")?.firstElementChild).toHaveClass("about-services");
  expect(container.querySelector(".closing-cta-layout")?.lastElementChild).toHaveClass("closing-cta-content");
  expect(container.querySelector(".closing-cta-content .cta-rule")).not.toBeInTheDocument();
  expect(screen.queryByText("CONTACT")).not.toBeInTheDocument();
  expect(screen.queryByText("从理解开始，到传播发生")).not.toBeInTheDocument();
  expect(screen.queryByText("需求沟通")).not.toBeInTheDocument();
  expect(container.querySelector(".about-landscape")).not.toBeInTheDocument();
});

it("links case covers straight to their detail pages instead of playing inline", async () => {
  render(await HomePage());
  const cover = screen.getByRole("link", { name: "苏东坡与六榕寺封面" });
  expect(cover).toHaveAttribute("href", `/cases/${slugify("苏东坡与六榕寺")}`);
  expect(screen.getByRole("link", { name: "查看全部案例" })).toHaveAttribute("href", "/cases");
});
