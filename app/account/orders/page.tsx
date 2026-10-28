"use client";

// Полный список заказов покупателя — отдельная страница, чтобы вкладка
// "Заказы" в /account оставалась короткой (последние 4) и не приходилось
// листать вниз среди всех заказов.

import { useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import OrderCard from "@/components/account/OrderCard";
import { useAuth, AuthApiError, getCustomerToken } from "@/lib/auth-context";
import { getMyOrders, type MyOrder } from "@/lib/auth-api";

export default function AllOrdersPage() {
  const { status } = useAuth();
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    const token = getCustomerToken();
    if (!token) return;
    getMyOrders(token)
      .then(setOrders)
      .catch((e) => setError(e instanceof AuthApiError ? e.message : "Не удалось загрузить заказы"));
  }, [status]);

  const handleOrderCancelled = (id: string, deleted: boolean) => {
    setOrders((prev) =>
      prev
        ? deleted
          ? prev.filter((o) => o.id !== id)
          : prev.map((o) => (o.id === id ? { ...o, cancellationRequested: true } : o))
        : prev
    );
  };

  if (status === "checking") {
    return <p className="text-muted max-w-container mx-auto px-4 py-12">Загрузка…</p>;
  }

  if (status === "anonymous") {
    return (
      <main>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Личный кабинет", href: "/account" }, { label: "Все заказы" }]} />
        <div className="max-w-container mx-auto px-4 py-16 text-center">
          <p className="mb-4 text-muted">Чтобы посмотреть заказы, войдите в аккаунт.</p>
          <Link href="/login" className="inline-block h-11 px-6 rounded-card bg-brand hover:bg-brand-dark text-white font-semibold leading-[44px]">
            Войти
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Личный кабинет", href: "/account" }, { label: "Все заказы" }]} />

      <div className="max-w-container mx-auto px-4 py-12">
        <h1 className="text-xl font-bold mb-6">Все заказы</h1>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {orders === null ? (
          <p className="text-muted">Загрузка…</p>
        ) : orders.length === 0 ? (
          <p className="text-muted">Заказов пока нет.</p>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onCancelled={handleOrderCancelled} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
