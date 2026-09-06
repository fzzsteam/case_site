import { fireEvent, render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/layout/site-header";

it("renders the endorsed brand lockup and opens the mobile navigation", () => {
  render(<SiteHeader />);

  const homeLink = screen.getByRole("link", { name: "方直智胜旗下品牌万象元生" });
  expect(homeLink).toHaveAttribute("href", "/");
  expect(homeLink.querySelector('img[src="/edu/fangzhi-zhisheng-lockup.png"]')).toBeTruthy();
  expect(screen.getByAltText("万象元生")).toHaveAttribute("src", "/brand/logo.png");

  fireEvent.click(screen.getByRole("button", { name: "打开菜单" }));

  expect(screen.getByRole("navigation")).toHaveClass("open");
  expect(screen.getByRole("link", { name: "案例" })).toHaveAttribute("href", "/cases");
  expect(screen.getByRole("button", { name: "获取方案" })).toBeInTheDocument();
});
