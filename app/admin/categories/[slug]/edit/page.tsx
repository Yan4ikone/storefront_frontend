"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CategoryForm, { type CategoryFormValues } from "@/components/admin/CategoryForm";
import {
  getCategories,
  updateCategory,
  AdminApiError,
  type AdminCategory,
} from "@/lib/admin-api";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [category, setCategory] = useState<AdminCategory | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Отдельного GET /admin/catalog/categories/:slug на бэкенде нет — берём
    // нужную категорию из общего списка.
    getCategories()
      .then((categories) => setCategory(categories.find((c) => c.slug === slug) ?? null))
      .catch((e) => {
        setError(e instanceof AdminApiError ? e.message : "Не удалось загрузить раздел");
        setCategory(null);
      });
  }, [slug]);

  const handleSubmit = async (values: CategoryFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      await updateCategory(slug, { name: values.name, icon: values.icon, items: values.items });
      router.push("/admin/categories");
    } catch (e) {
      setError(e instanceof AdminApiError ? e.message : "Не удалось сохранить раздел");
    } finally {
      setSubmitting(false);
    }
  };

  if (category === undefined) return <p className="text-muted">Загрузка…</p>;
  if (category === null) return <p className="text-red-600">Раздел не найден</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Редактировать раздел «{category.name}»</h1>
      <CategoryForm
        mode="edit"
        initial={category}
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
