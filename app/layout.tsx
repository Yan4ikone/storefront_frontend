import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import SiteChrome from "@/components/SiteChrome";
import { getCategories } from "@/lib/api";

export const metadata: Metadata = {
  title: "МобДетали — запчасти и аксессуары для смартфонов",
  description:
    "Интернет-магазин запчастей, инструментов и аксессуаров для смартфонов и ноутбуков.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <html lang="ru">
      <body>
        <CartProvider>
          <SiteChrome categories={categories}>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
