import type { Metadata } from "next";
import "./admin.css";
import { ToastProvider } from "@/components/admin/toast";

export const metadata: Metadata = { title: "管理后台", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="admin-root">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
