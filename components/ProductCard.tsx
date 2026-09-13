"use client";

import Link from "next/link";
import { ImageOff, ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/mock-data";
import { useCart } from "@/lib/cart-context";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group rounded-card border border-border bg-white p-4 flex flex-col hover:shadow-sm hover:border-brand/40 transition-all">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square rounded-lg bg-surface flex items-center justify-center text-muted/50 mb-3">
          <ImageOff size={28} strokeWidth={1.5} />
          {product.badge && (
            <span className="absolute top-2 left-2 bg-accent text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {product.badge}
            </span>
          )}
        </div>

        <p className="text-xs text-muted mb-1">{product.compatibility}</p>
        <p className="font-medium text-sm leading-snug mb-3 line-clamp-2 text-ink">
          {product.name}
        </p>
      </Link>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div>
          <p className="font-bold text-ink leading-none">
            {formatPrice(product.price)}
          </p>
          {product.oldPrice && (
            <p className="text-xs text-muted line-through mt-1">
              {formatPrice(product.oldPrice)}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label="Добавить в корзину"
          onClick={handleAdd}
          className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center transition-colors ${
            added ? "bg-green-600" : "bg-brand hover:bg-brand-dark"
          } text-white`}
        >
          {added ? (
            <Check size={16} strokeWidth={2.5} />
          ) : (
            <ShoppingCart size={16} strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  );
}
