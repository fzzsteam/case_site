import { fireEvent, render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/layout/site-header";
it("opens the mobile navigation", () => { render(<SiteHeader/>); fireEvent.click(screen.getByRole("button", {name:"打开菜单"})); expect(screen.getByRole("navigation")).toHaveClass("open"); expect(screen.getByRole("link", {name:"联系我们"})).toHaveAttribute("href","/contact"); });
