import { render, screen } from "@testing-library/react";
import ContactPage from "@/app/contact/page";
vi.mock("motion/react", () => ({ motion: new Proxy({}, { get: () => (props: any) => <div {...props} /> }), useReducedMotion: () => true, useScroll: () => ({ scrollYProgress: 0 }), useTransform: () => 0 }));
it("renders all agreed prices and the real QR image", () => { render(<ContactPage/>); expect(screen.getByText("包月 1.5 万起")).toBeInTheDocument(); expect(screen.getByText("全案 3 万起")).toBeInTheDocument(); expect(screen.getByAltText("万象元生微信咨询二维码")).toHaveAttribute("src", "/brand/wechat-qr.png"); });
