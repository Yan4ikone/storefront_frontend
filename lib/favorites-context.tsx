"use client";

// Избранное ("сердечко" на карточке товара) — отдельный контекст, а не часть
// cart-context: живёт на сервере (не в localStorage), только для вошедших
// покупателей, и нужен на множестве карточек сразу (каталог, поиск, похожие
// товары) — держим один загруженный набор slug'ов, а не дёргаем API на
// каждую карточку по отдельности.

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth, getCustomerToken } from "./auth-context";
import { getFavorites, addFavorite, removeFavorite } from "./auth-api";

interface FavoritesContextValue {
  slugs: Set<string>;
  loaded: boolean;
  isFavorite: (slug: string) => boolean;
  toggle: (slug: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [slugs, setSlugs] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setSlugs(new Set());
      setLoaded(status === "anonymous");
      return;
    }
    const token = getCustomerToken();
    if (!token) return;
    getFavorites(token)
      .then((items) => {
        setSlugs(new Set(items.map((i) => i.productSlug)));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [status]);

  const toggle = useCallback(
    async (slug: string) => {
      const token = getCustomerToken();
      if (!token) return;
      const isCurrentlyFavorite = slugs.has(slug);

      // Оптимистичное обновление — не ждём ответа сервера, чтобы сердечко
      // реагировало сразу; при ошибке откатываем.
      setSlugs((prev) => {
        const next = new Set(prev);
        if (isCurrentlyFavorite) next.delete(slug);
        else next.add(slug);
        return next;
      });

      try {
        if (isCurrentlyFavorite) await removeFavorite(token, slug);
        else await addFavorite(token, slug);
      } catch {
        setSlugs((prev) => {
          const next = new Set(prev);
          if (isCurrentlyFavorite) next.add(slug);
          else next.delete(slug);
          return next;
        });
      }
    },
    [slugs]
  );

  const isFavorite = useCallback((slug: string) => slugs.has(slug), [slugs]);

  return (
    <FavoritesContext.Provider value={{ slugs, loaded, isFavorite, toggle }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites должен вызываться внутри <FavoritesProvider>");
  return ctx;
}
