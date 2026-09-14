"use client";

// Сортировка результатов — как и CatalogFilters, просто переписывает query-строку
// текущего URL, серверная страница перечитывает searchParams и делает новый запрос.

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { ProductSort } from "@/lib/api";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "new", label: "Сначала новые" },
  { value: "price_asc", label: "Сначала дешевле" },
  { value: "price_desc", label: "Сначала дороже" },
];

export default function SortSelect({ sort }: { sort?: ProductSort }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "new") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <select
      value={sort ?? "new"}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-brand bg-white"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
