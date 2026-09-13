import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="max-w-container mx-auto px-4 pt-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-brand">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-ink" : undefined}>{item.label}</span>
              )}
              {!isLast && <ChevronRight size={14} className="text-border" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
