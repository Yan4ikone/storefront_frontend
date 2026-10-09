"use client";

// Личный кабинет покупателя — вкладки "Профиль" (данные, смена пароля,
// баланс), "Заказы" (4 последних, остальные — на /account/orders) и
// "Избранное" (ссылка на /account/favorites, сам список — там).

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import OrderCard from "@/components/account/OrderCard";
import { useAuth, AuthApiError, getCustomerToken } from "@/lib/auth-context";
import { getMyOrders, updateMe, changePassword, type MyOrder } from "@/lib/auth-api";
import { User, History, Heart, Wallet } from "lucide-react";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

export default function AccountPage() {
  const router = useRouter();
  const { status, user, logout, refresh } = useAuth();
  const [tab, setTab] = useState<"profile" | "orders">("profile");
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Профиль
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Смена пароля
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const token = getCustomerToken();
    if (!token) return;
    getMyOrders(token)
      .then(setOrders)
      .catch((e) =>
        setError(e instanceof AuthApiError ? e.message : "Не удалось загрузить заказы")
      );
  }, [status]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCustomerToken();
    if (!token) return;
    setProfileSaving(true);
    setProfileMessage(null);
    setProfileError(null);
    try {
      await updateMe(token, {
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      await refresh();
      setProfileMessage("Данные сохранены");
    } catch (e) {
      setProfileError(e instanceof AuthApiError ? e.message : "Не удалось сохранить данные");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCustomerToken();
    if (!token) return;
    setPasswordSaving(true);
    setPasswordMessage(null);
    setPasswordError(null);
    try {
      await changePassword(token, { currentPassword, newPassword });
      setPasswordMessage("Пароль изменён");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      setPasswordError(e instanceof AuthApiError ? e.message : "Не удалось сменить пароль");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleOrderCancelled = (id: string, deleted: boolean) => {
    setOrders((prev) =>
      prev
        ? deleted
          ? prev.filter((o) => o.id !== id)
          : prev.map((o) => (o.id === id ? { ...o, cancellationRequested: true } : o))
        : prev
    );
  };

  if (status === "checking") {
    return <p className="text-muted max-w-container mx-auto px-4 py-12">Загрузка…</p>;
  }

  if (status === "anonymous") {
    return (
      <main>
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Личный кабинет" }]} />
        <div className="max-w-container mx-auto px-4 py-16 text-center">
          <p className="mb-4 text-muted">Чтобы посмотреть личный кабинет, войдите в аккаунт.</p>
          <Link
            href="/login"
            className="inline-block h-11 px-6 rounded-card bg-brand hover:bg-brand-dark text-white font-semibold leading-[44px]"
          >
            Войти
          </Link>
        </div>
      </main>
    );
  }

  const ordersCount = orders?.length ?? null;
  const recentOrders = orders?.slice(0, 4) ?? null;

  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Личный кабинет" }]} />

      <div className="max-w-container mx-auto px-4 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl font-bold">{user?.name || "Личный кабинет"}</h1>
            <p className="text-muted text-sm">{user?.email || user?.phone}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/account/favorites"
              className="h-10 px-4 rounded-card border border-border hover:border-brand transition-colors text-sm font-semibold flex items-center gap-1.5"
            >
              <Heart size={15} />
              Избранное
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="h-10 px-4 rounded-card border border-border hover:border-brand transition-colors text-sm font-semibold"
            >
              Выйти
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-border mb-6">
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              tab === "profile"
                ? "border-brand text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <User size={15} />
            Профиль
          </button>
          <button
            type="button"
            onClick={() => setTab("orders")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              tab === "orders"
                ? "border-brand text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <History size={15} />
            История заказов
            {ordersCount != null && (
              <span className="text-xs text-muted bg-surface px-1.5 py-0.5 rounded-full">
                {ordersCount}
              </span>
            )}
          </button>
        </div>

        {tab === "profile" ? (
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
            <form onSubmit={handleProfileSubmit} className="rounded-card border border-border bg-white p-6 space-y-4">
              <p className="font-semibold">Личные данные</p>
              <div>
                <label className="block text-sm font-medium mb-1.5">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Телефон</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </div>
              {profileMessage && <p className="text-sm text-green-700">{profileMessage}</p>}
              {profileError && <p className="text-sm text-red-600">{profileError}</p>}
              <button
                type="submit"
                disabled={profileSaving}
                className="h-10 px-5 rounded-card bg-brand hover:bg-brand-dark disabled:opacity-60 transition-colors text-white font-semibold text-sm"
              >
                {profileSaving ? "Сохраняем…" : "Сохранить"}
              </button>
            </form>

            <div className="space-y-6">
              <div className="rounded-card border border-border bg-white p-6">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Wallet size={16} />
                    Баланс
                  </p>
                  <span className="text-lg font-bold">{formatPrice(user?.balance ?? 0)}</span>
                </div>
                <p className="text-xs text-muted mb-3">
                  Пополнение онлайн подключится вместе с платёжным сервисом — пока баланс
                  меняет менеджер вручную.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    window.alert(
                      "Онлайн-пополнение баланса скоро будет доступно — сейчас подключается платёжный сервис."
                    )
                  }
                  className="h-9 px-4 rounded-card border border-border hover:border-brand transition-colors text-sm font-semibold"
                >
                  Пополнить
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit} className="rounded-card border border-border bg-white p-6 space-y-4">
                <p className="font-semibold">Смена пароля</p>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Текущий пароль</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Новый пароль</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
                  />
                </div>
                {passwordMessage && <p className="text-sm text-green-700">{passwordMessage}</p>}
                {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="h-10 px-5 rounded-card bg-brand hover:bg-brand-dark disabled:opacity-60 transition-colors text-white font-semibold text-sm"
                >
                  {passwordSaving ? "Сохраняем…" : "Сменить пароль"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div>
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            {recentOrders === null ? (
              <p className="text-muted">Загрузка…</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-muted">Заказов пока нет.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <OrderCard key={order.id} order={order} onCancelled={handleOrderCancelled} />
                ))}
                {ordersCount != null && ordersCount > 4 && (
                  <div className="text-center pt-2">
                    <Link href="/account/orders" className="text-sm text-brand hover:text-brand-dark font-semibold">
                      Показать все заказы ({ordersCount})
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
