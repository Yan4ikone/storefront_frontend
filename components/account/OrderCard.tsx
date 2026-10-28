"use client";

// Карточка заказа в личном кабинете — общая для вкладки "Заказы" на /account
// (последние 4) и полного списка на /account/orders.

import { useState } from "react";
import { ImageOff } from "lucide-react";
import OrderProgress from "@/components/OrderProgress";
import { resolveImageUrl } from "@/lib/api";
import { getCustomerToken, AuthApiError } from "@/lib/auth-context";
import { cancelMyOrder, type MyOrder } from "@/lib/auth-api";

export default function OrderCard({
  order,
  onCancelled,
}: {
  order: MyOrder;
  onCancelled: (id: string, deleted: boolean) => void;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const cover = order.items.find((i) => i.product?.images?.length)?.product?.images[0];

  const canCancel = order.status !== "cancelled" && order.status !== "delivered" && !order.cancellationRequested;

  const handleCancel = async () => {
    const token = getCustomerToken();
    if (!token) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const result = await cancelMyOrder(token, order.id);
      onCancelled(order.id, result.deleted);
    } catch (e) {
      setCancelError(e instanceof AuthApiError ? e.message : "Не удалось отменить заказ");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="rounded-card border border-border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-surface flex items-center justify-center text-muted/50 shrink-0 overflow-hidden">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolveImageUrl(cover)} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageOff size={18} strokeWidth={1.5} />
            )}
          </div>
          <div>
            <p className="font-semibold text-sm">Заказ №{order.number}</p>
            <p className="text-xs text-muted">
              {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <span className="font-semibold">{order.itemsTotal.toLocaleString("ru-RU")} ₽</span>
      </div>

      <div className="max-w-xs mb-3">
        <OrderProgress status={order.status} cancellationRequested={order.cancellationRequested} compact />
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
        {canCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            {cancelling ? "Отменяем…" : "Отменить заказ"}
          </button>
        )}
      </div>
      {cancelError && <p className="text-xs text-red-600 mt-2">{cancelError}</p>}
    </div>
  );
}
