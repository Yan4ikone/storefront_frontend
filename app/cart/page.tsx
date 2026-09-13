"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useCart } from "@/lib/cart-context";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

export default function CartPage() {
  const { items, setQty, removeItem, totalPrice } = useCart();

  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Корзина" }]} />

      <div className="max-w-container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Корзина</h1>

        {items.length === 0 ? (
          <div className="rounded-card border border-border bg-white p-10 text-center">
            <ShoppingBag size={40} className="mx-auto text-muted mb-4" strokeWidth={1.5} />
            <p className="font-semibold mb-1">Корзина пока пуста</p>
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
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
            <div className="rounded-card border border-border bg-white divide-y divide-border">
              {items.map((item) => (
                <div
                  key={item.slug}
                  className="flex flex-wrap items-center gap-4 p-4"
                >
                  <div className="flex-1 min-w-[160px]">
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-medium hover:text-brand"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted mt-0.5">{item.compatibility}</p>
                  </div>

                  <div className="flex items-center rounded-card border border-border">
                    <button
                      type="button"
                      aria-label="Уменьшить количество"
                      onClick={() => setQty(item.slug, item.qty - 1)}
                      className="h-9 w-9 flex items-center justify-center hover:text-brand"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-7 text-center text-sm font-medium">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      aria-label="Увеличить количество"
                      onClick={() => setQty(item.slug, item.qty + 1)}
                      className="h-9 w-9 flex items-center justify-center hover:text-brand"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <p className="w-24 text-right font-semibold">
                    {formatPrice(item.price * item.qty)}
                  </p>

                  <button
                    type="button"
                    aria-label="Удалить из корзины"
                    onClick={() => removeItem(item.slug)}
                    className="text-muted hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-card border border-border bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted">Итого</span>
                <span className="text-xl font-bold">{formatPrice(totalPrice)}</span>
              </div>
              <button
                type="button"
                disabled
                title="Оформление заказа появится на следующем этапе, после подключения бэкенда"
                className="w-full h-11 rounded-card bg-brand/40 text-white font-semibold cursor-not-allowed"
              >
                Оформить заказ
              </button>
              <p className="text-xs text-muted mt-2">
                Оформление заказа появится на следующем этапе — после подключения бэкенда.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
