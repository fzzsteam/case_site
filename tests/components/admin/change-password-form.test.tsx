import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { ToastProvider } from "@/components/admin/toast";

function renderForm() {
  return render(<ToastProvider><ChangePasswordForm /></ToastProvider>);
}

afterEach(() => vi.unstubAllGlobals());

it("validates required fields before submitting", async () => {
  vi.stubGlobal("fetch", vi.fn());
  renderForm();
  fireEvent.click(screen.getByRole("button", { name: "保存" }));
  expect(await screen.findByText("请填写当前密码")).toBeInTheDocument();
  expect(screen.getByText("新密码至少 8 位")).toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});

it("rejects mismatched password confirmation", async () => {
  vi.stubGlobal("fetch", vi.fn());
  renderForm();
  fireEvent.change(screen.getByLabelText("当前密码"), { target: { value: "old-password" } });
  fireEvent.change(screen.getByLabelText("新密码"), { target: { value: "new-password-1" } });
  fireEvent.change(screen.getByLabelText("确认新密码"), { target: { value: "new-password-2" } });
  fireEvent.click(screen.getByRole("button", { name: "保存" }));
  expect(await screen.findByText("两次输入的新密码不一致")).toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});

it("submits and shows a success toast on a valid change", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) })));
  renderForm();
  fireEvent.change(screen.getByLabelText("当前密码"), { target: { value: "old-password" } });
  fireEvent.change(screen.getByLabelText("新密码"), { target: { value: "new-password-1" } });
  fireEvent.change(screen.getByLabelText("确认新密码"), { target: { value: "new-password-1" } });
  fireEvent.click(screen.getByRole("button", { name: "保存" }));
  await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/admin/change-password", expect.objectContaining({ method: "POST" })));
  expect(await screen.findByText("密码已修改")).toBeInTheDocument();
});

it("shows an error when the current password is incorrect", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 401, json: async () => ({ error: "Current password is incorrect" }) })));
  renderForm();
  fireEvent.change(screen.getByLabelText("当前密码"), { target: { value: "wrong-password" } });
  fireEvent.change(screen.getByLabelText("新密码"), { target: { value: "new-password-1" } });
  fireEvent.change(screen.getByLabelText("确认新密码"), { target: { value: "new-password-1" } });
  fireEvent.click(screen.getByRole("button", { name: "保存" }));
  expect(await screen.findByText("当前密码不正确")).toBeInTheDocument();
});
