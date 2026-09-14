"use client";

import { useState, type FormEvent } from "react";
import { iconMap } from "@/lib/icon-map";

export interface CategoryFormValues {
  slug: string;
  name: string;
  icon: string;
  items: string[];
}

interface CategoryFormProps {
  mode: "create" | "edit";
  initial?: CategoryFormValues;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (values: CategoryFormValues) => void;
}

const ICON_OPTIONS = Object.keys(iconMap);

export default function CategoryForm({
  mode,
  initial,
  submitting,
  error,
  onSubmit,
}: CategoryFormProps) {
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? ICON_OPTIONS[0]);
  const [itemsText, setItemsText] = useState((initial?.items ?? []).join("\n"));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const items = itemsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    onSubmit({ slug: slug.trim(), name: name.trim(), icon, items });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Slug (часть адреса, например <code>battery</code>)
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          disabled={mode === "edit"}
          required
          pattern="[a-z0-9-]+"
          className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand disabled:bg-surface disabled:text-muted"
        />
        {mode === "edit" && (
          <p className="text-xs text-muted mt-1">
            Slug нельзя изменить — удалите раздел и создайте новый, если нужно другое имя в
            адресе.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Название</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Иконка</label>
        <select
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand bg-white"
        >
          {ICON_OPTIONS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted mt-1">
          Если позже понадобится новая иконка — сначала добавьте её в lib/icon-map.ts.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Подпункты (каждый — с новой строки)
        </label>
        <textarea
          value={itemsText}
          onChange={(e) => setItemsText(e.target.value)}
          rows={4}
          className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="h-11 px-6 rounded-card bg-brand hover:bg-brand-dark disabled:opacity-50 transition-colors text-white font-semibold"
      >
        {submitting ? "Сохраняем…" : mode === "create" ? "Создать раздел" : "Сохранить"}
      </button>
    </form>
  );
}
