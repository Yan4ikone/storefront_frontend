"use client";

import { useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Вход" }]} />

      <div className="max-w-container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-sm">
          <div className="flex rounded-card border border-border overflow-hidden mb-6">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tab === "login" ? "bg-brand text-white" : "bg-white text-muted"
              }`}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tab === "register" ? "bg-brand text-white" : "bg-white text-muted"
              }`}
            >
              Регистрация
            </button>
          </div>

          <form
            className="rounded-card border border-border bg-white p-6 space-y-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <h1 className="text-lg font-bold mb-1">
              {tab === "login" ? "Вход в личный кабинет" : "Регистрация"}
            </h1>

            {tab === "register" && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Имя</label>
                <input
                  type="text"
                  placeholder="Как к вам обращаться"
                  className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Телефон или email
              </label>
              <input
                type="text"
                placeholder="+7 (___) ___-__-__"
                className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Пароль</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-card border border-border px-3.5 py-2.5 text-sm outline-none focus:border-brand"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-card bg-brand hover:bg-brand-dark transition-colors text-white font-semibold"
            >
              {tab === "login" ? "Войти" : "Зарегистрироваться"}
            </button>

            <p className="text-xs text-muted text-center">
              Форма визуальная — авторизация появится вместе с бэкендом (раздел «Users
              &amp; Auth» плана проекта).
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
