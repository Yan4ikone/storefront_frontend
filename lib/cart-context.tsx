"use client";

// Простое хранилище корзины на клиенте (React Context + localStorage).
// Это решение для этапа "фронтенд без бэкенда": корзина живёт в браузере
// пользователя. Когда появится API (раздел 6 плана), корзина переедет на сервер
// (сущности Cart/CartItem, раздел 5), а этот контекст останется обёрткой над запросами.

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "./mock-data";

export interface CartItem {
  slug: string;
  name: string;
  compatibility: string;
  price: number;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  totalCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "storefront-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Загружаем корзину из localStorage только на клиенте, после первого рендера.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage может быть недоступен (приватный режим и т.п.) — просто начинаем с пустой корзины.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  const addItem = (product: Product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === product.slug);
      if (existing) {
        return prev.map((i) =>
          i.slug === product.slug ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [
        ...prev,
        {
          slug: product.slug,
          name: product.name,
          compatibility: product.compatibility,
          price: product.price,
          qty,
        },
      ];
    });
  };

  const removeItem = (slug: string) => {
    setItems((prev) => prev.filter((i) => i.slug !== slug));
  };

  const setQty = (slug: string, qty: number) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => (i.slug === slug ? { ...i, qty } : i)));
  };

  const clear = () => setItems([]);

  const totalCount = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.qty * i.price, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, setQty, clear, totalCount, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart должен вызываться внутри <CartProvider>");
  return ctx;
}
