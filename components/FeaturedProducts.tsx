import type { Product } from "@/lib/api";
import ProductCard from "./ProductCard";

export default function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="bg-surface border-y border-border">
      <div className="max-w-container mx-auto px-4 py-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold">Популярное и новинки</h2>
          <a href="/catalog" className="text-sm text-brand hover:underline">
            Весь каталог
          </a>
        </div>

        {products.length === 0 ? (
          <p className="text-muted">Каталог пока пуст.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
