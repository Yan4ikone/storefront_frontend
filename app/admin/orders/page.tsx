"use client";

import { useEffect, useState } from "react";
import {
  getOrders,
  updateOrderStatus,
  AdminApiError,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type AdminOrder,
  type OrderStatus,
} from "@/lib/admin-api";

const STATUS_STYLES: Record<OrderStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  confirmed: "bg-amber-100 text-amber-700",
  done: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

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
            const status = order.status as OrderStatus;
            return (
              <div
                key={order.id}
                className="rounded-card border border-border bg-white overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="w-full flex flex-wrap items-center gap-4 px-4 py-3.5 text-left"
                >
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      STATUS_STYLES[status] ?? "bg-surface text-muted"
                    }`}
                  >
                    {ORDER_STATUS_LABELS[status] ?? order.status}
                  </span>
                  <span className="font-medium">{order.customerName}</span>
                  <span className="text-muted text-sm">{order.phone}</span>
                  <span className="text-muted text-sm">{formatDate(order.createdAt)}</span>
                  <span className="ml-auto font-semibold">
                    {order.itemsTotal.toLocaleString("ru-RU")} ₽
                  </span>
                </button>

                {expanded && (
                  <div className="border-t border-border px-4 py-4 space-y-4 text-sm">
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
                            </span>
                            <span className="font-medium">
                              {(item.price * item.qty).toLocaleString("ru-RU")} ₽
                            </span>
                          </li>
                        ))}
                      </ul>
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
