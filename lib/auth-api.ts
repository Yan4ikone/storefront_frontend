// Клиент к публичному auth-API (backend/src/auth, src/users) — регистрация,
// вход и личный кабинет покупателя. Отдельно от lib/admin-api.ts: там токен
// живёт в sessionStorage (вкладка) и подразумевает роль admin/manager, здесь —
// в localStorage (обычный "запомнить меня" для покупателя) и подходит любому
// вошедшему пользователю.

import type { Order, OrderStatus } from "./api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

export type UserRole = "customer" | "manager" | "admin";

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  role: UserRole;
  // Пока только отображение в профиле + кнопка "Пополнить"-заглушка — см.
  // комментарий у User.balance на бэкенде. Меняет значение только админ.
  balance: number;
  createdAt: string;
}

export class AuthApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    throw new AuthApiError("Не удалось связаться с сервером. Бэкенд запущен?", 0);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? `Ошибка запроса (${res.status})`);
    throw new AuthApiError(message, res.status);
  }

  return res.json();
}

export interface RegisterPayload {
  email?: string;
  phone?: string;
  password: string;
  name?: string;
}

export interface LoginPayload {
  emailOrPhone: string;
  password: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

export function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMe(token: string): Promise<AuthUser> {
  return request<AuthUser>("/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export interface UpdateMePayload {
  name?: string;
  email?: string;
  phone?: string;
}

export function updateMe(token: string, payload: UpdateMePayload): Promise<AuthUser> {
  return request<AuthUser>("/users/me", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function changePassword(
  token: string,
  payload: { currentPassword: string; newPassword: string }
): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>("/users/me/password", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

// Переиспользуем типы заказа с витрины (Order/OrderStatus из lib/api.ts) —
// личный кабинет получает те же самые поля (номер, статус, состав и т.д.),
// просто через свой защищённый эндпоинт /users/me/orders.
export type MyOrderItem = Order["items"][number];
export type MyOrder = Order;
export type { OrderStatus };

export function getMyOrders(token: string): Promise<MyOrder[]> {
  return request<MyOrder[]>("/users/me/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// "Новый" заказ удаляется сразу, более поздний — ставится в очередь на
// подтверждение отмены менеджером (см. backend OrdersService.cancelByCustomer).
export function cancelMyOrder(
  token: string,
  orderId: string
): Promise<{ ok: boolean; deleted: boolean; alreadyRequested?: boolean }> {
  return request(`/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// --- Избранное ---

export interface FavoriteItem {
  productSlug: string;
  createdAt: string;
  product: {
    slug: string;
    name: string;
    price: number;
    oldPrice: number | null;
    compatibility: string;
    inStock: boolean;
    images: string[];
    category: { slug: string; name: string };
  };
}

export function getFavorites(token: string): Promise<FavoriteItem[]> {
  return request<FavoriteItem[]>("/users/me/favorites", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function addFavorite(token: string, slug: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/users/me/favorites/${encodeURIComponent(slug)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function removeFavorite(token: string, slug: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/users/me/favorites/${encodeURIComponent(slug)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
