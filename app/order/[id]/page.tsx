import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getOrder } from "@/lib/api";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

const DELIVERY_LABEL: Record<string, string> = {
  pickup: "Самовывоз из магазина",
  courier: "Курьер / транспортная компания",
};

export const metadata: Metadata = {
  title: "Заказ оформлен — МобДетали",
};

export default async function OrderPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);
  if (!order) notFound();

  return (
    <main>
      <Breadcrumbs
        items={[{ label: "Главная", href: "/" }, { label: `Заказ №${order.id.slice(0, 8)}` }]}
      />

      <div className="max-w-container mx-auto px-4 py-8 max-w-2xl">
        <div className="rounded-card border border-border bg-white p-6 sm:p-8 text-center mb-6">
          <CheckCircle2 size={44} className="mx-auto text-green-600 mb-3" strokeWidth={1.5} />
          <h1 className="text-xl font-bold mb-1">Заказ №{order.id.slice(0, 8)} принят</h1>
          <p className="text-sm text-muted">
            Спасибо, {order.customerName}! Мы свяжемся с вами по телефону {order.phone}
            {" "}
            для подтверждения и оплаты.
          </p>
        </div>

        <div className="rounded-card border border-border bg-white p-5 mb-6">
          <p className="font-semibold mb-3">Состав заказа</p>
          <div className="divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium leading-snug">{item.name}</p>
                  <p className="text-xs text-muted">
                    {item.qty} × {formatPrice(item.price)}
                  </p>
                </div>
                <p className="font-semibold whitespace-nowrap">
                  {formatPrice(item.price * item.qty)}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-muted">Итого</span>
            <span className="text-xl font-bold">{formatPrice(order.itemsTotal)}</span>
          </div>
        </div>

        <div className="rounded-card border border-border bg-white p-5 mb-6 text-sm space-y-1.5">
          <p>
            <span className="text-muted">Получение: </span>
            {DELIVERY_LABEL[order.deliveryMethod] ?? order.deliveryMethod}
          </p>
          {order.address && (
            <p>
              <span className="text-muted">Адрес: </span>
              {order.address}
            </p>
          )}
          {order.comment && (
            <p>
              <span className="text-muted">Комментарий: </span>
              {order.comment}
            </p>
          )}
        </div>

        <Link
          href="/catalog"
          className="inline-block bg-brand hover:bg-brand-dark transition-colors text-white font-semibold rounded-card px-6 py-3"
        >
          Вернуться в каталог
        </Link>
      </div>
    </main>
  );
}
