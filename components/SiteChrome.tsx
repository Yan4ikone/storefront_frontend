"use client";

// Хедер и футер витрины показываются везде, кроме админки (/admin/**) — у неё
// своя навигация (см. app/admin/layout.tsx). Раньше Header/Footer рендерились
// прямо в корневом layout.tsx; здесь тот же результат для витрины, но с
// условием по пути, поэтому и вынесено в клиентский компонент (usePathname
// работает только на клиенте).

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import type { Category } from "@/lib/api";

export default function SiteChrome({
  categories,
  children,
}: {
  categories: Category[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header categories={categories} />
      {children}
      <Footer />
    </>
  );
}
