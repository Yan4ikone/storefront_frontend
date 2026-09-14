"use client";

// Фильтр по разделу на странице поиска (/search) — результаты поиска идут по
// всему каталогу сразу, этот select даёт сузить их до одного раздела.

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Category } from "@/lib/api";

export default function CategorySelect({
  categories,
  category,
}: {
  categories: Category[];
  category?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("category", value);
    else params.delete("category");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="rounded-card border border-border p-4">
      <p className="font-semibold text-sm mb-3">Раздел</p>
      <select
        value={category ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-brand bg-white"
      >
        <option value="">Все разделы</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
