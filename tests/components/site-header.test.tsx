import { fireEvent, render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/layout/site-header";
it("opens the mobile navigation", () => { render(<SiteHeader/>); expect(screen.getByAltText("万象元生")).toHaveAttribute("src", "/brand/logo.png"); fireEvent.click(screen.getByRole("button", {name:"打开菜单"})); expect(screen.getByRole("navigation")).toHaveClass("open"); expect(screen.getByRole("link", {name:"案例"})).toHaveAttribute("href","/cases"); expect(screen.getByRole("button", {name:"获取方案"})).toBeInTheDocument(); });
