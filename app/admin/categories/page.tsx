"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  getCategories,
  deleteCategory,
  AdminApiError,
  type AdminCategory,
} from "@/lib/admin-api";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const load = () => {
    getCategories()
      .then(setCategories)
      .catch((e) =>
        setError(e instanceof AdminApiError ? e.message : "Не удалось загрузить разделы")
      );
  };

  useEffect(load, []);

  const handleDelete = async (slug: string) => {
    if (!window.confirm(`Удалить раздел "${slug}"?`)) return;
    setDeletingSlug(slug);
    setError(null);
    try {
      await deleteCategory(slug);
      load();
    } catch (e) {
      setError(e instanceof AdminApiError ? e.message : "Не удалось удалить раздел");
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Разделы каталога</h1>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 h-10 px-4 rounded-card bg-brand hover:bg-brand-dark transition-colors text-white text-sm font-semibold"
        >
          <Plus size={16} />
          Добавить раздел
        </Link>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {categories === null ? (
        <p className="text-muted">Загрузка…</p>
      ) : categories.length === 0 ? (
        <p className="text-muted">Пока нет ни одного раздела.</p>
      ) : (
        <div className="rounded-card border border-border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Название</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Иконка</th>
                <th className="px-4 py-3 font-medium">Подпункты</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.slug} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{category.name}</td>
                  <td className="px-4 py-3 text-muted">{category.slug}</td>
                  <td className="px-4 py-3 text-muted">{category.icon}</td>
                  <td className="px-4 py-3 text-muted">{category.items.length}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/categories/${category.slug}/edit`}
                        aria-label="Редактировать"
                        className="text-muted hover:text-brand"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(category.slug)}
                        disabled={deletingSlug === category.slug}
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
