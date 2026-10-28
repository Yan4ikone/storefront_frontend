// Линия прогресса заказа с точками — общий компонент для страницы заказа,
// личного кабинета и админки (везде один и тот же набор статусов и порядок,
// см. ORDER_PROGRESS_STATUSES в lib/api.ts). "cancelled" в линию не входит —
// показывается отдельным бейджем поверх (см. проп cancelled).
import { Check } from "lucide-react";
import { ORDER_PROGRESS_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/api";

export default function OrderProgress({
  status,
  cancellationRequested,
  compact,
}: {
  status: OrderStatus;
  cancellationRequested?: boolean;
  compact?: boolean;
}) {
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700">
        Заказ отменён
      </span>
    );
  }

  const currentIndex = ORDER_PROGRESS_STATUSES.indexOf(status);

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      <div className="flex items-center">
        {ORDER_PROGRESS_STATUSES.map((step, index) => {
          const done = index <= currentIndex;
          const isLast = index === ORDER_PROGRESS_STATUSES.length - 1;
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div
                className={`shrink-0 flex items-center justify-center rounded-full ${
                  compact ? "h-5 w-5" : "h-7 w-7"
                } ${done ? "bg-brand text-white" : "bg-surface text-muted border border-border"}`}
                title={ORDER_STATUS_LABELS[step]}
              >
                {done ? (
                  <Check size={compact ? 11 : 14} strokeWidth={3} />
                ) : (
                  <span className={compact ? "text-[9px]" : "text-[11px]"}>{index + 1}</span>
                )}
              </div>
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-1 ${index < currentIndex ? "bg-brand" : "bg-border"}`}
                />
              )}
            </div>
          );
        })}
      </div>
      {!compact && (
        <div className="flex text-[11px] text-muted">
          {ORDER_PROGRESS_STATUSES.map((step) => (
            <span key={step} className="flex-1 text-center first:text-left last:text-right">
              {ORDER_STATUS_LABELS[step]}
            </span>
          ))}
        </div>
      )}
      {cancellationRequested && (
        <p className="text-xs font-medium text-amber-700 bg-amber-50 rounded-full px-2.5 py-1 inline-block">
          Покупатель запросил отмену
        </p>
      )}
    </div>
  );
}
