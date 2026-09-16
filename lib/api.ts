// Клиент к бэкенд-API каталога (backend/src/catalog, NestJS + Prisma + PostgreSQL).
// Раньше витрина работала на моковых данных (lib/mock-data.ts) — теперь категории
// и товары приходят из реальной базы, включая всё, что добавлено вручную через
// Prisma Studio (npm run prisma:studio в папке backend) или Adminer.

// На сервере (страницы-компоненты) можно использовать обычный API_BASE_URL — он
// не попадает в код для браузера. Оформление заказа (createOrder) вызывается и
// из клиентского компонента, поэтому для него нужна переменная с префиксом
// NEXT_PUBLIC_ — иначе Next.js не подставит её в бандл браузера. Пока и там,
// и там используется один и тот же локальный адрес по умолчанию.
//
// На сервере дополнительно подстраховываемся значением NEXT_PUBLIC_API_BASE_URL:
// на некоторых платформах (в т.ч. так себя показал Timeweb App Platform) обычная
// серверная переменная без префикса NEXT_PUBLIC_ не всегда доезжает до рантайма
// контейнера, хотя сохраняется в настройках. NEXT_PUBLIC_-переменная всегда
// доступна (она зашивается в билд), поэтому она и как серверный, и как клиентский
// фолбэк надёжнее, чем локальный адрес по умолчанию.
const API_BASE_URL =
  (typeof window === "undefined"
    ? process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL) ?? "http://localhost:3001/api/v1";

export interface Category {
  slug: string;
  name: string;
  // Ключ иконки Lucide, см. lib/icon-map.ts — то же значение, что в поле icon в БД.
  icon: string;
  items: string[];
}

export interface ProductSpec {
  label: string;
  value: string;
}

// Модель устройства для фильтра "Совместимость" (backend: CompatibilityModel).
export interface CompatibilityModelRef {
  slug: string;
  model: string;
}

export interface CompatibilityGroup {
  brand: string;
  models: CompatibilityModelRef[];
}

export interface Product {
  slug: string;
  name: string;
  categorySlug: string;
  // Совместимость как отображается на карточке (свободный текст, как раньше).
  compatibility: string;
  price: number;
  oldPrice?: number | null;
  badge?: string | null;
  // Внутренний код товара — есть не у всех товаров (nullable).
  article?: string | null;
  description: string;
  specs: ProductSpec[];
  // "В наличии" (true) / "под заказ" (false) — выставляется вручную в админке.
  inStock: boolean;
  // Ожидаемый срок/дата поступления — свободный текст, задаётся вручную в
  // админке, актуален прежде всего для товаров "под заказ".
  expectedDelivery?: string | null;
  // Структурированная совместимость для фильтра — есть не у всех товаров
  // (универсальные товары ни к одной модели не привязаны).
  compatibilityModels?: { compatibilityModel: CompatibilityModelRef & { brand: string } }[];
}

export interface ProductDetail extends Product {
  related: Product[];
}

export type ProductSort = "new" | "price_asc" | "price_desc";

// Вид отображения списка товаров в разделе каталога/поиске — по умолчанию
// "table" (см. переключатель ProductViewToggle).
export type ProductViewMode = "table" | "list" | "tile";

export interface ProductFilters {
  category?: string;
  q?: string;
  compatibility?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
}

// Любая ошибка (сеть, бэкенд не запущен, 5xx) гасится здесь и превращается в null —
// чтобы витрина не падала целиком, если, например, забыли поднять docker compose.
// Для списков (getCategories/getProducts) это значит пустой список, для карточки
// конкретного товара/раздела — как будто она не найдена (см. notFound() на страницах).
async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      // Каталог меняется нечасто — кэшируем ответ на минуту.
      next: { revalidate: 60 },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error(`Каталог-API ответил ${res.status} на ${path}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`Не удалось получить данные с каталог-API (${path}). Бэкенд запущен?`, error);
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  return (await apiGet<Category[]>("/catalog/categories")) ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return apiGet<Category>(`/catalog/categories/${encodeURIComponent(slug)}`);
}

// Принимает либо просто slug раздела (как раньше — для мест, где фильтры не
// нужны), либо полный набор фильтров (раздел каталога, страница поиска).
export async function getProducts(filters?: string | ProductFilters): Promise<Product[]> {
  const f: ProductFilters = typeof filters === "string" ? { category: filters } : (filters ?? {});
  const params = new URLSearchParams();
  if (f.category) params.set("category", f.category);
  if (f.q) params.set("q", f.q);
  if (f.compatibility?.length) params.set("compatibility", f.compatibility.join(","));
  if (f.minPrice != null) params.set("minPrice", String(f.minPrice));
  if (f.maxPrice != null) params.set("maxPrice", String(f.maxPrice));
  if (f.sort) params.set("sort", f.sort);
  const query = params.toString();
  return (await apiGet<Product[]>(`/catalog/products${query ? `?${query}` : ""}`)) ?? [];
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return apiGet<ProductDetail>(`/catalog/products/${encodeURIComponent(slug)}`);
}

// Модели устройств для чекбоксов фильтра "Совместимость" — опционально только
// те, что реально встречаются среди товаров одного раздела.
export async function getCompatibilityModels(categorySlug?: string): Promise<CompatibilityGroup[]> {
  const query = categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : "";
  return (await apiGet<CompatibilityGroup[]>(`/catalog/compatibility${query}`)) ?? [];
}

// --- Заказы (backend/src/orders) ---
// Пока без оплаты и доставки по-настоящему (нет подключённых аккаунтов
// ЮKassa/СДЭК, раздел 8 плана) — заказ создаётся как заявка со статусом "new",
// дальше менеджер сам связывается с покупателем.

export type DeliveryMethod = "pickup" | "courier";

export interface OrderItemInput {
  productSlug: string;
  qty: number;
}

export interface CreateOrderPayload {
  customerName: string;
  phone: string;
  email?: string;
  deliveryMethod: DeliveryMethod;
  address?: string;
  comment?: string;
  items: OrderItemInput[];
}

export interface OrderItemResult {
  id: string;
  productSlug: string | null;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  status: string;
  customerName: string;
  phone: string;
  email: string | null;
  deliveryMethod: DeliveryMethod;
  address: string | null;
  comment: string | null;
  itemsTotal: number;
  items: OrderItemResult[];
  createdAt: string;
}

// В отличие от apiGet, ошибки здесь не гасятся — форма оформления заказа
// должна показать пользователю, что пошло не так (например, не заполнен адрес).
export class OrderApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  // Если покупатель залогинен — заказ привяжется к его аккаунту (личный
  // кабинет, история покупок). Если нет — оформляется как гость, как и раньше.
  const { getCustomerToken } = await import("./auth-context");
  const token = getCustomerToken();

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new OrderApiError(
      "Не удалось связаться с сервером. Проверьте, запущен ли бэкенд, и попробуйте ещё раз.",
      0
    );
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? "Не удалось оформить заказ. Попробуйте ещё раз.");
    throw new OrderApiError(message, res.status);
  }

  return res.json();
}

export async function getOrder(id: string): Promise<Order | null> {
  return apiGet<Order>(`/orders/${encodeURIComponent(id)}`);
}
