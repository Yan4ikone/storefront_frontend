"use client";

// Вид "Список" — строка с картинкой-заглушкой и основными атрибутами. Картинка
// здесь намеренно маленькая (миниатюра) — в отличие от плитки (ProductCard), где
// изображение крупное; сам список остаётся компактнее таблицы по содержанию,
// но с превью товара.

import Link from "next/link";
import { ImageOff, ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/api";
import { useCart } from "@/lib/cart-context";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

export default function ProductListRow({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="flex gap-4 rounded-card border border-border bg-white p-4 hover:border-brand/40 transition-colors">
      <Link
        href={`/product/${product.slug}`}
        className="relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-surface flex items-center justify-center text-muted/50"
      >
        <ImageOff size={16} strokeWidth={1.5} />
        {product.badge && (
          <span className="absolute -top-1.5 -left-1.5 bg-accent text-white text-[9px] font-semibold px-1 py-0.5 rounded-full leading-none">
            {product.badge}
          </span>
        )}
      </Link>

      <div className="flex-1 min-w-0 flex flex-col">
        {product.article && (
          <p className="text-xs text-muted mb-0.5">Артикул: {product.article}</p>
        )}
        <Link href={`/product/${product.slug}`}>
          <p className="font-medium text-sm leading-snug mb-1.5 text-ink hover:text-brand">
            {product.name}
          </p>
        </Link>
        {product.inStock ? (
          <p className="text-xs text-green-700 font-medium mb-1">В наличии</p>
        ) : (
          <p className="text-xs text-amber-700 font-medium mb-1">
            Под заказ{product.expectedDelivery ? ` · ${product.expectedDelivery}` : ""}
          </p>
        )}
        <p className="text-xs text-muted mt-auto">{product.compatibility}</p>
      </div>

      <div className="flex flex-col items-end justify-between shrink-0 gap-2">
        <div className="text-right">
          <p className="font-bold text-ink leading-none">{formatPrice(product.price)}</p>
          {product.oldPrice && (
            <p className="text-xs text-muted line-through mt-1">{formatPrice(product.oldPrice)}</p>
          )}
        </div>
        <button
          type="button"
          aria-label="Добавить в корзину"
          onClick={handleAdd}
          className={`h-9 px-3 rounded-full flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
            added ? "bg-green-600" : "bg-brand hover:bg-brand-dark"
          } text-white`}
        >
          {added ? <Check size={14} strokeWidth={2.5} /> : <ShoppingCart size={14} strokeWidth={2} />}
          {added ? "Добавлено" : "В корзину"}
        </button>
      </div>
    </div>
  );
}
