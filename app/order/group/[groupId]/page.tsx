import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import OrderProgress from "@/components/OrderProgress";
import { getOrderGroup } from "@/lib/api";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

const DELIVERY_LABEL: Record<string, string> = {
  pickup: "Самовывоз из магазина",
  courier: "Курьер / транспортная компания",
};

export const metadata: Metadata = {
  title: "Заказы оформлены — ScreenHub",
};

// Страница подтверждения для случая, когда покупатель на чекауте выбрал
// "оформить раздельно" — товары "в наличии" и "под заказ" стали двумя
// заказами с общим groupId (см. OrdersService.create на бэкенде).
export default async function OrderGroupPage({ params }: { params: { groupId: string } }) {
  const orders = await getOrderGroup(params.groupId);
  if (!orders || orders.length === 0) notFound();

  const grandTotal = orders.reduce((sum, o) => sum + o.itemsTotal, 0);

  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Ваши заказы" }]} />

      <div className="max-w-container mx-auto px-4 py-8 max-w-2xl">
        <div className="rounded-card border border-border bg-white p-6 sm:p-8 text-center mb-6">
          <CheckCircle2 size={44} className="mx-auto text-green-600 mb-3" strokeWidth={1.5} />
          <h1 className="text-xl font-bold mb-1">
            {orders.length} заказа оформлены на сумму {formatPrice(grandTotal)}
          </h1>
          <p className="text-sm text-muted">
            Спасибо, {orders[0].customerName}! Товары разделены на отдельные заказы по наличию —
            мы свяжемся с вами по телефону {orders[0].phone} для подтверждения.
          </p>
        </div>

        <div className="space-y-5">
          {orders.map((order) => {
            const allInStock = order.items.every((i) => i.inStock);
            return (
              <div key={order.id} className="rounded-card border border-border bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold">Заказ №{order.number}</p>
                    <span
                      className={`inline-block mt-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full ${
                        allInStock ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {allInStock ? "В наличии" : "Под заказ"}
                    </span>
                  </div>
                  <Link href={`/order/${order.id}`} className="text-sm text-brand hover:text-brand-dark font-medium">
                    Открыть отдельно
                  </Link>
                </div>

                <div className="max-w-xs mb-4">
                  <OrderProgress status={order.status} compact />
                </div>

                <div className="divide-y divide-border">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-2 flex items-center justify-between gap-3 text-sm">
                      <p className="font-medium leading-snug">
                        {item.name} × {item.qty}
                      </p>
                      <p className="font-semibold whitespace-nowrap">
                        {formatPrice(item.price * item.qty)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-muted text-sm">Итого по заказу</span>
                  <span className="text-lg font-bold">{formatPrice(order.itemsTotal)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-card border border-border bg-white p-5 mt-5 text-sm space-y-1.5">
          <p>
            <span className="text-muted">Получение: </span>
            {DELIVERY_LABEL[orders[0].deliveryMethod] ?? orders[0].deliveryMethod}
          </p>
          {orders[0].address && (
            <p>
              <span className="text-muted">Адрес: </span>
              {orders[0].address}
            </p>
          )}
        </div>

        <Link
          href="/catalog"
          className="inline-block bg-brand hover:bg-brand-dark transition-colors text-white font-semibold rounded-card px-6 py-3 mt-6"
        >
          Вернуться в каталог
        </Link>
      </div>
    </main>
  );
}
