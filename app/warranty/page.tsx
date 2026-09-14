import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Гарантия и возврат — МобДетали",
};

export default function WarrantyPage() {
  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Гарантия и возврат" }]} />

      <div className="max-w-container mx-auto px-4 py-10">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-2xl font-bold">Гарантия и возврат</h1>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Гарантия</h2>
            <p className="text-ink leading-relaxed">
              На большинство запчастей и аксессуаров действует гарантия — обычно до 6
              месяцев с момента покупки. Точный срок для конкретного товара указан в
              его характеристиках на карточке товара. Гарантия покрывает
              производственный брак и распространяется на замену или ремонт
              неисправной детали.
            </p>
            <p className="text-ink leading-relaxed">
              Гарантия не распространяется на повреждения, возникшие из-за
              неправильной установки, механического повреждения после покупки или
              попыток самостоятельного ремонта детали.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Обмен и возврат</h2>
            <p className="text-ink leading-relaxed">
              Если товар оказался бракованным или не соответствует заказу — мы
              заменим его или вернём деньги. Если товар надлежащего качества, но не
              подошёл (например, ошиблись с моделью устройства), обмен и возврат
              возможны в соответствии с законом РФ «О защите прав потребителей» — с
              учётом того, что часть электронных компонентов, бывших в использовании
              или со следами установки, обмену и возврату не подлежит. Уточняйте
              возможность возврата конкретного товара при обращении.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Как оформить обмен или возврат</h2>
            <ol className="list-decimal list-inside text-ink leading-relaxed space-y-1.5">
              <li>
                Свяжитесь с нами — контакты указаны на странице{" "}
                <Link href="/contacts" className="text-brand hover:underline">
                  «Контакты»
                </Link>
                . Укажите номер заказа и опишите проблему.
              </li>
              <li>Мы согласуем с вами способ и время передачи товара.</li>
              <li>
                После проверки товара — заменим его, вернём деньги или, если товар
                исправен, объясним причину отказа.
              </li>
            </ol>
          </section>

          <p className="text-xs text-muted">
            Это общее описание условий магазина, а не исчерпывающее изложение закона.
            В спорных случаях действуют нормы законодательства РФ о защите прав
            потребителей.
          </p>
        </div>
      </div>
    </main>
  );
}
