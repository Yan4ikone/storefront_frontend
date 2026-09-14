"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useAuth, AuthApiError, getCustomerToken } from "@/lib/auth-context";
import { getMyOrders, type MyOrder } from "@/lib/auth-api";

const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  confirmed: "Подтверждён",
  done: "Выполнен",
  cancelled: "Отменён",
};

export default function AccountPage() {
  const router = useRouter();
  const { status, user, logout } = useAuth();
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    const token = getCustomerToken();
    if (!token) return;
    getMyOrders(token)
      .then(setOrders)
      .catch((e) =>
        setError(e instanceof AuthApiError ? e.message : "Не удалось загрузить заказы")
      );
  }, [status]);

  if (status === "checking") {
    return <p className="text-muted max-w-container mx-auto px-4 py-12">Загрузка…</p>;
  }

  if (status === "anonymous") {
    return (
      <main>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Личный кабинет" }]} />
        <div className="max-w-container mx-auto px-4 py-16 text-center">
          <p className="mb-4 text-muted">Чтобы посмотреть личный кабинет, войдите в аккаунт.</p>
          <Link
            href="/login"
            className="inline-block h-11 px-6 rounded-card bg-brand hover:bg-brand-dark text-white font-semibold leading-[44px]"
          >
            Войти
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Личный кабинет" }]} />

      <div className="max-w-container mx-auto px-4 py-12 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">{user?.name || "Личный кабинет"}</h1>
            <p className="text-muted text-sm">{user?.email || user?.phone}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="h-10 px-4 rounded-card border border-border hover:border-brand transition-colors text-sm font-semibold"
          >
            Выйти
          </button>
        </div>

        <div>
          <h2 className="font-semibold mb-4">Мои заказы</h2>

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          {orders === null ? (
            <p className="text-muted">Загрузка…</p>
          ) : orders.length === 0 ? (
            <p className="text-muted">Заказов пока нет.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="rounded-card border border-border bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <span className="text-sm text-muted">
                      {new Date(order.createdAt).toLocaleDateString("ru-RU")} ·{" "}
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                    <span className="font-semibold">
                      {order.itemsTotal.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                  <ul className="text-sm text-muted space-y-0.5">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.name} × {item.qty}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
