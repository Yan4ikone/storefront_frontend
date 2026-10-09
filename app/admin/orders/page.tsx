"use client";

import { useEffect, useState } from "react";
import OrderProgress from "@/components/OrderProgress";
import {
  getOrders,
  updateOrderStatus,
  resolveCancellation,
  AdminApiError,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type AdminOrder,
  type OrderStatus,
} from "@/lib/admin-api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = () => {
    getOrders()
      .then(setOrders)
      .catch((e) =>
        setError(e instanceof AdminApiError ? e.message : "Не удалось загрузить заказы")
      );
  };

  useEffect(load, []);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    setUpdatingId(id);
    setError(null);
    try {
      const updated = await updateOrderStatus(id, status);
      setOrders((prev) => prev?.map((o) => (o.id === id ? updated : o)) ?? null);
    } catch (e) {
      setError(e instanceof AdminApiError ? e.message : "Не удалось обновить статус");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResolveCancellation = async (id: string, approve: boolean) => {
    setUpdatingId(id);
    setError(null);
    try {
      const updated = await resolveCancellation(id, approve);
      setOrders((prev) => prev?.map((o) => (o.id === id ? updated : o)) ?? null);
    } catch (e) {
      setError(e instanceof AdminApiError ? e.message : "Не удалось обработать запрос на отмену");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Заказы</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {orders === null ? (
        <p className="text-muted">Загрузка…</p>
      ) : orders.length === 0 ? (
        <p className="text-muted">Заказов пока нет.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const expanded = expandedId === order.id;
            return (
              <div
                key={order.id}
                className={`rounded-card border bg-white overflow-hidden ${
                  order.cancellationRequested ? "border-amber-300" : "border-border"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="w-full flex flex-wrap items-center gap-4 px-4 py-3.5 text-left"
                >
                  <span className="font-semibold text-sm w-16 shrink-0">№{order.number}</span>
                  <div className="w-40 shrink-0">
                    <OrderProgress status={order.status} cancellationRequested={order.cancellationRequested} compact />
                  </div>
                  <span className="font-medium">{order.customerName}</span>
                  <span className="text-muted text-sm">{order.phone}</span>
                  <span className="text-muted text-sm">{formatDate(order.createdAt)}</span>
                  <span className="ml-auto font-semibold">
                    {order.itemsTotal.toLocaleString("ru-RU")} ₽
                  </span>
                </button>

                {expanded && (
                  <div className="border-t border-border px-4 py-4 space-y-4 text-sm">
                    {order.cancellationRequested && (
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-2.5">
                        <p className="text-amber-800 font-medium">
                          Покупатель попросил отменить этот заказ
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => handleResolveCancellation(order.id, true)}
                            className="h-8 px-3 rounded-card bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold"
                          >
                            Подтвердить отмену
                          </button>
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => handleResolveCancellation(order.id, false)}
                            className="h-8 px-3 rounded-card border border-border hover:border-brand disabled:opacity-50 text-xs font-semibold"
                          >
                            Отклонить
                          </button>
                        </div>
                      </div>
                    )}

                    {order.groupId && (
                      <p className="text-xs text-muted">
                        Часть раздельного заказа (общая покупка с другим заказом, groupId:{" "}
                        {order.groupId.slice(0, 8)}…).
                      </p>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p>
                          <span className="text-muted">Телефон:</span> {order.phone}
                        </p>
                        {order.email && (
                          <p>
                            <span className="text-muted">Email:</span> {order.email}
                          </p>
                        )}
                        <p>
                          <span className="text-muted">Доставка:</span>{" "}
                          {order.deliveryMethod === "courier" ? "Курьер/ТК" : "Самовывоз"}
                        </p>
                        {order.address && (
                          <p>
                            <span className="text-muted">Адрес:</span> {order.address}
                          </p>
                        )}
                        {order.comment && (
                          <p>
                            <span className="text-muted">Комментарий:</span> {order.comment}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-muted mb-1.5">Статус</label>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          disabled={updatingId === order.id}
                          className="rounded-card border border-border px-3 py-2 text-sm outline-none focus:border-brand bg-white disabled:opacity-50"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {ORDER_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <p className="text-muted mb-1.5">Состав заказа</p>
                      <ul className="divide-y divide-border rounded-card border border-border overflow-hidden">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex justify-between px-3 py-2">
                            <span>
                              {item.name} × {item.qty}
                              <span
                                className={`ml-2 text-[11px] font-medium px-1.5 py-0.5 rounded-full ${
                                  item.inStock ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {item.inStock ? "в наличии" : "под заказ"}
                              </span>
                            </span>
                            <span className="font-medium">
                              {(item.price * item.qty).toLocaleString("ru-RU")} ₽
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-between px-1 pt-2 font-semibold">
                        <span>Итого</span>
                        <span>{order.itemsTotal.toLocaleString("ru-RU")} ₽</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
