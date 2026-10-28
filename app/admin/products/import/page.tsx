"use client";

// Массовое добавление товаров из прайс-листа/накладной поставщика (.xlsx).
// Пользователь явно попросил эту возможность, увидев реальный заказ у
// поставщика с колонками "Артикул/Товары/Количество/Цена" — но у такого
// файла нет фиксированного шаблона (сам пользователь предупредил, что
// таблица "пока не конечная"), поэтому вместо жёсткого парсера под один
// конкретный формат — ручная привязка колонок: админ сам указывает, в какой
// колонке лежит артикул/название/цена, после чего видит превью и может
// скорректировать категорию, slug и исключить отдельные строки перед тем,
// как подтвердить импорт.
//
// Решения пользователя (CloudAI, 28.10.2026):
// - категория не определяется автоматически (в одной накладной могут быть
//   товары из разных разделов) — выбирается в этой же таблице, по строке;
// - если артикул уже есть в каталоге — обновляем цену и название у
//   существующего товара, а не создаём дубликат.

import { useMemo, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { ArrowLeft, CheckCircle2, Loader2, Upload, XCircle } from "lucide-react";
import {
  getCategories,
  getProducts,
  createProduct,
  updateProduct,
  AdminApiError,
  type AdminCategory,
  type AdminProduct,
} from "@/lib/admin-api";

type SheetCell = string | number | null;
type SheetRow = SheetCell[];

interface ParsedRow {
  key: string;
  rowIndex: number; // индекс строки в исходном файле — для отображения "строка N"
  include: boolean;
  article: string;
  name: string;
  price: number | null;
  slug: string;
  categorySlug: string;
  matchedExisting: AdminProduct | null;
}

type ImportResult = { key: string; status: "created" | "updated" | "error"; message?: string };

function excelColLetter(index: number): string {
  let s = "";
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function cellToString(cell: SheetCell): string {
  if (cell === null || cell === undefined) return "";
  return String(cell).trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parsePrice(cell: SheetCell): number | null {
  if (cell === null || cell === undefined || cell === "") return null;
  const num = typeof cell === "number" ? cell : Number(String(cell).replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(num)) return null;
  return Math.round(num);
}

export default function ImportProductsPage() {
  const [sheet, setSheet] = useState<SheetRow[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);

  // Колонки, в которых хоть где-то в файле есть значение — в реальных
  // накладных из-за объединённых ячеек большинство из 70-80 "колонок"
  // пустые везде, кроме одной; показывать их все в выпадающем списке только
  // мешало бы, поэтому выбор сужен до реально заполненных.
  const usedColumns = useMemo(() => {
    if (!sheet) return [];
    const set = new Set<number>();
    for (const row of sheet) {
      row.forEach((cell, i) => {
        if (cell !== null && cell !== undefined && String(cell).trim() !== "") set.add(i);
      });
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [sheet]);

  const sampleForColumn = (colIndex: number): string => {
    if (!sheet) return "";
    for (const row of sheet) {
      const v = cellToString(row[colIndex] ?? null);
      if (v) return v;
    }
    return "";
  };

  const [articleCol, setArticleCol] = useState<number | null>(null);
  const [nameCol, setNameCol] = useState<number | null>(null);
  const [priceCol, setPriceCol] = useState<number | null>(null);
  const [startRow, setStartRow] = useState(1); // 1-based номер строки в превью

  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [loadingLookups, setLoadingLookups] = useState(false);
  // byArticle/usedSlugs — не состояние: нужны только внутри buildPreview,
  // чтобы разметить строки (совпадение по артикулу, занятые slug'и), и не
  // используются больше нигде после построения превью.
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);

  const handleFile = async (file: File) => {
    setParseError(null);
    setSheet(null);
    setRows(null);
    setResults(null);
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) throw new Error("В файле нет листов");
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json<SheetRow>(worksheet, {
        header: 1,
        raw: true,
        defval: null,
      });
      if (data.length === 0) throw new Error("Лист пустой");
      setSheet(data);

      // Пытаемся угадать колонки и строку начала данных по заголовкам —
      // срабатывает на файлах вида "Артикул / Товары / Количество / Цена",
      // но это только подсказка: все три выбора можно поправить руками.
      let guessArticle: number | null = null;
      let guessName: number | null = null;
      let guessPrice: number | null = null;
      let headerRow = -1;
      data.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
          const text = cellToString(cell).toLowerCase();
          if (!text) return;
          if (text.includes("артикул")) {
            guessArticle = cIdx;
            headerRow = rIdx;
          } else if (text.includes("товар") || text.includes("наимен")) {
            guessName = cIdx;
            headerRow = rIdx;
          } else if (text.includes("цена")) {
            guessPrice = cIdx;
            headerRow = rIdx;
          }
        });
      });
      setArticleCol(guessArticle);
      setNameCol(guessName);
      setPriceCol(guessPrice);

      if (headerRow >= 0 && guessArticle !== null) {
        const dataStart = data.findIndex(
          (row, idx) => idx > headerRow && cellToString(row[guessArticle as number] ?? null) !== ""
        );
        setStartRow(dataStart >= 0 ? dataStart + 1 : headerRow + 2);
      } else {
        setStartRow(1);
      }
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Не удалось прочитать файл");
    }
  };

  const canBuildPreview = sheet !== null && articleCol !== null && nameCol !== null;

  const buildPreview = async () => {
    if (!sheet || articleCol === null || nameCol === null) return;
    setLookupError(null);
    setLoadingLookups(true);
    try {
      const [cats, products] = await Promise.all([getCategories(), getProducts()]);
      setCategories(cats);
      const byArticle = new Map<string, AdminProduct>();
      const slugs = new Set<string>();
      for (const p of products) {
        slugs.add(p.slug);
        if (p.article) byArticle.set(p.article.trim().toLowerCase(), p);
      }

      const defaultCategory = cats[0]?.slug ?? "";
      const parsed: ParsedRow[] = [];
      const usedSlugsInBatch = new Set<string>();
      for (let i = startRow - 1; i < sheet.length; i++) {
        const row = sheet[i];
        const article = cellToString(row[articleCol] ?? null);
        const name = cellToString(row[nameCol] ?? null);
        if (!article && !name) continue; // пустая/итоговая строка — пропускаем

        const price = priceCol !== null ? parsePrice(row[priceCol] ?? null) : null;
        const existing = article ? (byArticle.get(article.toLowerCase()) ?? null) : null;

        let slug = existing ? existing.slug : slugify(article || name);
        if (!existing) {
          // На случай совпадения с уже существующим slug (другой товар без
          // этого артикула) или дублей внутри самого файла — добавляем
          // числовой суффикс, чтобы не блокировать весь импорт одной строкой.
          let suffix = 2;
          const base = slug;
          while (slugs.has(slug) || usedSlugsInBatch.has(slug)) {
            slug = `${base}-${suffix}`;
            suffix += 1;
          }
          usedSlugsInBatch.add(slug);
        }

        parsed.push({
          key: `${i}`,
          rowIndex: i + 1,
          include: true,
          article,
          name: name || article,
          price,
          slug,
          categorySlug: existing ? existing.categorySlug : defaultCategory,
          matchedExisting: existing,
        });
      }
      setRows(parsed);
    } catch (e) {
      setLookupError(
        e instanceof AdminApiError ? e.message : "Не удалось загрузить категории/товары для сверки"
      );
    } finally {
      setLoadingLookups(false);
    }
  };

  const updateRow = (key: string, patch: Partial<ParsedRow>) => {
    setRows((prev) => (prev ? prev.map((r) => (r.key === key ? { ...r, ...patch } : r)) : prev));
  };

  const includedRows = rows?.filter((r) => r.include) ?? [];
  const newRowsMissingCategory = includedRows.filter((r) => !r.matchedExisting && !r.categorySlug);
  const canImport =
    includedRows.length > 0 && newRowsMissingCategory.length === 0 && includedRows.every((r) => r.price !== null);

  const handleImport = async () => {
    if (!rows) return;
    setImporting(true);
    setResults(null);
    const outcome: ImportResult[] = [];
    for (const row of rows) {
      if (!row.include) continue;
      try {
        if (row.matchedExisting) {
          await updateProduct(row.matchedExisting.slug, { name: row.name, price: row.price ?? undefined });
          outcome.push({ key: row.key, status: "updated" });
        } else {
          await createProduct({
            slug: row.slug,
            name: row.name,
            categorySlug: row.categorySlug,
            compatibility: "",
            price: row.price ?? 0,
            description: row.name,
            specs: [],
            article: row.article || undefined,
            inStock: true,
          });
          outcome.push({ key: row.key, status: "created" });
        }
      } catch (e) {
        outcome.push({
          key: row.key,
          status: "error",
          message: e instanceof AdminApiError ? e.message : "Не удалось сохранить товар",
        });
      }
    }
    setResults(outcome);
    setImporting(false);
  };

  const createdCount = results?.filter((r) => r.status === "created").length ?? 0;
  const updatedCount = results?.filter((r) => r.status === "updated").length ?? 0;
  const errorResults = results?.filter((r) => r.status === "error") ?? [];

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-muted hover:text-brand">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold">Импорт товаров из Excel</h1>
      </div>

      {!sheet && (
        <div className="rounded-card border border-border bg-white p-6">
          <p className="text-sm text-muted mb-4">
            Загрузите прайс-лист или накладную от поставщика (.xlsx). Формат файла может быть
            любым — на следующем шаге вы сами укажете, в каких колонках лежат артикул, название и
            цена.
          </p>
          <label className="flex items-center gap-2 h-10 px-4 rounded-card bg-brand hover:bg-brand-dark transition-colors text-white text-sm font-semibold cursor-pointer w-fit">
            <Upload size={16} />
            Выбрать файл
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
          {parseError && <p className="text-sm text-red-600 mt-3">{parseError}</p>}
        </div>
      )}

      {sheet && !rows && (
        <div className="rounded-card border border-border bg-white p-6">
          <p className="text-sm font-medium mb-1">{fileName}</p>
          <p className="text-xs text-muted mb-4">
            Строк в файле: {sheet.length}. Укажите, в какой колонке что лежит (подсказка — первое
            непустое значение этой колонки).
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">Колонка «Артикул»</label>
              <select
                value={articleCol ?? ""}
                onChange={(e) => setArticleCol(e.target.value === "" ? null : Number(e.target.value))}
                className="w-full h-10 rounded-card border border-border px-3 text-sm bg-white"
              >
                <option value="">— не выбрано —</option>
                {usedColumns.map((c) => (
                  <option key={c} value={c}>
                    {excelColLetter(c)} — {sampleForColumn(c).slice(0, 30)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Колонка «Название»</label>
              <select
                value={nameCol ?? ""}
                onChange={(e) => setNameCol(e.target.value === "" ? null : Number(e.target.value))}
                className="w-full h-10 rounded-card border border-border px-3 text-sm bg-white"
              >
                <option value="">— не выбрано —</option>
                {usedColumns.map((c) => (
                  <option key={c} value={c}>
                    {excelColLetter(c)} — {sampleForColumn(c).slice(0, 30)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Колонка «Цена»</label>
              <select
                value={priceCol ?? ""}
                onChange={(e) => setPriceCol(e.target.value === "" ? null : Number(e.target.value))}
                className="w-full h-10 rounded-card border border-border px-3 text-sm bg-white"
              >
                <option value="">— не выбрано —</option>
                {usedColumns.map((c) => (
                  <option key={c} value={c}>
                    {excelColLetter(c)} — {sampleForColumn(c).slice(0, 30)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs text-muted mb-1.5">
              Строка, с которой начинаются товары (строки выше — заголовок, пропускаются)
            </label>
            <input
              type="number"
              min={1}
              max={sheet.length}
              value={startRow}
              onChange={(e) => setStartRow(Number(e.target.value) || 1)}
              className="w-32 h-10 rounded-card border border-border px-3 text-sm"
            />
          </div>

          {lookupError && <p className="text-sm text-red-600 mb-3">{lookupError}</p>}

          <button
            type="button"
            onClick={buildPreview}
            disabled={!canBuildPreview || loadingLookups}
            className="h-10 px-4 rounded-card bg-brand hover:bg-brand-dark disabled:opacity-50 transition-colors text-white text-sm font-semibold"
          >
            {loadingLookups ? "Загрузка…" : "Показать превью"}
          </button>
        </div>
      )}

      {rows && !results && (
        <div className="rounded-card border border-border bg-white overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-muted">
              Найдено строк: {rows.length}. Отметьте, какие импортировать, при необходимости
              поправьте раздел/slug/цену.
            </p>
            <button
              type="button"
              onClick={handleImport}
              disabled={!canImport || importing}
              className="h-10 px-4 rounded-card bg-brand hover:bg-brand-dark disabled:opacity-50 transition-colors text-white text-sm font-semibold flex items-center gap-2"
            >
              {importing && <Loader2 size={16} className="animate-spin" />}
              Импортировать ({includedRows.length})
            </button>
          </div>
          {newRowsMissingCategory.length > 0 && (
            <p className="text-sm text-amber-600 px-4 pt-3">
              У {newRowsMissingCategory.length} новых товаров не выбран раздел каталога — без
              этого их нельзя создать.
            </p>
          )}
          {includedRows.some((r) => r.price === null) && (
            <p className="text-sm text-amber-600 px-4 pt-3">
              У части строк не распозналась цена — проверьте выбранную колонку «Цена» или
              исправьте значение вручную.
            </p>
          )}

          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-muted">
              <tr>
                <th className="px-3 py-2 font-medium" />
                <th className="px-3 py-2 font-medium">Строка</th>
                <th className="px-3 py-2 font-medium">Артикул</th>
                <th className="px-3 py-2 font-medium">Название</th>
                <th className="px-3 py-2 font-medium">Slug</th>
                <th className="px-3 py-2 font-medium">Раздел</th>
                <th className="px-3 py-2 font-medium">Цена</th>
                <th className="px-3 py-2 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-t border-border align-top">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={row.include}
                      onChange={(e) => updateRow(row.key, { include: e.target.checked })}
                    />
                  </td>
                  <td className="px-3 py-2 text-muted">{row.rowIndex}</td>
                  <td className="px-3 py-2 text-muted whitespace-nowrap">{row.article || "—"}</td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateRow(row.key, { name: e.target.value })}
                      className="w-full h-8 rounded border border-border px-2 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    {row.matchedExisting ? (
                      <span className="text-muted">{row.slug}</span>
                    ) : (
                      <input
                        type="text"
                        value={row.slug}
                        onChange={(e) => updateRow(row.key, { slug: slugify(e.target.value) })}
                        className="w-40 h-8 rounded border border-border px-2 text-sm"
                      />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {row.matchedExisting ? (
                      <span className="text-muted text-xs">не меняется</span>
                    ) : (
                      <select
                        value={row.categorySlug}
                        onChange={(e) => updateRow(row.key, { categorySlug: e.target.value })}
                        className="h-8 rounded border border-border px-2 text-sm bg-white"
                      >
                        <option value="">— выберите —</option>
                        {categories?.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      value={row.price ?? ""}
                      onChange={(e) =>
                        updateRow(row.key, { price: e.target.value === "" ? null : Number(e.target.value) })
                      }
                      className="w-24 h-8 rounded border border-border px-2 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {row.matchedExisting ? (
                      <span className="text-amber-600">Обновит «{row.matchedExisting.name}»</span>
                    ) : (
                      <span className="text-green-700">Новый товар</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results && (
        <div className="rounded-card border border-border bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={20} className="text-green-600" />
            <p className="font-semibold">
              Готово: создано {createdCount}, обновлено {updatedCount}
              {errorResults.length > 0 ? `, ошибок ${errorResults.length}` : ""}.
            </p>
          </div>
          {errorResults.length > 0 && (
            <div className="mb-4 space-y-1">
              {errorResults.map((r) => {
                const row = rows?.find((x) => x.key === r.key);
                return (
                  <p key={r.key} className="text-sm text-red-600 flex items-start gap-2">
                    <XCircle size={14} className="mt-0.5 shrink-0" />
                    {row?.article || row?.name}: {r.message}
                  </p>
                );
              })}
            </div>
          )}
          <div className="flex gap-3">
            <Link
              href="/admin/products"
              className="h-10 px-4 rounded-card bg-brand hover:bg-brand-dark transition-colors text-white text-sm font-semibold flex items-center"
            >
              К списку товаров
            </Link>
            <button
              type="button"
              onClick={() => {
                setSheet(null);
                setRows(null);
                setResults(null);
                setFileName("");
              }}
              className="h-10 px-4 rounded-card border border-border hover:border-brand transition-colors text-sm font-medium"
            >
              Импортировать ещё файл
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
