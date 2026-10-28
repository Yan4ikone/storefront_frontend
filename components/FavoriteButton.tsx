"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";

// Сердечко "в избранное" — используется на карточке товара (каталог, поиск,
// похожие товары) и на странице товара. Гостю, не вошедшему в аккаунт,
// предлагаем войти, а не тихо игнорируем клик.
export default function FavoriteButton({
  slug,
  className,
  size = 16,
}: {
  slug: string;
  className?: string;
  size?: number;
}) {
  const router = useRouter();
  const { status } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(slug);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    void toggle(slug);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
      aria-pressed={active}
      className={
        className ??
        "h-8 w-8 rounded-full bg-white/90 border border-border flex items-center justify-center hover:border-brand transition-colors"
      }
    >
      <Heart
        size={size}
        strokeWidth={2}
        className={active ? "text-red-500 fill-red-500" : "text-muted"}
      />
    </button>
  );
}
