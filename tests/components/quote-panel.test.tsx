import { render, screen } from "@testing-library/react";
import { QuotePanel } from "@/components/home/quote-panel";

it("renders every quote plan expanded without click-to-expand controls", () => {
  const { container } = render(<QuotePanel />);
  expect(container.querySelectorAll(".quote-plan-detail")).toHaveLength(3);
  expect(container.querySelectorAll(".quote-plans article > button")).toHaveLength(0);
  expect(screen.queryByText("lanyanfeng@fzzsedu.cn")).not.toBeInTheDocument();
  expect(screen.getAllByText("0755-86336966").length).toBeGreaterThan(0);
  expect(screen.getByAltText("万象元生微信咨询二维码")).toHaveAttribute("src", "/qrcode.png");
  expect(container.querySelector(".quote-contact")).not.toHaveTextContent("深圳市南山区南头街道马家龙社区大新路198号创新大厦B栋901");
  expect(container.querySelector(".quote-contact")).not.toHaveTextContent("互联网信息服务；人工智能技术研发；影视内容制作；软件开发");
});
