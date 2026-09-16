"use client";

// Переключатель вида отображения списка товаров в разделе каталога/поиске —
// по образцу референса (krasnodar.moba.ru): три вида, "Таблица"/"Список"/
// "Плитка". Вид хранится в query-строке (?view=...), поэтому список товаров
// (серверный компонент страницы) просто перечитывает searchParams — как и
// остальные фильтры (см. CatalogFilters.tsx, SortSelect.tsx).

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AlignJustify, List, LayoutGrid } from "lucide-react";
import type { ProductViewMode } from "@/lib/api";

// Примечание: используемая версия lucide-react не содержит отдельной иконки
// "таблица" — AlignJustify (плотные горизонтальные строки) визуально ближе
// всего к компактному табличному виду и хорошо отличается от List/LayoutGrid.
const VIEWS: { value: ProductViewMode; label: string; icon: typeof AlignJustify }[] = [
  { value: "table", label: "Таблица", icon: AlignJustify },
  { value: "list", label: "Список", icon: List },
  { value: "tile", label: "Плитка", icon: LayoutGrid },
];

export default function ProductViewToggle({ view }: { view: ProductViewMode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setView = (next: ProductViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "table") {
      // "Таблица" — вид по умолчанию, не засоряем URL параметром.
      params.delete("view");
    } else {
      params.set("view", next);
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-1 rounded-card border border-border p-1 bg-white shrink-0">
      {VIEWS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setView(value)}
          aria-label={label}
          aria-pressed={view === value}
          title={label}
          className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
            view === value ? "bg-brand text-white" : "text-muted hover:text-ink hover:bg-surface"
          }`}
        >
          <Icon size={16} strokeWidth={2} />
        </button>
      ))}
    </div>
  );
}
