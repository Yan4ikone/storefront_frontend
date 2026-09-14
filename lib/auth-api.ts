// Клиент к публичному auth-API (backend/src/auth, src/users) — регистрация,
// вход и личный кабинет покупателя. Отдельно от lib/admin-api.ts: там токен
// живёт в sessionStorage (вкладка) и подразумевает роль admin/manager, здесь —
// в localStorage (обычный "запомнить меня" для покупателя) и подходит любому
// вошедшему пользователю.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

export type UserRole = "customer" | "manager" | "admin";

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  role: UserRole;
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

export interface MyOrderItem {
  id: string;
  productSlug: string | null;
  name: string;
  price: number;
  qty: number;
}

export interface MyOrder {
  id: string;
  status: string;
  customerName: string;
  phone: string;
  email: string | null;
  deliveryMethod: "pickup" | "courier";
  address: string | null;
  comment: string | null;
  itemsTotal: number;
  items: MyOrderItem[];
  createdAt: string;
}

export function getMyOrders(token: string): Promise<MyOrder[]> {
  return request<MyOrder[]>("/users/me/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
