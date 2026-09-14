"use client";

// Состояние входа в админку (React Context) — хранит, залогинен ли сотрудник
// в этой вкладке (и его данные), даёт страницам админки login()/logout().
// Сам JWT лежит в sessionStorage (см. lib/admin-api.ts getToken/setToken).

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { adminLogin, verifyAdminSession, clearToken, type AdminUser } from "./admin-api";

type AdminAuthStatus = "checking" | "authenticated" | "anonymous";

interface AdminAuthContextValue {
  status: AdminAuthStatus;
  user: AdminUser | null;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AdminAuthStatus>("checking");
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    verifyAdminSession().then((sessionUser) => {
      if (sessionUser) {
        setUser(sessionUser);
        setStatus("authenticated");
      } else {
        setStatus("anonymous");
      }
    });
  }, []);

  const login = async (emailOrPhone: string, password: string) => {
    const loggedInUser = await adminLogin(emailOrPhone, password);
    setUser(loggedInUser);
    setStatus("authenticated");
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setStatus("anonymous");
  };

  return (
    <AdminAuthContext.Provider value={{ status, user, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth должен вызываться внутри <AdminAuthProvider>");
  return ctx;
}
