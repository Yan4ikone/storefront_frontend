import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductCard from "@/components/ProductCard";
import { getCategoryBySlug, getProducts } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  return { title: category ? `${category.name} — МобДетали` : "Раздел не найден" };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const items = await getProducts(category.slug);

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
          {/* Фильтры — визуальный макет, без реальной логики (появится вместе с поиском) */}
          <aside className="hidden md:block">
            <div className="rounded-card border border-border p-4 mb-4">
              <p className="font-semibold text-sm mb-3">Совместимость</p>
              <div className="space-y-2 text-sm">
                {category.items.map((item) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-brand" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-card border border-border p-4">
              <p className="font-semibold text-sm mb-3">Цена, ₽</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="от"
                  className="w-full rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-brand"
                />
                <span className="text-muted">—</span>
                <input
                  type="number"
                  placeholder="до"
                  className="w-full rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-brand"
                />
              </div>
            </div>
          </aside>

          <div>
            <div className="flex items-center justify-end mb-4">
              <select className="rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-brand">
                <option>По популярности</option>
                <option>Сначала дешевле</option>
                <option>Сначала дороже</option>
              </select>
            </div>

            {items.length === 0 ? (
              <p className="text-muted">В этом разделе пока нет товаров.</p>
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
