import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCategories } from "@/lib/api";
import { getCategoryIcon } from "@/lib/icon-map";

export const metadata: Metadata = {
  title: "Каталог — МобДетали",
};

export default async function CatalogPage() {
  const categories = await getCategories();

  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог" }]} />

      <div className="max-w-container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Каталог</h1>

        {categories.length === 0 ? (
          <p className="text-muted">Разделы каталога пока не добавлены.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category.icon);
              return (
                <Link
                  key={category.slug}
                  href={`/catalog/${category.slug}`}
                  className="group rounded-card border border-border p-5 hover:border-brand hover:shadow-sm transition-all bg-white"
                >
                  <div className="h-11 w-11 rounded-full bg-surface flex items-center justify-center text-brand mb-4 group-hover:bg-brand group-hover:text-white transition-colors">
                    <Icon size={22} strokeWidth={1.75} />
                  </div>
                  <p className="font-semibold text-sm leading-snug">{category.name}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
