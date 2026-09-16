"use client";

// Личный кабинет покупателя — разбит на вкладки "Профиль" и "История
// заказов" (раньше заказы шли просто отдельным блоком под данными профиля на
// одной странице). Вкладка заказов показывает и текущий статус, и прошедшие
// заказы — сам список уже приходил с бэкенда (GET /users/me/orders), здесь
// только статус получил цветной бейдж с иконкой для более наглядного
// отслеживания.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useAuth, AuthApiError, getCustomerToken } from "@/lib/auth-context";
import { getMyOrders, type MyOrder } from "@/lib/auth-api";
import { User, History, Clock, Package, CircleCheck, CircleX } from "lucide-react";

type LucideIconType = typeof Clock;

const STATUS_META: Record<string, { label: string; icon: LucideIconType; className: string }> = {
  new: { label: "Новый", icon: Clock, className: "text-blue-700 bg-blue-50" },
  confirmed: { label: "Подтверждён", icon: Package, className: "text-amber-700 bg-amber-50" },
  done: { label: "Выполнен", icon: CircleCheck, className: "text-green-700 bg-green-50" },
  cancelled: { label: "Отменён", icon: CircleX, className: "text-red-700 bg-red-50" },
};

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? {
    label: status,
    icon: Clock,
    className: "text-muted bg-surface",
  };
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${meta.className}`}
    >
      <Icon size={13} strokeWidth={2} />
      {meta.label}
    </span>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { status, user, logout } = useAuth();
  const [tab, setTab] = useState<"profile" | "orders">("profile");
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

  const ordersCount = orders?.length ?? null;

  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Личный кабинет" }]} />

      <div className="max-w-container mx-auto px-4 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
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

        <div className="flex items-center gap-1 border-b border-border mb-6">
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              tab === "profile"
                ? "border-brand text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <User size={15} />
            Профиль
          </button>
          <button
            type="button"
            onClick={() => setTab("orders")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              tab === "orders"
                ? "border-brand text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <History size={15} />
            История заказов
            {ordersCount != null && (
              <span className="text-xs text-muted bg-surface px-1.5 py-0.5 rounded-full">
                {ordersCount}
              </span>
            )}
          </button>
        </div>

        {tab === "profile" ? (
          <div className="rounded-card border border-border bg-white p-6 max-w-md">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Имя</dt>
                <dd className="font-medium">{user?.name || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Email</dt>
                <dd className="font-medium">{user?.email || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Телефон</dt>
                <dd className="font-medium">{user?.phone || "—"}</dd>
              </div>
            </dl>
          </div>
        ) : (
          <div>
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            {orders === null ? (
              <p className="text-muted">Загрузка…</p>
            ) : orders.length === 0 ? (
              <p className="text-muted">Заказов пока нет.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-card border border-border bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <span className="text-sm text-muted">
                        {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <ul className="text-sm text-muted space-y-0.5 mb-3">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.name} × {item.qty}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <span className="text-xs text-muted">
                        {order.deliveryMethod === "pickup" ? "Самовывоз" : "Доставка"}
                        {order.address ? ` · ${order.address}` : ""}
                      </span>
                      <span className="font-semibold">
                        {order.itemsTotal.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
