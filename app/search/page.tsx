import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import CatalogFilters from "@/components/CatalogFilters";
import SortSelect from "@/components/SortSelect";
import CategorySelect from "@/components/CategorySelect";
import { getCategories, getCompatibilityModels, getProducts, type ProductSort } from "@/lib/api";

interface SearchPageParams {
  q?: string;
  category?: string;
  compatibility?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}

export function generateMetadata({ searchParams }: { searchParams: SearchPageParams }): Metadata {
  const q = searchParams.q?.trim();
  return { title: q ? `«${q}» — поиск — МобДетали` : "Поиск — МобДетали" };
}

export default async function SearchPage({ searchParams }: { searchParams: SearchPageParams }) {
  const q = searchParams.q?.trim() ?? "";
  const category = searchParams.category || undefined;
  const compatibility = searchParams.compatibility?.split(",").filter(Boolean) ?? [];
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const sort = (searchParams.sort as ProductSort | undefined) ?? undefined;

  const [items, compatibilityGroups, categories] = q
    ? await Promise.all([
        getProducts({ q, category, compatibility, minPrice, maxPrice, sort }),
        getCompatibilityModels(category),
        getCategories(),
      ])
    : [[], [], []];

  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Поиск" }]} />

      <div className="max-w-container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {q ? (
            <>
              Результаты по запросу «{q}»
            </>
          ) : (
            "Поиск по каталогу"
          )}
        </h1>

        {!q ? (
          <p className="text-muted">Введите запрос в строке поиска в шапке сайта.</p>
        ) : (
          <div className="grid md:grid-cols-[240px_1fr] gap-8">
            <aside className="hidden md:block space-y-4">
              {categories.length > 0 && <CategorySelect categories={categories} category={category} />}
              <CatalogFilters
                compatibilityGroups={compatibilityGroups}
                selectedCompatibility={compatibility}
                minPrice={minPrice}
                maxPrice={maxPrice}
              />
            </aside>

            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted">
                  {items.length === 0 ? "Ничего не найдено" : `Найдено: ${items.length}`}
                </p>
                <SortSelect sort={sort} />
              </div>

              {items.length === 0 ? (
                <p className="text-muted">
                  Попробуйте изменить запрос или сбросить фильтры по цене и совместимости.
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
        )}
      </div>
    </main>
  );
}
