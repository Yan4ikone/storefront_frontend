"use client";

// Вид "Таблица" (по умолчанию для раздела каталога, см. app/catalog/[slug]) —
// самое компактное отображение по образцу референса: без картинок, одна
// строка на товар.

import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/api";
import { useCart } from "@/lib/cart-context";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

function ProductTableRow({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3 whitespace-nowrap">
        {product.inStock ? (
          <span className="text-green-700 text-xs font-medium">В наличии</span>
        ) : (
          <span className="text-amber-700 text-xs font-medium">
            Под заказ{product.expectedDelivery ? ` · ${product.expectedDelivery}` : ""}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <Link
          href={`/product/${product.slug}`}
          className="text-sm font-medium text-ink hover:text-brand"
        >
          {product.name}
        </Link>
        <p className="text-xs text-muted mt-0.5">{product.compatibility}</p>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="font-bold text-ink">{formatPrice(product.price)}</span>
        {product.oldPrice && (
          <span className="text-xs text-muted line-through ml-2">
            {formatPrice(product.oldPrice)}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          aria-label="Добавить в корзину"
          onClick={handleAdd}
          className={`h-9 px-3 rounded-full inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
            added ? "bg-green-600" : "bg-brand hover:bg-brand-dark"
          } text-white`}
        >
          {added ? <Check size={14} strokeWidth={2.5} /> : <ShoppingCart size={14} strokeWidth={2} />}
          {added ? "Добавлено" : "В корзину"}
        </button>
      </td>
    </tr>
  );
}

export default function ProductTable({ items }: { items: Product[] }) {
  return (
    <div className="rounded-card border border-border bg-white overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-surface text-left text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Наличие</th>
            <th className="px-4 py-3 font-medium">Товар</th>
            <th className="px-4 py-3 font-medium">Цена</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {items.map((product) => (
            <ProductTableRow key={product.slug} product={product} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
