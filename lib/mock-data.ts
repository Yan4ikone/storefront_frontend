// Тестовые данные для отладки вёрстки. В реальном каталоге категории/товары
// придут из API (см. раздел 6 плана архитектуры: GET /catalog/...).

import type { LucideIcon } from "lucide-react";
import {
  BatteryCharging,
  MonitorSmartphone,
  Cpu,
  ShieldCheck,
  PackageOpen,
  Headphones,
  Wrench,
  Laptop,
} from "lucide-react";

export interface Category {
  slug: string;
  name: string;
  icon: LucideIcon;
  // Список для всплывающего меню при клике на карточку на главной (пример подпунктов раздела).
  items: string[];
}

export const categories: Category[] = [
  {
    slug: "batteries",
    name: "Аккумуляторы",
    icon: BatteryCharging,
    items: ["Для iPhone", "Для Samsung", "Для Xiaomi", "Универсальные"],
  },
  {
    slug: "displays",
    name: "Дисплеи",
    icon: MonitorSmartphone,
    items: ["Для iPhone", "Для Samsung", "Для Xiaomi", "OLED / IPS модули"],
  },
  {
    slug: "parts",
    name: "Запчасти",
    icon: Cpu,
    items: ["Камеры", "Шлейфы", "Разъёмы", "Микросхемы"],
  },
  {
    slug: "glass",
    name: "Защитные стёкла и плёнки",
    icon: ShieldCheck,
    items: ["2.5D стёкла", "Полноклеевые", "Плёнки", "Универсальные"],
  },
  {
    slug: "housings",
    name: "Корпусные части",
    icon: PackageOpen,
    items: ["Задние крышки", "Рамки", "Винты и скотчи", "Наклейки"],
  },
  {
    slug: "accessories",
    name: "Аксессуары",
    icon: Headphones,
    items: ["Наушники", "Power bank", "Кабели", "Держатели"],
  },
  {
    slug: "tools",
    name: "Инструменты и оборудование",
    icon: Wrench,
    items: ["Наборы для вскрытия", "Паяльное оборудование", "Расходники"],
  },
  {
    slug: "laptop-parts",
    name: "Запчасти для ноутбуков и ПК",
    icon: Laptop,
    items: ["Матрицы", "Клавиатуры", "Аккумуляторы для ноутбуков"],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export interface Product {
  slug: string;
  name: string;
  categorySlug: string;
  compatibility: string;
  price: number;
  oldPrice?: number;
  badge?: string;
  description: string;
  specs: { label: string; value: string }[];
}

export const products: Product[] = [
  // Аккумуляторы
  {
    slug: "battery-iphone-xr",
    name: "Аккумулятор",
    categorySlug: "batteries",
    compatibility: "iPhone XR",
    price: 1190,
    badge: "Хит",
    description:
      "Аккумулятор для замены штатной батареи. Совместим с iPhone XR, поддерживает корректное отображение износа в системе.",
    specs: [
      { label: "Совместимость", value: "iPhone XR" },
      { label: "Ёмкость", value: "2942 мАч" },
      { label: "Тип", value: "Li-Ion" },
      { label: "Гарантия", value: "6 месяцев" },
    ],
  },
  {
    slug: "battery-samsung-a53",
    name: "Аккумулятор",
    categorySlug: "batteries",
    compatibility: "Samsung Galaxy A53",
    price: 1390,
    description: "Аккумулятор для Samsung Galaxy A53 с заводскими параметрами ёмкости.",
    specs: [
      { label: "Совместимость", value: "Samsung Galaxy A53" },
      { label: "Ёмкость", value: "5000 мАч" },
      { label: "Тип", value: "Li-Po" },
      { label: "Гарантия", value: "6 месяцев" },
    ],
  },
  {
    slug: "battery-universal-power",
    name: "Аккумулятор повышенной ёмкости",
    categorySlug: "batteries",
    compatibility: "Универсальный (по модели)",
    price: 1590,
    oldPrice: 1890,
    badge: "Новинка",
    description: "Батарея с увеличенной ёмкостью для моделей, где важна автономность.",
    specs: [
      { label: "Ёмкость", value: "до +20% к оригиналу" },
      { label: "Тип", value: "Li-Po" },
      { label: "Гарантия", value: "6 месяцев" },
    ],
  },

  // Дисплеи
  {
    slug: "display-iphone-13",
    name: "Дисплей в сборе",
    categorySlug: "displays",
    compatibility: "iPhone 13",
    price: 6490,
    oldPrice: 7290,
    badge: "Хит",
    description:
      "Дисплейный модуль в сборе с тачскрином для iPhone 13. Проверяется перед отправкой в отделе контроля качества.",
    specs: [
      { label: "Совместимость", value: "iPhone 13" },
      { label: "Тип матрицы", value: "OLED" },
      { label: "В комплекте", value: "Дисплей + тачскрин" },
      { label: "Гарантия", value: "6 месяцев" },
    ],
  },
  {
    slug: "display-samsung-a53",
    name: "Дисплей в сборе",
    categorySlug: "displays",
    compatibility: "Samsung Galaxy A53",
    price: 5290,
    description: "OLED-дисплей в сборе с рамкой для Samsung Galaxy A53.",
    specs: [
      { label: "Совместимость", value: "Samsung Galaxy A53" },
      { label: "Тип матрицы", value: "Super AMOLED" },
      { label: "Гарантия", value: "6 месяцев" },
    ],
  },
  {
    slug: "display-xiaomi-note-11",
    name: "Дисплей в сборе",
    categorySlug: "displays",
    compatibility: "Xiaomi Redmi Note 11",
    price: 3190,
    badge: "Новинка",
    description: "Дисплейный модуль для Xiaomi Redmi Note 11, IPS-матрица.",
    specs: [
      { label: "Совместимость", value: "Xiaomi Redmi Note 11" },
      { label: "Тип матрицы", value: "IPS" },
      { label: "Гарантия", value: "6 месяцев" },
    ],
  },

  // Запчасти
  {
    slug: "charging-port-iphone-11",
    name: "Шлейф разъёма зарядки",
    categorySlug: "parts",
    compatibility: "iPhone 11",
    price: 890,
    description: "Шлейф с разъёмом Lightning и микрофоном для iPhone 11.",
    specs: [
      { label: "Совместимость", value: "iPhone 11" },
      { label: "В комплекте", value: "Шлейф, разъём, микрофон" },
      { label: "Гарантия", value: "3 месяца" },
    ],
  },
  {
    slug: "camera-main-iphone-12",
    name: "Основная камера",
    categorySlug: "parts",
    compatibility: "iPhone 12",
    price: 1990,
    description: "Модуль основной камеры для iPhone 12.",
    specs: [
      { label: "Совместимость", value: "iPhone 12" },
      { label: "Тип", value: "Основная камера" },
      { label: "Гарантия", value: "3 месяца" },
    ],
  },
  {
    slug: "motherboard-connector-samsung-s21",
    name: "Межплатный шлейф",
    categorySlug: "parts",
    compatibility: "Samsung Galaxy S21",
    price: 690,
    description: "Соединительный шлейф материнской платы для Samsung Galaxy S21.",
    specs: [
      { label: "Совместимость", value: "Samsung Galaxy S21" },
      { label: "Гарантия", value: "3 месяца" },
    ],
  },

  // Защитные стёкла и плёнки
  {
    slug: "glass-2.5d-universal",
    name: "Защитное стекло 2.5D",
    categorySlug: "glass",
    compatibility: "Универсальное (по модели)",
    price: 190,
    badge: "Новинка",
    description: "Закалённое защитное стекло 2.5D с олеофобным покрытием.",
    specs: [
      { label: "Тип", value: "2.5D" },
      { label: "Твёрдость", value: "9H" },
    ],
  },
  {
    slug: "glass-full-glue-iphone-13",
    name: "Полноклеевое защитное стекло",
    categorySlug: "glass",
    compatibility: "iPhone 13",
    price: 350,
    description: "Полноклеевое стекло с чёрной рамкой для iPhone 13.",
    specs: [
      { label: "Совместимость", value: "iPhone 13" },
      { label: "Тип", value: "Full glue" },
      { label: "Твёрдость", value: "9H" },
    ],
  },
  {
    slug: "hydrogel-film-universal",
    name: "Гидрогелевая плёнка",
    categorySlug: "glass",
    compatibility: "Универсальная (по размеру)",
    price: 150,
    description: "Гидрогелевая защитная плёнка на экран, самовосстанавливающаяся.",
    specs: [{ label: "Тип", value: "Гидрогель" }],
  },

  // Корпусные части
  {
    slug: "back-cover-xiaomi-note-11",
    name: "Задняя крышка",
    categorySlug: "housings",
    compatibility: "Xiaomi Redmi Note 11",
    price: 990,
    description: "Задняя крышка корпуса для Xiaomi Redmi Note 11.",
    specs: [{ label: "Совместимость", value: "Xiaomi Redmi Note 11" }],
  },
  {
    slug: "frame-iphone-xr",
    name: "Рамка дисплея",
    categorySlug: "housings",
    compatibility: "iPhone XR",
    price: 590,
    description: "Средняя рамка корпуса для iPhone XR.",
    specs: [{ label: "Совместимость", value: "iPhone XR" }],
  },
  {
    slug: "adhesive-tape-set",
    name: "Набор скотчей для проклейки корпуса",
    categorySlug: "housings",
    compatibility: "Универсальный (по модели)",
    price: 290,
    description: "Комплект проклеечных скотчей для сборки корпуса после ремонта.",
    specs: [{ label: "Комплектация", value: "Скотч дисплея + скотч батареи" }],
  },

  // Аксессуары
  {
    slug: "power-bank-10000",
    name: "Power Bank 10000 мАч",
    categorySlug: "accessories",
    compatibility: "Универсальный",
    price: 1790,
    oldPrice: 2190,
    description: "Портативный аккумулятор 10000 мАч с двумя портами USB.",
    specs: [
      { label: "Ёмкость", value: "10000 мАч" },
      { label: "Выходы", value: "2 × USB-A" },
    ],
  },
  {
    slug: "headphones-wired-universal",
    name: "Проводные наушники",
    categorySlug: "accessories",
    compatibility: "Универсальные (3.5 мм / USB-C)",
    price: 490,
    description: "Проводные наушники с микрофоном, разъём на выбор при заказе.",
    specs: [{ label: "Разъём", value: "3.5 мм или USB-C" }],
  },
  {
    slug: "usb-c-cable-1m",
    name: "Кабель USB-C, 1 м",
    categorySlug: "accessories",
    compatibility: "Универсальный",
    price: 290,
    description: "Кабель для зарядки и передачи данных USB-C, длина 1 м.",
    specs: [{ label: "Длина", value: "1 м" }],
  },

  // Инструменты и оборудование
  {
    slug: "opening-tool-kit",
    name: "Набор инструментов для вскрытия",
    categorySlug: "tools",
    compatibility: "Универсальный",
    price: 1290,
    description: "Базовый набор для разборки смартфонов: лопатки, присоска, отвёртки.",
    specs: [{ label: "Комплектация", value: "12 предметов" }],
  },
  {
    slug: "soldering-station",
    name: "Паяльная станция",
    categorySlug: "tools",
    compatibility: "Универсальная",
    price: 4990,
    badge: "Хит",
    description: "Компактная паяльная станция для ремонта плат.",
    specs: [{ label: "Мощность", value: "60 Вт" }],
  },
  {
    slug: "screwdriver-set-precision",
    name: "Набор прецизионных отвёрток",
    categorySlug: "tools",
    compatibility: "Универсальный",
    price: 890,
    description: "Набор отвёрток для разборки корпусов смартфонов и ноутбуков.",
    specs: [{ label: "Комплектация", value: "24 биты" }],
  },

  // Запчасти для ноутбуков и ПК
  {
    slug: "laptop-matrix-15-6",
    name: "Матрица 15.6″",
    categorySlug: "laptop-parts",
    compatibility: "Универсальная (по разрешению)",
    price: 4590,
    description: "Матрица для ноутбука 15.6 дюймов, разъём и разрешение уточняются по модели.",
    specs: [{ label: "Диагональ", value: "15.6″" }],
  },
  {
    slug: "laptop-keyboard-universal",
    name: "Клавиатура для ноутбука",
    categorySlug: "laptop-parts",
    compatibility: "Универсальная (по модели)",
    price: 1490,
    description: "Клавиатура для ноутбука, раскладка и крепление уточняются по модели.",
    specs: [{ label: "Раскладка", value: "RU/EN" }],
  },
  {
    slug: "laptop-battery-universal",
    name: "Аккумулятор для ноутбука",
    categorySlug: "laptop-parts",
    compatibility: "Универсальный (по модели)",
    price: 2990,
    description: "Аккумулятор для ноутбука, ёмкость и разъём уточняются по модели.",
    specs: [{ label: "Тип", value: "Li-Ion" }],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.categorySlug === product.categorySlug && p.slug !== product.slug)
    .slice(0, limit);
}

// Для главной страницы — компактная подборка на основе общего списка.
export const featuredProducts: Product[] = [
  getProductBySlug("display-iphone-13")!,
  getProductBySlug("battery-samsung-a53")!,
  getProductBySlug("charging-port-iphone-11")!,
  getProductBySlug("glass-2.5d-universal")!,
  getProductBySlug("back-cover-xiaomi-note-11")!,
  getProductBySlug("power-bank-10000")!,
  getProductBySlug("opening-tool-kit")!,
  getProductBySlug("battery-iphone-xr")!,
];
