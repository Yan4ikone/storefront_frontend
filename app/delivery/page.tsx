import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Оплата и доставка — МобДетали",
};

export default function DeliveryPage() {
  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Оплата и доставка" }]} />

      <div className="max-w-container mx-auto px-4 py-10">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-2xl font-bold">Оплата и доставка</h1>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Способы получения заказа</h2>
            <div className="rounded-card border border-border bg-white p-5 space-y-2">
              <p className="font-semibold text-sm">Самовывоз</p>
              <p className="text-sm text-ink leading-relaxed">
                Забрать заказ можно в пункте выдачи — адрес и часы работы указаны на
                странице{" "}
                <Link href="/contacts" className="text-brand hover:underline">
                  «Контакты»
                </Link>
                . Заказ резервируется после подтверждения менеджером.
              </p>
            </div>
            <div className="rounded-card border border-border bg-white p-5 space-y-2">
              <p className="font-semibold text-sm">Курьерская доставка</p>
              <p className="text-sm text-ink leading-relaxed">
                Доставляем по согласованному адресу. Стоимость и сроки зависят от
                города и веса заказа — менеджер уточнит их лично после оформления
                заказа на сайте, до подтверждения доставки.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Оплата</h2>
            <p className="text-ink leading-relaxed">
              Сейчас принимаем оплату при получении заказа — наличными или картой,
              на месте при самовывозе или курьеру при доставке. Онлайн-оплата на
              сайте пока не подключена; когда появится — сообщим на этой странице.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Как это происходит</h2>
            <ol className="list-decimal list-inside text-ink leading-relaxed space-y-1.5">
              <li>Вы оформляете заказ на сайте — оплата на этом шаге не требуется.</li>
              <li>
                Менеджер связывается с вами по указанному телефону, чтобы
                подтвердить состав заказа, способ получения и, если нужна доставка —
                адрес и стоимость.
              </li>
              <li>Вы получаете и оплачиваете заказ удобным способом.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Проверка товара</h2>
            <p className="text-ink leading-relaxed">
              Рекомендуем проверить товар на соответствие заказу при получении. Если
              заметили несоответствие или брак — смотрите{" "}
              <Link href="/warranty" className="text-brand hover:underline">
                условия гарантии и возврата
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
