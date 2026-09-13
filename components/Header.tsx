"use client";

import Link from "next/link";
import { Search, ShoppingCart, Phone, User } from "lucide-react";
import { categories } from "@/lib/mock-data";
import { useCart } from "@/lib/cart-context";

export default function Header() {
  const { totalCount } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      {/* Верхняя строка: контакты и служебные ссылки */}
      <div className="hidden md:block bg-surface text-sm text-muted">
        <div className="max-w-container mx-auto px-4 flex items-center justify-between h-9">
          <div className="flex gap-5">
            <a href="#" className="hover:text-ink">
              О магазине
            </a>
            <a href="#" className="hover:text-ink">
              Доставка и оплата
            </a>
            <a href="#" className="hover:text-ink">
              Гарантия
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} />
            <a href="tel:+70000000000" className="hover:text-ink">
              +7 (000) 000-00-00
            </a>
          </div>
        </div>
      </div>

      {/* Основная строка: логотип, поиск, действия */}
      <div className="max-w-container mx-auto px-4 py-4 flex items-center gap-4 md:gap-8">
        <Link href="/" className="shrink-0 flex items-baseline gap-1">
          <span className="text-2xl font-extrabold tracking-tight text-brand">
            МобДетали
          </span>
          <span className="hidden sm:inline text-xs text-muted">.ru</span>
        </Link>

        <div className="hidden md:flex flex-1 items-center">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Поиск по названию, артикулу или модели устройства…"
              className="w-full rounded-card border border-border bg-surface px-4 py-2.5 pr-11 text-sm outline-none focus:border-brand transition-colors"
            />
            <Search
              size={18}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-5 ml-auto md:ml-0">
          <Link
            href="/login"
            aria-label="Личный кабинет"
            className="hidden sm:flex flex-col items-center text-ink hover:text-brand transition-colors"
          >
            <User size={22} strokeWidth={1.75} />
            <span className="text-[11px] leading-none mt-1">Войти</span>
          </Link>
          <Link
            href="/cart"
            aria-label="Корзина"
            className="relative flex flex-col items-center text-ink hover:text-brand transition-colors"
          >
            <ShoppingCart size={22} strokeWidth={1.75} />
            <span className="text-[11px] leading-none mt-1">Корзина</span>
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-accent text-white text-[10px] leading-none rounded-full h-4 w-4 flex items-center justify-center">
                {totalCount > 9 ? "9+" : totalCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Поиск для мобильной версии */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Поиск по каталогу…"
            className="w-full rounded-card border border-border bg-surface px-4 py-2.5 pr-11 text-sm outline-none focus:border-brand transition-colors"
          />
          <Search
            size={18}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>
      </div>

      {/* Навигация по каталогу */}
      <nav className="hidden md:block border-t border-border bg-brand text-white">
        <div className="max-w-container mx-auto px-4 flex items-center gap-6 h-11 text-sm overflow-x-auto">
          <Link href="/catalog" className="font-semibold whitespace-nowrap">
            Весь каталог
          </Link>
          {categories.slice(0, 5).map((category) => (
            <Link
              key={category.slug}
              href={`/catalog/${category.slug}`}
              className="text-white/80 hover:text-white whitespace-nowrap"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
