"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ImageOff } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import FavoriteButton from "@/components/FavoriteButton";
import { resolveImageUrl } from "@/lib/api";
import { useAuth, AuthApiError, getCustomerToken } from "@/lib/auth-context";
import { getFavorites, type FavoriteItem } from "@/lib/auth-api";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

export default function FavoritesPage() {
  const { status } = useAuth();
  const [items, setItems] = useState<FavoriteItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    const token = getCustomerToken();
    if (!token) return;
    getFavorites(token)
      .then(setItems)
      .catch((e) => setError(e instanceof AuthApiError ? e.message : "Не удалось загрузить избранное"));
  }, [status]);

  if (status === "checking") {
    return <p className="text-muted max-w-container mx-auto px-4 py-12">Загрузка…</p>;
  }

  if (status === "anonymous") {
    return (
      <main>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Избранное" }]} />
        <div className="max-w-container mx-auto px-4 py-16 text-center">
          <p className="mb-4 text-muted">Чтобы смотреть избранное, войдите в аккаунт.</p>
          <Link href="/login" className="inline-block h-11 px-6 rounded-card bg-brand hover:bg-brand-dark text-white font-semibold leading-[44px]">
            Войти
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Личный кабинет", href: "/account" }, { label: "Избранное" }]} />

      <div className="max-w-container mx-auto px-4 py-12">
        <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Heart size={20} />
          Избранное
        </h1>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {items === null ? (
          <p className="text-muted">Загрузка…</p>
        ) : items.length === 0 ? (
          <p className="text-muted">Пока ничего не добавлено — нажмите на сердечко на карточке товара.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(({ product }) => (
              <div key={product.slug} className="rounded-card border border-border bg-white p-4 relative">
                <FavoriteButton
                  slug={product.slug}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 border border-border flex items-center justify-center hover:border-brand transition-colors z-10"
                />
                <Link href={`/product/${product.slug}`} className="block">
                  <div className="relative aspect-square rounded-lg bg-surface flex items-center justify-center text-muted/50 mb-3 overflow-hidden">
                    {product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolveImageUrl(product.images[0])} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageOff size={28} strokeWidth={1.5} />
                    )}
                    {!product.inStock && (
                      <span className="absolute top-2 left-2 bg-white/90 text-ink text-[11px] font-semibold px-2 py-0.5 rounded-full border border-border">
                        Под заказ
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mb-1">{product.compatibility}</p>
                  <p className="font-medium text-sm leading-snug line-clamp-2 mb-2">{product.name}</p>
                  <p className="font-bold">{formatPrice(product.price)}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
