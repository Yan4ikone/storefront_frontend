import { ShieldCheck, Truck, PackageSearch, BadgePercent } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Гарантия до 6 месяцев",
    text: "На большинство товаров",
  },
  {
    icon: Truck,
    title: "Доставка по России",
    text: "Курьером, в ПВЗ или почтой",
  },
  {
    icon: PackageSearch,
    title: "Проверка перед отправкой",
    text: "Каждая позиция тестируется",
  },
  {
    icon: BadgePercent,
    title: "Программа лояльности",
    text: "Скидки постоянным клиентам",
  },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="max-w-container mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <div className="shrink-0 h-10 w-10 rounded-full bg-brand/5 flex items-center justify-center text-brand">
              <item.icon size={20} strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-semibold text-sm leading-snug">{item.title}</p>
              <p className="text-xs text-muted mt-0.5">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
