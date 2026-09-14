"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Check } from "lucide-react";
import type { Product } from "@/lib/api";
import { useCart } from "@/lib/cart-context";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

export default function ProductActions({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-5">
        <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
        {product.oldPrice && (
          <span className="text-lg text-muted line-through">
            {formatPrice(product.oldPrice)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center rounded-card border border-border">
          <button
            type="button"
            aria-label="Уменьшить количество"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-11 w-11 flex items-center justify-center text-ink hover:text-brand"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-medium">{qty}</span>
          <button
            type="button"
            aria-label="Увеличить количество"
            onClick={() => setQty((q) => q + 1)}
            className="h-11 w-11 flex items-center justify-center text-ink hover:text-brand"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className={`flex-1 min-w-[180px] h-11 rounded-card text-white font-semibold flex items-center justify-center gap-2 transition-colors ${
            added ? "bg-green-600" : "bg-brand hover:bg-brand-dark"
          }`}
        >
          {added ? (
            <>
              <Check size={18} /> Добавлено
            </>
          ) : (
            <>
              <ShoppingCart size={18} /> В корзину
            </>
          )}
        </button>
      </div>
    </div>
  );
}
