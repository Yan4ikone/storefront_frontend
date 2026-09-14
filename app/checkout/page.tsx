"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useCart } from "@/lib/cart-context";
import { createOrder, OrderApiError, type DeliveryMethod } from "@/lib/api";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clear } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const order = await createOrder({
        customerName,
        phone,
        email: email.trim() ? email.trim() : undefined,
        deliveryMethod,
        address: deliveryMethod === "courier" ? address : undefined,
        comment: comment.trim() ? comment.trim() : undefined,
        items: items.map((item) => ({ productSlug: item.slug, qty: item.qty })),
      });
      clear();
      router.push(`/order/${order.id}`);
    } catch (err) {
      setError(
        err instanceof OrderApiError
          ? err.message
          : "Не удалось оформить заказ. Попробуйте ещё раз."
      );
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main>
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Корзина", href: "/cart" },
            { label: "Оформление заказа" },
          ]}
        />
        <div className="max-w-container mx-auto px-4 py-8">
          <div className="rounded-card border border-border bg-white p-10 text-center">
            <p className="font-semibold mb-1">Корзина пуста</p>
            <p className="text-sm text-muted mb-5">
              Добавьте товары из каталога, чтобы оформить заказ.
            </p>
            <Link
              href="/catalog"
              className="inline-block bg-brand hover:bg-brand-dark transition-colors text-white font-semibold rounded-card px-6 py-3"
            >
              Перейти в каталог
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Корзина", href: "/cart" },
          { label: "Оформление заказа" },
        ]}
      />

      <div className="max-w-container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Оформление заказа</h1>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
          <form
            onSubmit={handleSubmit}
            className="rounded-card border border-border bg-white p-5 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="customerName">
                Имя *
              </label>
              <input
                id="customerName"
                type="text"
                required
                minLength={2}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="phone">
                  Телефон *
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  minLength={5}
                  placeholder="+7 (___) ___-__-__"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="email">
                  Email (необязательно)
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </div>
            </div>

            <div>
              <p className="block text-sm font-medium mb-1.5">Способ получения *</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={deliveryMethod === "pickup"}
                    onChange={() => setDeliveryMethod("pickup")}
                    className="accent-brand"
                  />
                  Самовывоз из магазина
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={deliveryMethod === "courier"}
                    onChange={() => setDeliveryMethod("courier")}
                    className="accent-brand"
                  />
                  Курьер / транспортная компания
                </label>
              </div>
            </div>

            {deliveryMethod === "courier" && (
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="address">
                  Адрес доставки *
                </label>
                <input
                  id="address"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <p className="text-xs text-muted mt-1.5">
                  Точную стоимость и сроки доставки уточнит менеджер при звонке —
                  расчёт через транспортные компании появится позже.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="comment">
                Комментарий к заказу
              </label>
              <textarea
                id="comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand resize-none"
              />
            </div>

            <p className="text-xs text-muted">
              Оплата — при получении. Онлайн-оплата подключится отдельным этапом.
            </p>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-card bg-brand hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-white font-semibold"
            >
              {submitting ? "Оформляем…" : "Подтвердить заказ"}
            </button>
          </form>

          <div className="rounded-card border border-border bg-white p-5">
            <p className="font-semibold mb-3">Ваш заказ</p>
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.slug} className="py-2.5 flex items-center justify-between gap-3 text-sm">
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
              <span className="text-xl font-bold">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
