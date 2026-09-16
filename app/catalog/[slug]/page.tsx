import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductResults from "@/components/ProductResults";
import ProductViewToggle from "@/components/ProductViewToggle";
import CatalogFilters from "@/components/CatalogFilters";
import SortSelect from "@/components/SortSelect";
import {
  getCategoryBySlug,
  getCompatibilityModels,
  getProducts,
  type ProductSort,
  type ProductViewMode,
} from "@/lib/api";

interface CategorySearchParams {
  compatibility?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  view?: string;
}

const VALID_VIEWS: ProductViewMode[] = ["table", "list", "tile"];

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
  // "Таблица" — вид по умолчанию (см. ProductViewToggle); незнакомое/пустое
  // значение параметра тоже к ней сводится.
  const view: ProductViewMode = VALID_VIEWS.includes(searchParams.view as ProductViewMode)
    ? (searchParams.view as ProductViewMode)
    : "table";

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
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <ProductViewToggle view={view} />
              <SortSelect sort={sort} />
            </div>

            {items.length === 0 ? (
              <p className="text-muted">
                {compatibility.length || minPrice != null || maxPrice != null
                  ? "По этим фильтрам ничего не нашлось."
                  : "В этом разделе пока нет товаров."}
              </p>
            ) : (
              <ProductResults items={items} view={view} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
