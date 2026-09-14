"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm, { type ProductFormValues } from "@/components/admin/ProductForm";
import {
  getProduct,
  updateProduct,
  AdminApiError,
  type AdminProduct,
} from "@/lib/admin-api";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [product, setProduct] = useState<AdminProduct | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getProduct(slug)
      .then(setProduct)
      .catch((e) => {
        setError(e instanceof AdminApiError ? e.message : "Не удалось загрузить товар");
        setProduct(null);
      });
  }, [slug]);

  const handleSubmit = async (values: ProductFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      await updateProduct(slug, {
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
      setError(e instanceof AdminApiError ? e.message : "Не удалось сохранить товар");
    } finally {
      setSubmitting(false);
    }
  };

  if (product === undefined) return <p className="text-muted">Загрузка…</p>;
  if (product === null) return <p className="text-red-600">Товар не найден</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Редактировать товар «{product.name}»</h1>
      <ProductForm
        mode="edit"
        initial={{
          slug: product.slug,
          name: product.name,
          categorySlug: product.categorySlug,
          compatibility: product.compatibility,
          price: product.price,
          oldPrice: product.oldPrice ?? null,
          badge: product.badge ?? "",
          description: product.description,
          specs: product.specs,
          compatibilityModelSlugs:
            product.compatibilityModels?.map((c) => c.compatibilityModel.slug) ?? [],
        }}
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
