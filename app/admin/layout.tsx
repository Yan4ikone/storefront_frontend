"use client";

// Обёртка для всех страниц /admin/**: показывает форму входа (обычный
// email/телефон + пароль — тот же вход, что и у покупателей, см.
// backend/src/auth), а после входа — боковую навигацию админки. Доступ к
// самой админке даёт только роль admin/manager (проверяется на бэкенде,
// см. lib/admin-api.ts verifyAdminSession/adminLogin).

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Folder, Package, ShoppingBag, BarChart3, LogOut } from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth";
import { AdminApiError } from "@/lib/admin-api";

function LoginForm() {
  const { login } = useAdminAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier.trim(), password);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Не удалось войти");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-card border border-border bg-white p-6 space-y-4"
      >
        <h1 className="text-lg font-bold">Вход в админку</h1>
        <div>
          <label className="block text-sm font-medium mb-1.5">Email или телефон</label>
          <input
            type="text"
            autoFocus
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || !identifier || !password}
          className="w-full h-11 rounded-card bg-brand hover:bg-brand-dark disabled:opacity-50 transition-colors text-white font-semibold"
        >
          {loading ? "Проверяем…" : "Войти"}
        </button>
      </form>
    </div>
  );
}

const NAV_ITEMS = [
  { href: "/admin", label: "Обзор", icon: LayoutGrid },
  { href: "/admin/categories", label: "Разделы", icon: Folder },
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/orders", label: "Заказы", icon: ShoppingBag },
  { href: "/admin/reports", label: "Отчёты", icon: BarChart3 },
];

function AdminShell({ children }: { children: ReactNode }) {
  const { status, user, logout } = useAdminAuth();
  const pathname = usePathname();

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">
        Загрузка…
      </div>
    );
  }

  if (status === "anonymous") {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="w-56 shrink-0 bg-brand-dark text-white flex flex-col">
        <div className="px-5 py-5 text-lg font-extrabold border-b border-white/10">
          МобДетали · Админка
        </div>
        <nav className="flex-1 py-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-white/10 text-white font-semibold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-3 text-xs text-white/60 border-t border-white/10 truncate">
          {user?.name || user?.email || user?.phone} ·{" "}
          {user?.role === "admin" ? "Администратор" : "Менеджер"}
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 px-5 py-4 text-sm text-white/70 hover:text-white border-t border-white/10"
        >
          <LogOut size={18} />
          Выйти
        </button>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
