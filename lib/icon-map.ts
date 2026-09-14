// Сопоставление строкового ключа иконки (поле Category.icon в БД,
// см. backend/prisma/seed.ts) и компонента Lucide на витрине.
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
  Package,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  BatteryCharging,
  MonitorSmartphone,
  Cpu,
  ShieldCheck,
  PackageOpen,
  Headphones,
  Wrench,
  Laptop,
};

// Package — иконка по умолчанию: если в БД добавят раздел с ключом,
// которого здесь ещё нет, витрина не сломается, просто покажет нейтральную иконку.
export function getCategoryIcon(key: string): LucideIcon {
  return iconMap[key] ?? Package;
}
