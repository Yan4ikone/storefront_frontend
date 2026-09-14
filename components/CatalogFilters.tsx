"use client";

// Панель фильтров каталога — совместимость с моделью устройства (чекбоксы,
// backend: CompatibilityModel) и цена, плюс сортировка результатов. Все три
// живут в query-строке текущего URL (?compatibility=...&minPrice=...&sort=...),
// поэтому список товаров на странице (серверный компонент) просто перечитывает
// searchParams при каждом изменении — без отдельного клиентского запроса тут.

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import type { CompatibilityGroup } from "@/lib/api";

interface CatalogFiltersProps {
  compatibilityGroups: CompatibilityGroup[];
  selectedCompatibility: string[];
  minPrice?: number;
  maxPrice?: number;
}

export default function CatalogFilters({
  compatibilityGroups,
  selectedCompatibility,
  minPrice,
  maxPrice,
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minInput, setMinInput] = useState(minPrice != null ? String(minPrice) : "");
  const [maxInput, setMaxInput] = useState(maxPrice != null ? String(maxPrice) : "");

  const pushParams = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleCompatibility = (slug: string, e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked
      ? [...selectedCompatibility, slug]
      : selectedCompatibility.filter((s) => s !== slug);
    pushParams({ compatibility: next.length ? next.join(",") : null });
  };

  const applyPrice = () => {
    pushParams({
      minPrice: minInput.trim() || null,
      maxPrice: maxInput.trim() || null,
    });
  };

  const handlePriceKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") applyPrice();
  };

  return (
    <div className="space-y-4">
      {compatibilityGroups.length > 0 && (
        <div className="rounded-card border border-border p-4">
          <p className="font-semibold text-sm mb-3">Совместимость</p>
          <div className="space-y-3 text-sm max-h-72 overflow-y-auto">
            {compatibilityGroups.map((group) => (
              <div key={group.brand}>
                <p className="text-xs font-semibold text-muted mb-1.5">{group.brand}</p>
                <div className="space-y-1.5">
                  {group.models.map((m) => (
                    <label key={m.slug} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-brand"
                        checked={selectedCompatibility.includes(m.slug)}
                        onChange={(e) => toggleCompatibility(m.slug, e)}
                      />
                      <span>{m.model}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-card border border-border p-4">
        <p className="font-semibold text-sm mb-3">Цена, ₽</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="от"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={handlePriceKeyDown}
            className="w-full rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-brand"
          />
          <span className="text-muted">—</span>
          <input
            type="number"
            min={0}
            placeholder="до"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={handlePriceKeyDown}
            className="w-full rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-brand"
          />
        </div>
      </div>
    </div>
  );
}
