import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { categories, getProductsByCategory } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Каталог — МобДетали",
};

export default function CatalogPage() {
  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог" }]} />

      <div className="max-w-container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Каталог</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            const count = getProductsByCategory(category.slug).length;
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
                <p className="text-xs text-muted mt-1">{count} товаров в наличии</p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
