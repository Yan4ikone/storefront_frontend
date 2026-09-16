// Клиент к защищённой части бэкенд-API (backend/src/admin) — CRUD по каталогу
// и управление заказами для собственной админки (app/admin/**). Вход — обычный
// email/телефон + пароль через backend/src/auth (тот же механизм, что и у
// покупателей), но доступ к самой админке даёт только роль admin/manager
// (см. JwtAuthGuard + RolesGuard на бэкенде, проверяется через /admin/session).

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

const TOKEN_KEY = "admin-token";

// Токен хранится в sessionStorage (не localStorage, в отличие от покупательского
// lib/auth-context.tsx) — сессия админки живёт, пока открыта вкладка, и не
// переживает перезапуск браузера. Это отдельный токен от покупательского даже
// для одного и того же браузера — так безопаснее на общем рабочем компьютере.
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    window.sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // sessionStorage недоступен (приватный режим и т.п.) — просто придётся
    // входить заново при обновлении страницы.
  }
}

export function clearToken() {
  try {
    window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token ?? ""}`,
        ...options.headers,
      },
    });
  } catch (error) {
    throw new AdminApiError("Не удалось связаться с сервером. Бэкенд запущен?", 0);
  }

  if (res.status === 401) {
    clearToken();
    throw new AdminApiError("Сессия истекла или пароль неверный — войдите заново", 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? `Ошибка запроса (${res.status})`);
    throw new AdminApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface AdminUser {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  role: "customer" | "manager" | "admin";
}

// Вход через общий /auth/login (не отдельный "admin login") — а затем сразу
// проверяем роль: аккаунт покупателя авторизуется, но токен не сохраняем и
// сообщаем, что доступа к админке нет.
export async function adminLogin(emailOrPhone: string, password: string): Promise<AdminUser> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrPhone, password }),
    });
  } catch {
    throw new AdminApiError("Не удалось связаться с сервером. Бэкенд запущен?", 0);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join(", ") : (body?.message ?? "Неверный логин или пароль");
    throw new AdminApiError(message, res.status);
  }

  const data = (await res.json()) as { user: AdminUser; token: string };
  if (data.user.role !== "admin" && data.user.role !== "manager") {
    throw new AdminApiError("У этого аккаунта нет доступа к админке", 403);
  }

  setToken(data.token);
  return data.user;
}

// Вызывается при открытии /admin — если токен уже лежит в sessionStorage,
// проверяем, что он ещё действителен и роль по-прежнему admin/manager.
export async function verifyAdminSession(): Promise<AdminUser | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/admin/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearToken();
      return null;
    }
    const data = (await res.json()) as { ok: boolean; user: AdminUser };
    return data.user;
  } catch {
    return null;
  }
}

// --- Категории ---

export interface AdminCategory {
  slug: string;
  name: string;
  icon: string;
  items: string[];
}

export interface CreateCategoryInput {
  slug: string;
  name: string;
  icon: string;
  items: string[];
}

// slug неизменяем (первичный ключ и часть URL /catalog/:slug на витрине).
export interface UpdateCategoryInput {
  name?: string;
  icon?: string;
  items?: string[];
}

export function getCategories(): Promise<AdminCategory[]> {
  return adminFetch<AdminCategory[]>("/admin/catalog/categories");
}

export function createCategory(input: CreateCategoryInput): Promise<AdminCategory> {
  return adminFetch<AdminCategory>("/admin/catalog/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCategory(
  slug: string,
  input: UpdateCategoryInput
): Promise<AdminCategory> {
  return adminFetch<AdminCategory>(`/admin/catalog/categories/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteCategory(slug: string): Promise<{ ok: boolean }> {
  return adminFetch<{ ok: boolean }>(`/admin/catalog/categories/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
}

// --- Товары ---

export interface AdminProductSpec {
  label: string;
  value: string;
}

// Модель устройства для фильтра "Совместимость" на витрине (backend: CompatibilityModel).
export interface CompatibilityModelRef {
  slug: string;
  brand: string;
  series: string | null;
  model: string;
}

export interface CompatibilityGroup {
  brand: string;
  models: { slug: string; model: string }[];
}

export interface AdminProduct {
  slug: string;
  name: string;
  categorySlug: string;
  compatibility: string;
  price: number;
  oldPrice: number | null;
  badge: string | null;
  article: string | null;
  description: string;
  specs: AdminProductSpec[];
  inStock: boolean;
  expectedDelivery: string | null;
  createdAt: string;
  updatedAt: string;
  // Есть только в ответе списка (GET /admin/catalog/products), т.к. сервис
  // подгружает связь include:{category:true} — при GET одного товара её нет.
  category?: AdminCategory;
  // Связанные модели устройств (для фильтра на витрине) — есть у обоих ответов.
  compatibilityModels?: { compatibilityModel: CompatibilityModelRef }[];
}

// slug неизменяем (первичный ключ, часть URL /product/:slug и на него
// ссылаются уже оформленные заказы — см. OrderItem.productSlug).
export interface CreateProductInput {
  slug: string;
  name: string;
  categorySlug: string;
  compatibility: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  article?: string;
  description: string;
  specs: AdminProductSpec[];
  inStock?: boolean;
  expectedDelivery?: string;
  compatibilityModelSlugs?: string[];
}

export interface UpdateProductInput {
  name?: string;
  categorySlug?: string;
  compatibility?: string;
  price?: number;
  oldPrice?: number;
  badge?: string;
  article?: string;
  description?: string;
  specs?: AdminProductSpec[];
  inStock?: boolean;
  expectedDelivery?: string;
  compatibilityModelSlugs?: string[];
}

// Список моделей устройств для мультивыбора в форме товара — тот же публичный
// эндпоинт, что использует витрина для фильтра (нет смысла дублировать в /admin).
export function getCompatibilityModels(): Promise<CompatibilityGroup[]> {
  return adminFetch<CompatibilityGroup[]>("/catalog/compatibility");
}

export function getProducts(): Promise<AdminProduct[]> {
  return adminFetch<AdminProduct[]>("/admin/catalog/products");
}

export function getProduct(slug: string): Promise<AdminProduct> {
  return adminFetch<AdminProduct>(`/admin/catalog/products/${encodeURIComponent(slug)}`);
}

export function createProduct(input: CreateProductInput): Promise<AdminProduct> {
  return adminFetch<AdminProduct>("/admin/catalog/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateProduct(
  slug: string,
  input: UpdateProductInput
): Promise<AdminProduct> {
  return adminFetch<AdminProduct>(`/admin/catalog/products/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteProduct(slug: string): Promise<{ ok: boolean }> {
  return adminFetch<{ ok: boolean }>(`/admin/catalog/products/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
}

// --- Заказы ---

export const ORDER_STATUSES = ["new", "confirmed", "done", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Новый",
  confirmed: "Подтверждён",
  done: "Выполнен",
  cancelled: "Отменён",
};

export interface AdminOrderItem {
  id: string;
  productSlug: string | null;
  name: string;
  price: number;
  qty: number;
}

export interface AdminOrder {
  id: string;
  status: string;
  customerName: string;
  phone: string;
  email: string | null;
  deliveryMethod: "pickup" | "courier";
  address: string | null;
  comment: string | null;
  itemsTotal: number;
  items: AdminOrderItem[];
  createdAt: string;
}

export function getOrders(): Promise<AdminOrder[]> {
  return adminFetch<AdminOrder[]>("/admin/orders");
}

export function updateOrderStatus(id: string, status: OrderStatus): Promise<AdminOrder> {
  return adminFetch<AdminOrder>(`/admin/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// --- Отчёты для бухгалтерии ---

export const REPORT_GROUP_BY = ["day", "week", "month"] as const;
export type ReportGroupBy = (typeof REPORT_GROUP_BY)[number];

export const REPORT_GROUP_BY_LABELS: Record<ReportGroupBy, string> = {
  day: "По дням",
  week: "По неделям",
  month: "По месяцам",
};

export interface ReportPeriodRow {
  period: string;
  ordersCount: number;
  revenue: number;
  cancelledCount: number;
  cancelledAmount: number;
}

export interface ReportsTotals {
  ordersCount: number;
  revenue: number;
  cancelledCount: number;
  cancelledAmount: number;
}

export interface ReportsSummary {
  from: string;
  to: string;
  groupBy: ReportGroupBy;
  rows: ReportPeriodRow[];
  totals: ReportsTotals;
}

export interface ReportsFilters {
  from?: string;
  to?: string;
  groupBy?: ReportGroupBy;
  status?: OrderStatus;
}

function buildReportsQuery(filters: ReportsFilters): string {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.groupBy) params.set("groupBy", filters.groupBy);
  if (filters.status) params.set("status", filters.status);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function getReportsSummary(filters: ReportsFilters): Promise<ReportsSummary> {
  return adminFetch<ReportsSummary>(`/admin/reports/summary${buildReportsQuery(filters)}`);
}

export function getReportsOrders(filters: ReportsFilters): Promise<AdminOrder[]> {
  return adminFetch<AdminOrder[]>(`/admin/reports/orders${buildReportsQuery(filters)}`);
}

// Обычная ссылка не может передать заголовок Authorization (токен лежит в
// sessionStorage, а не в cookie — см. начало файла), поэтому файл сначала
// забирается через fetch как Blob, а затем сохраняется через временную
// ссылку на object URL — стандартный приём для скачивания с авторизацией.
async function downloadReportFile(path: string, filename: string): Promise<void> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${token ?? ""}` },
    });
  } catch {
    throw new AdminApiError("Не удалось связаться с сервером. Бэкенд запущен?", 0);
  }

  if (res.status === 401) {
    clearToken();
    throw new AdminApiError("Сессия истекла или пароль неверный — войдите заново", 401);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? `Ошибка запроса (${res.status})`);
    throw new AdminApiError(message, res.status);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function downloadReportsSummary(filters: ReportsFilters): Promise<void> {
  return downloadReportFile(
    `/admin/reports/summary.xlsx${buildReportsQuery(filters)}`,
    "report-summary.xlsx"
  );
}

export function downloadReportsOrders(filters: ReportsFilters): Promise<void> {
  return downloadReportFile(
    `/admin/reports/orders.xlsx${buildReportsQuery(filters)}`,
    "report-orders.xlsx"
  );
}
