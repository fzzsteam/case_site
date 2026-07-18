import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminLoginPage from "@/app/admin/login/page";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

function stubFetch({ initialPassword, login }: { initialPassword: string | null; login: { ok: boolean; body: unknown } }) {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url === "/api/admin/initial-password") return { ok: true, json: async () => ({ password: initialPassword }) };
    if (url === "/api/admin/login") return { ok: login.ok, json: async () => login.body };
    return { ok: false, json: async () => ({}) };
  }));
}

beforeEach(() => {
  push.mockClear();
  refresh.mockClear();
});

afterEach(() => vi.unstubAllGlobals());

it("redirects to the case list on a successful login", async () => {
  stubFetch({ initialPassword: null, login: { ok: true, body: { ok: true } } });
  render(<AdminLoginPage />);
  fireEvent.change(screen.getByLabelText("密码"), { target: { value: "correct-password" } });
  fireEvent.click(screen.getByRole("button", { name: "登录" }));
  await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/cases"));
});

it("shows an error message on a wrong password without redirecting", async () => {
  stubFetch({ initialPassword: null, login: { ok: false, body: { error: "Incorrect password" } } });
  render(<AdminLoginPage />);
  fireEvent.change(screen.getByLabelText("密码"), { target: { value: "wrong" } });
  fireEvent.click(screen.getByRole("button", { name: "登录" }));
  expect(await screen.findByText("密码不正确")).toBeInTheDocument();
  expect(push).not.toHaveBeenCalled();
});

it("shows the initial password banner when the password has not been changed", async () => {
  stubFetch({ initialPassword: "Ab3xY9pQ7z1K", login: { ok: true, body: { ok: true } } });
  render(<AdminLoginPage />);
  expect(await screen.findByText("Ab3xY9pQ7z1K")).toBeInTheDocument();
  expect(screen.getByText("初始密码")).toBeInTheDocument();
});

it("hides the initial password banner once the password has been changed", async () => {
  stubFetch({ initialPassword: null, login: { ok: true, body: { ok: true } } });
  render(<AdminLoginPage />);
  await screen.findByRole("button", { name: "登录" });
  expect(screen.queryByText("初始密码")).not.toBeInTheDocument();
});
