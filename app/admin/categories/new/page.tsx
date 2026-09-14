"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CategoryForm, { type CategoryFormValues } from "@/components/admin/CategoryForm";
import { createCategory, AdminApiError } from "@/lib/admin-api";

export default function NewCategoryPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: CategoryFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      await createCategory(values);
      router.push("/admin/categories");
    } catch (e) {
      setError(e instanceof AdminApiError ? e.message : "Не удалось создать раздел");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Новый раздел</h1>
      <CategoryForm mode="create" submitting={submitting} error={error} onSubmit={handleSubmit} />
    </div>
  );
}
