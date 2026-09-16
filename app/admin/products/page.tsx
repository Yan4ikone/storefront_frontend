"use client";

// Список товаров в админке — сгруппирован по разделам каталога (сворачиваемые
// блоки с указанием количества товаров), а не единым общим списком: с ростом
// каталога плоская таблица становится неудобной для навигации. Плюс поиск по
// названию, который при активном запросе временно разворачивает все разделы
// с совпадениями, независимо от того, свёрнуты они обычно или нет.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus, ChevronDown, ChevronRight, Search } from "lucide-react";
import { getProducts, deleteProduct, AdminApiError, type AdminProduct } from "@/lib/admin-api";
import { getCategoryIcon } from "@/lib/icon-map";

interface CategoryGroup {
  slug: string;
  name: string;
  icon: string;
  products: AdminProduct[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [openSlugs, setOpenSlugs] = useState<Set<string>>(new Set());

  const load = () => {
    getProducts()
      .then(setProducts)
      .catch((e) =>
        setError(e instanceof AdminApiError ? e.message : "Не удалось загрузить товары")
      );
  };

  useEffect(load, []);

  const handleDelete = async (slug: string) => {
    if (!window.confirm(`Удалить товар "${slug}"?`)) return;
    setDeletingSlug(slug);
    setError(null);
    try {
      await deleteProduct(slug);
      load();
    } catch (e) {
      setError(e instanceof AdminApiError ? e.message : "Не удалось удалить товар");
    } finally {
      setDeletingSlug(null);
    }
  };

  const groups = useMemo<CategoryGroup[]>(() => {
    if (!products) return [];
    const bySlug = new Map<string, CategoryGroup>();
    for (const product of products) {
      const slug = product.category?.slug ?? product.categorySlug;
      const existing = bySlug.get(slug);
      if (existing) {
        existing.products.push(product);
      } else {
        bySlug.set(slug, {
          slug,
          name: product.category?.name ?? product.categorySlug,
          icon: product.category?.icon ?? "",
          products: [product],
        });
      }
    }
    return Array.from(bySlug.values()).sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }, [products]);

  const trimmedQuery = query.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;

  // При активном поиске раздел остаётся видимым только если в нём есть
  // совпадения, а список внутри сужается до самих совпадений; такие разделы
  // разворачиваются автоматически (обычное состояние "свёрнут/развёрнут" не
  // трогаем, чтобы после очистки поля пользователь вернулся туда же).
  const visibleGroups = useMemo(() => {
    if (!isSearching) return groups;
    return groups
      .map((group) => ({
        ...group,
        products: group.products.filter((p) => p.name.toLowerCase().includes(trimmedQuery)),
      }))
      .filter((group) => group.products.length > 0);
  }, [groups, isSearching, trimmedQuery]);

  const toggleGroup = (slug: string) => {
    setOpenSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold">Товары</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 h-10 px-4 rounded-card bg-brand hover:bg-brand-dark transition-colors text-white text-sm font-semibold"
        >
          <Plus size={16} />
          Добавить товар
        </Link>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по названию…"
          className="w-full h-10 pl-9 pr-3 rounded-card border border-border text-sm focus:outline-none focus:border-brand"
        />
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {products === null ? (
        <p className="text-muted">Загрузка…</p>
      ) : products.length === 0 ? (
        <p className="text-muted">Пока нет ни одного товара.</p>
      ) : visibleGroups.length === 0 ? (
        <p className="text-muted">По запросу «{query.trim()}» ничего не найдено.</p>
      ) : (
        <div className="space-y-3">
          {visibleGroups.map((group) => {
            const Icon = getCategoryIcon(group.icon);
            const open = isSearching || openSlugs.has(group.slug);
            return (
              <div
                key={group.slug}
                className="rounded-card border border-border bg-white overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group.slug)}
                  disabled={isSearching}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface transition-colors disabled:cursor-default"
                >
                  {open ? (
                    <ChevronDown size={16} className="text-muted shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-muted shrink-0" />
                  )}
                  <Icon size={16} className="text-muted shrink-0" />
                  <span className="font-semibold flex-1">{group.name}</span>
                  <span className="text-xs text-muted bg-surface px-2 py-0.5 rounded-full">
                    {group.products.length}
                  </span>
                </button>

                {open && (
                  <table className="w-full text-sm border-t border-border">
                    <thead className="bg-surface text-left text-muted">
                      <tr>
                        <th className="px-4 py-3 font-medium">Название</th>
                        <th className="px-4 py-3 font-medium">Артикул</th>
                        <th className="px-4 py-3 font-medium">Цена</th>
                        <th className="px-4 py-3 font-medium">Наличие</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {group.products.map((product) => (
                        <tr key={product.slug} className="border-t border-border">
                          <td className="px-4 py-3 font-medium">{product.name}</td>
                          <td className="px-4 py-3 text-muted">{product.article ?? "—"}</td>
                          <td className="px-4 py-3 text-muted">
                            {product.price.toLocaleString("ru-RU")} ₽
                          </td>
                          <td className="px-4 py-3">
                            {product.inStock ? (
                              <span className="text-green-700">В наличии</span>
                            ) : (
                              <span className="text-amber-600">
                                Под заказ
                                {product.expectedDelivery ? ` · ${product.expectedDelivery}` : ""}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-3">
                              <Link
                                href={`/admin/products/${product.slug}/edit`}
                                aria-label="Редактировать"
                                className="text-muted hover:text-brand"
                              >
                                <Pencil size={16} />
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDelete(product.slug)}
                                disabled={deletingSlug === product.slug}
                                aria-label="Удалить"
                                className="text-muted hover:text-red-600 disabled:opacity-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
