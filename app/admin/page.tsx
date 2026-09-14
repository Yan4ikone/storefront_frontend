"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Folder, Package, ShoppingBag } from "lucide-react";
import {
  getCategories,
  getProducts,
  getOrders,
  AdminApiError,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/admin-api";

interface Stats {
  categories: number;
  products: number;
  ordersByStatus: Record<OrderStatus, number>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getCategories(), getProducts(), getOrders()])
      .then(([categories, products, orders]) => {
        const ordersByStatus = {
          new: 0,
          confirmed: 0,
          done: 0,
          cancelled: 0,
        } as Record<OrderStatus, number>;
        for (const order of orders) {
          const status = order.status as OrderStatus;
          if (status in ordersByStatus) ordersByStatus[status] += 1;
        }
        setStats({ categories: categories.length, products: products.length, ordersByStatus });
      })
      .catch((e) =>
        setError(e instanceof AdminApiError ? e.message : "Не удалось загрузить данные")
      );
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Обзор</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {!stats ? (
        <p className="text-muted">Загрузка…</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Link
              href="/admin/categories"
              className="rounded-card border border-border bg-white p-5 hover:border-brand transition-colors"
            >
              <Folder className="text-brand mb-2" size={22} />
              <p className="text-2xl font-bold">{stats.categories}</p>
              <p className="text-muted text-sm">Разделов каталога</p>
            </Link>
            <Link
              href="/admin/products"
              className="rounded-card border border-border bg-white p-5 hover:border-brand transition-colors"
            >
              <Package className="text-brand mb-2" size={22} />
              <p className="text-2xl font-bold">{stats.products}</p>
              <p className="text-muted text-sm">Товаров</p>
            </Link>
            <Link
              href="/admin/orders"
              className="rounded-card border border-border bg-white p-5 hover:border-brand transition-colors"
            >
              <ShoppingBag className="text-brand mb-2" size={22} />
              <p className="text-2xl font-bold">{stats.ordersByStatus.new}</p>
              <p className="text-muted text-sm">Новых заказов</p>
            </Link>
          </div>

          <div className="rounded-card border border-border bg-white p-5">
            <p className="font-semibold mb-3">Заказы по статусам</p>
            <div className="space-y-2 text-sm">
              {(Object.keys(stats.ordersByStatus) as OrderStatus[]).map((status) => (
                <div key={status} className="flex justify-between">
                  <span className="text-muted">{ORDER_STATUS_LABELS[status]}</span>
                  <span className="font-medium">{stats.ordersByStatus[status]}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
