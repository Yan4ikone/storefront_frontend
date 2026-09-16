"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { getCategories, type AdminCategory } from "@/lib/admin-api";

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
  // Ожидаемый срок/дата поступления — свободный текст, актуален прежде всего
  // для товаров "под заказ" (inStock=false), но жёстко с ним не связан.
  expectedDelivery: string;
  // Модели устройств для фильтра "Совместимость" на витрине — в этой форме не
  // редактируются (поле убрано из админки по решению — совместимость теперь
  // прописывается прямо в наименовании/тексте товара), но значение сохраняется
  // как было при редактировании существующего товара, чтобы не терять уже
  // выставленные ранее связи "молча" при простом сохранении других полей.
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
  const [expectedDelivery, setExpectedDelivery] = useState(initial?.expectedDelivery ?? "");
  // Не редактируется в этой форме (см. комментарий в ProductFormValues выше) —
  // просто сохраняем как было, чтобы отправить обратно без изменений.
  const compatibilityModelSlugs = initial?.compatibilityModelSlugs ?? [];

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
  }, []);

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
      expectedDelivery: expectedDelivery.trim(),
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
        <label className="block text-sm font-medium mb-1.5">Ожидается доставка</label>
        <input
          type="text"
          value={expectedDelivery}
          onChange={(e) => setExpectedDelivery(e.target.value)}
          placeholder="Например: 20.09 или 5-7 дней"
          className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand"
        />
        <p className="text-xs text-muted mt-1">
          Необязательно. Показывается на витрине рядом с пометкой «Под заказ».
        </p>
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
