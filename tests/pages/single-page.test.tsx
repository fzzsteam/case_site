import { render, screen } from "@testing-library/react";
import HomePage from "@/app/(site)/page";

vi.mock("@/components/home/home-experience", () => ({
  HomeExperience: () => <><section id="home"><h1>用 AIGC 重新定义文旅表达</h1></section><section id="cases"><h2>让作品，替我们表达</h2></section><section id="about"><h2>技术只是笔墨，文化才是灵魂</h2><p>城市文旅 AI 宣传片</p></section><button>获取方案与报价</button></>,
}));

vi.mock("@/lib/cases/queries", () => ({ listCases: vi.fn().mockResolvedValue([]) }));

it("renders the three continuous chapters", async () => {
  render(await HomePage());
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("重新定义文旅表达");
  expect(screen.getByText("让作品，替我们表达")).toBeInTheDocument();
  expect(screen.getByText("城市文旅 AI 宣传片")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "获取方案与报价" })).toBeInTheDocument();
});
