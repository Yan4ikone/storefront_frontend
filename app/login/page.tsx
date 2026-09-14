"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useAuth, AuthApiError } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");

  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchTab = (next: "login" | "register") => {
    setTab(next);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === "login") {
        await login({ emailOrPhone: identifier.trim(), password });
      } else {
        // Одно поле "телефон или email", как в исходном макете — определяем,
        // что ввёл человек, по наличию "@".
        const isEmail = identifier.includes("@");
        await register({
          name: name.trim() || undefined,
          email: isEmail ? identifier.trim() : undefined,
          phone: isEmail ? undefined : identifier.trim(),
          password,
        });
      }
      router.push("/account");
    } catch (err) {
      setError(
        err instanceof AuthApiError ? err.message : "Что-то пошло не так, попробуйте ещё раз"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Вход" }]} />

      <div className="max-w-container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-sm">
          <div className="flex rounded-card border border-border overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => switchTab("login")}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tab === "login" ? "bg-brand text-white" : "bg-white text-muted"
              }`}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => switchTab("register")}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tab === "register" ? "bg-brand text-white" : "bg-white text-muted"
              }`}
            >
              Регистрация
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-card border border-border bg-white p-6 space-y-4"
          >
            <h1 className="text-lg font-bold mb-1">
              {tab === "login" ? "Вход в личный кабинет" : "Регистрация"}
            </h1>

            {tab === "register" && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Как к вам обращаться"
                  className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">Телефон или email</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="+7 (___) ___-__-__ или email"
                className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-card bg-brand hover:bg-brand-dark disabled:opacity-50 transition-colors text-white font-semibold"
            >
              {loading ? "Секунду…" : tab === "login" ? "Войти" : "Зарегистрироваться"}
            </button>

            {tab === "register" && (
              <p className="text-xs text-muted text-center">
                Без подтверждения по почте/смс — сразу можно пользоваться личным кабинетом.
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
