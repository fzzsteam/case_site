import { render, screen } from "@testing-library/react";
import { InkLandscape } from "@/components/ink/ink-landscape";
vi.mock("motion/react", () => ({ motion: new Proxy({}, { get: () => ({ children, ...props }: any) => <div {...props}>{children}</div> }), useReducedMotion: () => true, useScroll: () => ({ scrollYProgress: 0 }), useTransform: () => 0 }));
it("keeps hero copy visible when motion is reduced", () => { const { container } = render(<InkLandscape preset="reveal"><h1>联系合作</h1></InkLandscape>); expect(screen.getByRole("heading", {name:"联系合作"})).toBeVisible(); expect(container.querySelector("[data-motion='reduced']")).toBeInTheDocument(); });
