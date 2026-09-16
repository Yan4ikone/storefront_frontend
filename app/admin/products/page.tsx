"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus } from "lucide-react";
import { getProducts, deleteProduct, AdminApiError, type AdminProduct } from "@/lib/admin-api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Товары</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 h-10 px-4 rounded-card bg-brand hover:bg-brand-dark transition-colors text-white text-sm font-semibold"
        >
          <Plus size={16} />
          Добавить товар
        </Link>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {products === null ? (
        <p className="text-muted">Загрузка…</p>
      ) : products.length === 0 ? (
        <p className="text-muted">Пока нет ни одного товара.</p>
      ) : (
        <div className="rounded-card border border-border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Название</th>
                <th className="px-4 py-3 font-medium">Артикул</th>
                <th className="px-4 py-3 font-medium">Раздел</th>
                <th className="px-4 py-3 font-medium">Цена</th>
                <th className="px-4 py-3 font-medium">Наличие</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.slug} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-muted">{product.article ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    {product.category?.name ?? product.categorySlug}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {product.price.toLocaleString("ru-RU")} ₽
                  </td>
                  <td className="px-4 py-3">
                    {product.inStock ? (
                      <span className="text-green-700">В наличии</span>
                    ) : (
                      <span className="text-amber-600">
                        Под заказ{product.expectedDelivery ? ` · ${product.expectedDelivery}` : ""}
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
        </div>
      )}
    </div>
  );
}
