import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "О магазине — ScreenHub",
};

export default function AboutPage() {
  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "О магазине" }]} />

      <div className="max-w-container mx-auto px-4 py-10">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-2xl font-bold">О магазине</h1>

          <section className="space-y-3">
            <p className="text-ink leading-relaxed">
              ScreenHub — интернет-магазин запчастей, инструментов и аксессуаров для
              смартфонов и ноутбуков. Мы специализируемся на деталях для
              самостоятельного ремонта и обслуживания мобильной техники: от
              аккумуляторов и дисплеев до микросхем и разъёмов.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Что у нас можно найти</h2>
            <p className="text-ink leading-relaxed">
              В каталоге — аккумуляторы, дисплеи в сборе, запчасти (камеры, шлейфы,
              разъёмы, микросхемы), защитные стёкла и плёнки, корпусные части,
              аксессуары (кабели, наушники, power bank, держатели), инструменты и
              оборудование для ремонта, а также запчасти для ноутбуков. Каждая
              карточка товара указывает совместимость с конкретными моделями
              устройств, чтобы не ошибиться с выбором детали.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Для кого мы работаем</h2>
            <p className="text-ink leading-relaxed">
              С нами работают и частные покупатели, которые чинят технику
              самостоятельно, и мастера сервисных центров, которым нужны запчасти
              под конкретную модель. Если не уверены, какая деталь подойдёт —
              напишите нам, поможем определиться.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Гарантия и качество</h2>
            <p className="text-ink leading-relaxed">
              На большинство деталей действует гарантия — срок указан в
              характеристиках конкретного товара (обычно до 6 месяцев). Подробнее об
              условиях обмена и возврата — на странице{" "}
              <Link href="/warranty" className="text-brand hover:underline">
                «Гарантия и возврат»
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Остались вопросы?</h2>
            <p className="text-ink leading-relaxed">
              Свяжитесь с нами любым удобным способом — контакты и часы работы
              указаны на странице{" "}
              <Link href="/contacts" className="text-brand hover:underline">
                «Контакты»
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
