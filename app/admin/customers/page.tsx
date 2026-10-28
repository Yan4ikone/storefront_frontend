"use client";

// Покупатели — пока только список + ручная правка баланса (заглушка, см.
// комментарий у User.balance на бэкенде: реальное пополнение подключится
// вместе с платёжным сервисом).

import { useEffect, useState } from "react";
import { getCustomers, setCustomerBalance, AdminApiError, type AdminCustomer } from "@/lib/admin-api";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftBalance, setDraftBalance] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .catch((e) => setError(e instanceof AdminApiError ? e.message : "Не удалось загрузить покупателей"));
  }, []);

  const startEdit = (customer: AdminCustomer) => {
    setEditingId(customer.id);
    setDraftBalance(String(customer.balance));
  };

  const saveBalance = async (id: string) => {
    const value = Number(draftBalance);
    if (!Number.isFinite(value) || value < 0) return;
    setSaving(true);
    try {
      const updated = await setCustomerBalance(id, Math.round(value));
      setCustomers((prev) => prev?.map((c) => (c.id === id ? updated : c)) ?? null);
      setEditingId(null);
    } catch (e) {
      setError(e instanceof AdminApiError ? e.message : "Не удалось изменить баланс");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Покупатели</h1>
      <p className="text-sm text-muted mb-6">
        Баланс пока меняется только здесь, вручную — онлайн-пополнение подключится вместе с
        платёжным сервисом.
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {customers === null ? (
        <p className="text-muted">Загрузка…</p>
      ) : customers.length === 0 ? (
        <p className="text-muted">Покупателей пока нет.</p>
      ) : (
        <div className="rounded-card border border-border bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Имя</th>
                <th className="px-4 py-3 font-medium">Контакты</th>
                <th className="px-4 py-3 font-medium">Регистрация</th>
                <th className="px-4 py-3 font-medium">Баланс</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{customer.name || "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    {customer.email || "—"}
                    {customer.phone ? ` · ${customer.phone}` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {new Date(customer.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editingId === customer.id ? (
                      <input
                        type="number"
                        min={0}
                        autoFocus
                        value={draftBalance}
                        onChange={(e) => setDraftBalance(e.target.value)}
                        className="w-28 rounded-lg border border-border px-2 py-1 text-sm outline-none focus:border-brand"
                      />
                    ) : (
                      <span className="font-semibold">{formatPrice(customer.balance)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {editingId === customer.id ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => saveBalance(customer.id)}
                          disabled={saving}
                          className="text-xs font-semibold text-brand hover:text-brand-dark disabled:opacity-50"
                        >
                          Сохранить
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-xs font-semibold text-muted hover:text-ink"
                        >
                          Отмена
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(customer)}
                        className="text-xs font-semibold text-brand hover:text-brand-dark"
                      >
                        Изменить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
