import { render, screen } from "@testing-library/react";
import { SiteFooter } from "@/components/layout/site-footer";

it("renders only copyright and filing information in the footer", () => {
  render(<SiteFooter />);

  expect(screen.getByText(/© 2026 深圳市方直智胜科技有限公司/)).toBeInTheDocument();
  expect(screen.queryByText("专注文旅数字化 · 赋能文化新未来")).not.toBeInTheDocument();
  expect(screen.queryByText("lanyanfeng@fzzsedu.cn")).not.toBeInTheDocument();
  expect(screen.queryByText("0755-86336966")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "粤ICP备2026044251号" })).toHaveAttribute("href", "https://www.miit.gov.cn/index.html");
});
