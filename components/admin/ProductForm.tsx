"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  getCategories,
  getCompatibilityModels,
  type AdminCategory,
  type CompatibilityGroup,
} from "@/lib/admin-api";

export interface ProductSpecValue {
  label: string;
  value: string;
}

export interface ProductFormValues {
  slug: string;
  name: string;
  categorySlug: string;
  compatibility: string;
  price: number;
  oldPrice: number | null;
  badge: string;
  article: string;
  description: string;
  specs: ProductSpecValue[];
  inStock: boolean;
  // Модели устройств для фильтра "Совместимость" на витрине — независимо от
  // текстового поля compatibility выше (оно только для отображения на карточке).
  compatibilityModelSlugs: string[];
}

interface ProductFormProps {
  mode: "create" | "edit";
  initial?: ProductFormValues;
  submitting?: boolean;
  error?: string | null;
  onSubmit: (values: ProductFormValues) => void;
}

export default function ProductForm({
  mode,
  initial,
  submitting,
  error,
  onSubmit,
}: ProductFormProps) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [compatibilityGroups, setCompatibilityGroups] = useState<CompatibilityGroup[]>([]);
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [categorySlug, setCategorySlug] = useState(initial?.categorySlug ?? "");
  const [compatibility, setCompatibility] = useState(initial?.compatibility ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [oldPrice, setOldPrice] = useState(
    initial?.oldPrice != null ? String(initial.oldPrice) : ""
  );
  const [badge, setBadge] = useState(initial?.badge ?? "");
  const [article, setArticle] = useState(initial?.article ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [specs, setSpecs] = useState<ProductSpecValue[]>(initial?.specs ?? []);
  const [inStock, setInStock] = useState(initial?.inStock ?? true);
  const [compatibilityModelSlugs, setCompatibilityModelSlugs] = useState<string[]>(
    initial?.compatibilityModelSlugs ?? []
  );

  useEffect(() => {
    getCategories()
      .then((list) => {
        setCategories(list);
        setCategorySlug((current) => current || list[0]?.slug || "");
      })
      .catch(() => {
        // Список для выпадающего меню — если не загрузился, просто останется
        // пустым, а ошибку сохранения покажет сама форма при попытке отправки.
      });
    getCompatibilityModels()
      .then(setCompatibilityGroups)
      .catch(() => {
        // Список моделей для чекбоксов — если не загрузился, форма всё равно
        // сохранит товар, просто без привязки к моделям устройств.
      });
  }, []);

  const toggleCompatibilityModel = (modelSlug: string, checked: boolean) => {
    setCompatibilityModelSlugs((prev) =>
      checked ? [...prev, modelSlug] : prev.filter((s) => s !== modelSlug)
    );
  };

  const updateSpec = (index: number, patch: Partial<ProductSpecValue>) => {
    setSpecs((prev) => prev.map((spec, i) => (i === index ? { ...spec, ...patch } : spec)));
  };

  const removeSpec = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const addSpec = () => {
    setSpecs((prev) => [...prev, { label: "", value: "" }]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      slug: slug.trim(),
      name: name.trim(),
      categorySlug,
      compatibility: compatibility.trim(),
      price: Number(price),
      oldPrice: oldPrice.trim() ? Number(oldPrice) : null,
      badge: badge.trim(),
      article: article.trim(),
      description: description.trim(),
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      inStock,
      compatibilityModelSlugs,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Slug (часть адреса, например <code>battery-iphone-12</code>)
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
            Slug нельзя изменить — на него ссылаются уже оформленные заказы.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          <label className="block text-sm font-medium mb-1.5">Раздел</label>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            required
            className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand bg-white"
          >
            {categories.length === 0 && <option value="">Загрузка…</option>}
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Совместимость (текст на карточке)</label>
        <input
          type="text"
          value={compatibility}
          onChange={(e) => setCompatibility(e.target.value)}
          placeholder="Например: iPhone 12 / 12 Pro"
          required
          className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          Модели устройств (для фильтра "Совместимость" на витрине)
        </label>
        {compatibilityGroups.length === 0 ? (
          <p className="text-xs text-muted">
            Список моделей не загрузился или пока пуст — товар можно сохранить и без него.
          </p>
        ) : (
          <div className="rounded-card border border-border p-3 space-y-3 max-h-56 overflow-y-auto">
            {compatibilityGroups.map((group) => (
              <div key={group.brand}>
                <p className="text-xs font-semibold text-muted mb-1.5">{group.brand}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {group.models.map((m) => (
                    <label key={m.slug} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-brand"
                        checked={compatibilityModelSlugs.includes(m.slug)}
                        onChange={(e) => toggleCompatibilityModel(m.slug, e.target.checked)}
                      />
                      <span>{m.model}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted mt-1">
          Не отмечена ни одна модель — товар считается универсальным и не попадёт в фильтр по модели устройства.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Цена, ₽</label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Старая цена, ₽</label>
          <input
            type="number"
            min={0}
            value={oldPrice}
            onChange={(e) => setOldPrice(e.target.value)}
            placeholder="Необязательно"
            className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Бейдж</label>
          <input
            type="text"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="Например: Хит"
            className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1.5">Артикул</label>
          <input
            type="text"
            value={article}
            onChange={(e) => setArticle(e.target.value)}
            placeholder="Например: BAT-001"
            className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand"
          />
          <p className="text-xs text-muted mt-1">Необязательно, но должен быть уникальным.</p>
        </div>
        <div className="pb-2.5">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              className="accent-brand"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
            />
            В наличии
          </label>
          <p className="text-xs text-muted mt-1">
            Снято — на витрине покажется бейдж «Под заказ».
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Описание</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
          className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium">Характеристики</label>
          <button
            type="button"
            onClick={addSpec}
            className="flex items-center gap-1.5 text-sm text-brand hover:text-brand-dark font-medium"
          >
            <Plus size={14} />
            Добавить строку
          </button>
        </div>
        <div className="space-y-2">
          {specs.map((spec, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={spec.label}
                onChange={(e) => updateSpec(index, { label: e.target.value })}
                placeholder="Параметр"
                className="w-1/2 rounded-card border border-border px-3.5 py-2 text-sm outline-none focus:border-brand"
              />
              <input
                type="text"
                value={spec.value}
                onChange={(e) => updateSpec(index, { value: e.target.value })}
                placeholder="Значение"
                className="w-1/2 rounded-card border border-border px-3.5 py-2 text-sm outline-none focus:border-brand"
              />
              <button
                type="button"
                onClick={() => removeSpec(index)}
                aria-label="Удалить строку"
                className="text-muted hover:text-red-600 px-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {specs.length === 0 && <p className="text-xs text-muted">Характеристик пока нет.</p>}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="h-11 px-6 rounded-card bg-brand hover:bg-brand-dark disabled:opacity-50 transition-colors text-white font-semibold"
      >
        {submitting ? "Сохраняем…" : mode === "create" ? "Создать товар" : "Сохранить"}
      </button>
    </form>
  );
}
