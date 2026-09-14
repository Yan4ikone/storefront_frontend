"use client";

// Состояние входа покупателя (React Context) — токен в localStorage (в отличие
// от админки, здесь это обычное "запомнить меня": сессия переживает закрытие
// вкладки/браузера). Оборачивает всю витрину в app/layout.tsx, наравне с
// CartProvider.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  getMe,
  loginUser,
  registerUser,
  AuthApiError,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from "./auth-api";

const TOKEN_KEY = "customer-token";

type AuthStatus = "checking" | "authenticated" | "anonymous";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // localStorage недоступен (приватный режим и т.п.) — сессия просто не
    // переживёт перезагрузку страницы, но вход в рамках текущей вкладки сработает.
  }
}

function removeToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

// Используется из lib/api.ts (createOrder) — привязать заказ к аккаунту,
// если покупатель залогинен. Вынесено отдельной функцией, а не через
// useAuth(), т.к. createOrder — обычная функция, а не компонент/хук.
export function getCustomerToken(): string | null {
  return readToken();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = readToken();
    if (!token) {
      setStatus("anonymous");
      return;
    }
    getMe(token)
      .then((u) => {
        setUser(u);
        setStatus("authenticated");
      })
      .catch(() => {
        removeToken();
        setStatus("anonymous");
      });
  }, []);

  const login = async (payload: LoginPayload) => {
    const { user: loggedInUser, token } = await loginUser(payload);
    writeToken(token);
    setUser(loggedInUser);
    setStatus("authenticated");
  };

  const register = async (payload: RegisterPayload) => {
    const { user: registeredUser, token } = await registerUser(payload);
    writeToken(token);
    setUser(registeredUser);
    setStatus("authenticated");
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setStatus("anonymous");
  };

  return (
    <AuthContext.Provider value={{ status, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth должен вызываться внутри <AuthProvider>");
  return ctx;
}

export { AuthApiError };
