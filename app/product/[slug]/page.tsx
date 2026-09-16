import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import ProductActions from "@/components/ProductActions";
import { ImageOff } from "lucide-react";
import { getCategoryBySlug, getProductBySlug } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  return { title: product ? `${product.name} — ScreenHub` : "Товар не найден" };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const category = await getCategoryBySlug(product.categorySlug);
  const related = product.related;

  return (
    <main>
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Каталог", href: "/catalog" },
          ...(category
            ? [{ label: category.name, href: `/catalog/${category.slug}` }]
            : []),
          { label: product.name },
        ]}
      />

      <div className="max-w-container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Галерея — плейсхолдер вместо реальных фото */}
          <div>
            <div className="aspect-square rounded-card bg-surface border border-border flex items-center justify-center text-muted/50 mb-3">
              <ImageOff size={48} strokeWidth={1.25} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-surface border border-border flex items-center justify-center text-muted/30"
                >
                  <ImageOff size={20} strokeWidth={1.25} />
                </div>
              ))}
            </div>
          </div>

          {/* Информация о товаре */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {product.badge && (
                <span className="inline-block bg-accent text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {product.badge}
                </span>
              )}
              <span
                className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                  product.inStock
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {product.inStock ? "В наличии" : "Под заказ"}
              </span>
              {!product.inStock && product.expectedDelivery && (
                <span className="text-sm text-muted">
                  Ожидается: {product.expectedDelivery}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold mb-1">{product.name}</h1>
            {product.article && (
              <p className="text-xs text-muted mb-1">Артикул: {product.article}</p>
            )}
            <p className="text-muted mb-5">Совместимость: {product.compatibility}</p>

            <ProductActions product={product} />

            <p className="mt-6 text-sm leading-relaxed text-ink/80">
              {product.description}
            </p>

            <div className="mt-6 rounded-card border border-border divide-y divide-border">
              {product.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <span className="text-muted">{spec.label}</span>
                  <span className="font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-bold mb-5">Похожие товары</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
