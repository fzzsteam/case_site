import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

it("renders the primary heading", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { level: 1, name: /重新定义\s*文旅表达/ })).toBeInTheDocument();
});
