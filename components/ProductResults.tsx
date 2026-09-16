// Общий рендер списка товаров для страницы раздела каталога и страницы
// поиска — переключается между таблицей/списком/плиткой по значению view
// (см. ProductViewToggle). Серверный компонент: сам по себе не использует
// хуки, а лишь выбирает, какие клиентские компоненты отрендерить.

import ProductCard from "@/components/ProductCard";
import ProductListRow from "@/components/ProductListRow";
import ProductTable from "@/components/ProductTable";
import type { Product, ProductViewMode } from "@/lib/api";

export default function ProductResults({
  items,
  view,
}: {
  items: Product[];
  view: ProductViewMode;
}) {
  if (view === "list") {
    return (
      <div className="flex flex-col gap-3">
        {items.map((product) => (
          <ProductListRow key={product.slug} product={product} />
        ))}
      </div>
    );
  }

  if (view === "tile") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    );
  }

  return <ProductTable items={items} />;
}
