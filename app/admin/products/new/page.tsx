"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm, { type ProductFormValues } from "@/components/admin/ProductForm";
import { createProduct, AdminApiError } from "@/lib/admin-api";

export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: ProductFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      await createProduct({
        slug: values.slug,
        name: values.name,
        categorySlug: values.categorySlug,
        compatibility: values.compatibility,
        price: values.price,
        oldPrice: values.oldPrice ?? undefined,
        badge: values.badge || undefined,
        description: values.description,
        specs: values.specs,
        compatibilityModelSlugs: values.compatibilityModelSlugs,
      });
      router.push("/admin/products");
    } catch (e) {
      setError(e instanceof AdminApiError ? e.message : "Не удалось создать товар");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Новый товар</h1>
      <ProductForm mode="create" submitting={submitting} error={error} onSubmit={handleSubmit} />
    </div>
  );
}
