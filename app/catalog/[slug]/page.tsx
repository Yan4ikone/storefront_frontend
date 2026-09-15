import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import CatalogFilters from "@/components/CatalogFilters";
import SortSelect from "@/components/SortSelect";
import { getCategoryBySlug, getCompatibilityModels, getProducts, type ProductSort } from "@/lib/api";

interface CategorySearchParams {
  compatibility?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  return { title: category ? `${category.name} — ScreenHub` : "Раздел не найден" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: CategorySearchParams;
}) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const compatibility = searchParams.compatibility?.split(",").filter(Boolean) ?? [];
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const sort = (searchParams.sort as ProductSort | undefined) ?? undefined;

  const [items, compatibilityGroups] = await Promise.all([
    getProducts({ category: category.slug, compatibility, minPrice, maxPrice, sort }),
    getCompatibilityModels(category.slug),
  ]);

  return (
    <main>
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Каталог", href: "/catalog" },
          { label: category.name },
        ]}
      />

      <div className="max-w-container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{category.name}</h1>

        <div className="grid md:grid-cols-[240px_1fr] gap-8">
          <aside className="hidden md:block">
            <CatalogFilters
              compatibilityGroups={compatibilityGroups}
              selectedCompatibility={compatibility}
              minPrice={minPrice}
              maxPrice={maxPrice}
            />
          </aside>

          <div>
            <div className="flex items-center justify-end mb-4">
              <SortSelect sort={sort} />
            </div>

            {items.length === 0 ? (
              <p className="text-muted">
                {compatibility.length || minPrice != null || maxPrice != null
                  ? "По этим фильтрам ничего не нашлось."
                  : "В этом разделе пока нет товаров."}
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {items.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
