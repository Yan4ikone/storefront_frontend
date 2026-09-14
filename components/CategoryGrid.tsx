"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { Category } from "@/lib/api";
import { getCategoryIcon } from "@/lib/icon-map";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <section id="catalog" className="max-w-container mx-auto px-4 py-12">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-2xl font-bold">Каталог по разделам</h2>
        <Link href="/catalog" className="text-sm text-brand hover:underline">
          Смотреть всё
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="text-muted">Разделы каталога пока не добавлены.</p>
      ) : (
        <>
          {/* Клик вне открытой карточки закрывает всплывающий список */}
          {openSlug && (
            <div className="fixed inset-0 z-10" onClick={() => setOpenSlug(null)} />
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.icon);
              const isOpen = openSlug === category.slug;

              return (
                <div key={category.slug} className={`relative ${isOpen ? "z-40" : "z-20"}`}>
                  <button
                    type="button"
                    onClick={() => setOpenSlug(isOpen ? null : category.slug)}
                    aria-expanded={isOpen}
                    className={`w-full text-left group rounded-card border p-5 bg-white transition-all ${
                      isOpen
                        ? "border-brand shadow-sm"
                        : "border-border hover:border-brand hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`h-11 w-11 rounded-full flex items-center justify-center mb-4 transition-colors ${
                          isOpen
                            ? "bg-brand text-white"
                            : "bg-surface text-brand group-hover:bg-brand group-hover:text-white"
                        }`}
                      >
                        <Icon size={22} strokeWidth={1.75} />
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-muted mt-1 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    <p className="font-semibold text-sm leading-snug">{category.name}</p>
                  </button>

                  {isOpen && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-card border border-border bg-white shadow-lg p-2">
                      <ul>
                        {category.items.map((item) => (
                          <li key={item}>
                            <Link
                              href={`/catalog/${category.slug}`}
                              className="block rounded-lg px-3 py-2 text-sm hover:bg-surface hover:text-brand transition-colors"
                            >
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/catalog/${category.slug}`}
                        className="block rounded-lg px-3 py-2 text-sm font-semibold text-brand hover:bg-surface transition-colors border-t border-border mt-1 pt-2"
                      >
                        Весь раздел «{category.name}» →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
