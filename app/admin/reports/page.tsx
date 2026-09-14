"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import {
  getReportsSummary,
  getReportsOrders,
  downloadReportsSummary,
  downloadReportsOrders,
  AdminApiError,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  REPORT_GROUP_BY,
  REPORT_GROUP_BY_LABELS,
  type ReportsSummary,
  type AdminOrder,
  type ReportGroupBy,
  type OrderStatus,
} from "@/lib/admin-api";

function formatDateInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// По умолчанию — текущий календарный месяц, тот же дефолт, что и на бэкенде,
// если бы даты вообще не передавались (см. AdminReportsService.resolveRange).
function defaultRange() {
  const now = new Date();
  return {
    from: formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: formatDateInput(now),
  };
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  confirmed: "bg-amber-100 text-amber-700",
  done: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminReportsPage() {
  const initial = defaultRange();
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [groupBy, setGroupBy] = useState<ReportGroupBy>("day");
  const [status, setStatus] = useState<OrderStatus | "">("");

  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<"summary" | "orders" | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    const filters = { from, to, groupBy, status: status || undefined };
    Promise.all([getReportsSummary(filters), getReportsOrders(filters)])
      .then(([summaryData, ordersData]) => {
        setSummary(summaryData);
        setOrders(ordersData);
      })
      .catch((e) =>
        setError(e instanceof AdminApiError ? e.message : "Не удалось загрузить отчёт")
      )
      .finally(() => setLoading(false));
  };

  // Отчёт грузится один раз при открытии страницы с дефолтным периодом —
  // дальше по кнопке "Показать" с уже выбранными фильтрами.
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async (kind: "summary" | "orders") => {
    setDownloading(kind);
    setError(null);
    try {
      const filters = { from, to, groupBy, status: status || undefined };
      if (kind === "summary") {
        await downloadReportsSummary(filters);
      } else {
        await downloadReportsOrders(filters);
      }
    } catch (e) {
      setError(e instanceof AdminApiError ? e.message : "Не удалось скачать файл");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Отчёты для бухгалтерии</h1>

      <div className="rounded-card border border-border bg-white p-4 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs text-muted mb-1.5">С даты</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-card border border-border px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">По дату</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-card border border-border px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">Группировка</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as ReportGroupBy)}
            className="rounded-card border border-border px-3 py-2 text-sm outline-none focus:border-brand bg-white"
          >
            {REPORT_GROUP_BY.map((g) => (
              <option key={g} value={g}>
                {REPORT_GROUP_BY_LABELS[g]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">Статус (для реестра)</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | "")}
            className="rounded-card border border-border px-3 py-2 text-sm outline-none focus:border-brand bg-white"
          >
            <option value="">Все статусы</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="h-10 px-4 rounded-card bg-brand hover:bg-brand-dark disabled:opacity-50 transition-colors text-white text-sm font-semibold"
        >
          {loading ? "Загрузка…" : "Показать"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">Выручка и заказы по периодам</h2>
        <button
          type="button"
          onClick={() => handleDownload("summary")}
          disabled={downloading === "summary" || !summary}
          className="flex items-center gap-2 h-9 px-3.5 rounded-card border border-border hover:border-brand disabled:opacity-50 transition-colors text-sm font-medium"
        >
          <Download size={15} />
          {downloading === "summary" ? "Готовим файл…" : "Скачать Excel"}
        </button>
      </div>

      {summary === null ? (
        <p className="text-muted mb-8">Загрузка…</p>
      ) : summary.rows.length === 0 ? (
        <p className="text-muted mb-8">За выбранный период заказов нет.</p>
      ) : (
        <div className="rounded-card border border-border bg-white overflow-hidden mb-3">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Период</th>
                <th className="px-4 py-3 font-medium text-right">Заказов</th>
                <th className="px-4 py-3 font-medium text-right">Выручка</th>
                <th className="px-4 py-3 font-medium text-right">Отменено, шт</th>
                <th className="px-4 py-3 font-medium text-right">Отменено, ₽</th>
              </tr>
            </thead>
            <tbody>
              {summary.rows.map((row) => (
                <tr key={row.period} className="border-t border-border">
                  <td className="px-4 py-3">{row.period}</td>
                  <td className="px-4 py-3 text-right">{row.ordersCount}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {row.revenue.toLocaleString("ru-RU")} ₽
                  </td>
                  <td className="px-4 py-3 text-right text-muted">{row.cancelledCount}</td>
                  <td className="px-4 py-3 text-right text-muted">
                    {row.cancelledAmount.toLocaleString("ru-RU")} ₽
                  </td>
                </tr>
              ))}
              <tr className="border-t border-border bg-surface font-semibold">
                <td className="px-4 py-3">Итого</td>
                <td className="px-4 py-3 text-right">{summary.totals.ordersCount}</td>
                <td className="px-4 py-3 text-right">
                  {summary.totals.revenue.toLocaleString("ru-RU")} ₽
                </td>
                <td className="px-4 py-3 text-right text-muted">{summary.totals.cancelledCount}</td>
                <td className="px-4 py-3 text-right text-muted">
                  {summary.totals.cancelledAmount.toLocaleString("ru-RU")} ₽
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted mb-8 max-w-2xl">
        «Выручка» здесь — сумма по всем заказам за период, кроме отменённых.
        Онлайн-оплаты и фискализации в магазине пока нет — заказ создаётся как
        заявка (см. страницу «Заказы»), поэтому это ориентировочная сумма
        продаж по заявкам, а не подтверждённое поступление денег. Для точных
        сумм к оплате сверяйте с фактическими поступлениями.
      </p>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">Реестр заказов за период</h2>
        <button
          type="button"
          onClick={() => handleDownload("orders")}
          disabled={downloading === "orders" || !orders}
          className="flex items-center gap-2 h-9 px-3.5 rounded-card border border-border hover:border-brand disabled:opacity-50 transition-colors text-sm font-medium"
        >
          <Download size={15} />
          {downloading === "orders" ? "Готовим файл…" : "Скачать Excel"}
        </button>
      </div>

      {orders === null ? (
        <p className="text-muted">Загрузка…</p>
      ) : orders.length === 0 ? (
        <p className="text-muted">За выбранный период заказов нет.</p>
      ) : (
        <div className="rounded-card border border-border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Дата</th>
                <th className="px-4 py-3 font-medium">Покупатель</th>
                <th className="px-4 py-3 font-medium">Доставка</th>
                <th className="px-4 py-3 font-medium text-right">Сумма</th>
                <th className="px-4 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const orderStatus = order.status as OrderStatus;
                return (
                  <tr key={order.id} className="border-t border-border">
                    <td className="px-4 py-3 text-muted">{formatDateTime(order.createdAt)}</td>
                    <td className="px-4 py-3 font-medium">{order.customerName}</td>
                    <td className="px-4 py-3 text-muted">
                      {order.deliveryMethod === "courier" ? "Курьер/ТК" : "Самовывоз"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {order.itemsTotal.toLocaleString("ru-RU")} ₽
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          STATUS_STYLES[orderStatus] ?? "bg-surface text-muted"
                        }`}
                      >
                        {ORDER_STATUS_LABELS[orderStatus] ?? order.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
