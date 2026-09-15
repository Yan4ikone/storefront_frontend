import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Как оформить заказ — ScreenHub",
};

const STEPS = [
  {
    title: "Найдите нужную деталь",
    text: "Выберите раздел каталога или воспользуйтесь поиском в шапке сайта — можно искать по названию, описанию или модели устройства. В разделе каталога есть фильтры по совместимости и цене.",
  },
  {
    title: "Добавьте товар в корзину",
    text: "На карточке товара нажмите «В корзину». Корзина сохраняется в вашем браузере, даже если вы уйдёте с сайта и вернётесь позже.",
  },
  {
    title: "Проверьте состав заказа",
    text: "Откройте корзину — там можно изменить количество или убрать товар. Когда всё готово, нажмите «Оформить заказ».",
  },
  {
    title: "Укажите контакты и способ получения",
    text: "На странице оформления заказа укажите имя и телефон, выберите самовывоз или курьерскую доставку (для доставки понадобится адрес). Оплата на этом шаге не требуется.",
  },
  {
    title: "Дождитесь звонка менеджера",
    text: "Мы свяжемся с вами, чтобы подтвердить заказ, а для доставки — согласовать адрес, время и стоимость. Подробнее об оплате и доставке — на соответствующей странице.",
  },
];

export default function HowToOrderPage() {
  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Как оформить заказ" }]} />

      <div className="max-w-container mx-auto px-4 py-10">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-2xl font-bold">Как оформить заказ</h1>

          <ol className="space-y-6">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="shrink-0 h-8 w-8 rounded-full bg-brand text-white flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold mb-1">{step.title}</p>
                  <p className="text-sm text-muted leading-relaxed">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <section className="rounded-card border border-border bg-white p-5 space-y-2">
            <p className="font-semibold text-sm">Заказ без регистрации</p>
            <p className="text-sm text-muted leading-relaxed">
              Оформить заказ можно и без входа в аккаунт — как гость. Если хотите
              видеть историю своих заказов в одном месте, зарегистрируйтесь или
              войдите на странице{" "}
              <Link href="/login" className="text-brand hover:underline">
                входа
              </Link>{" "}
              — тогда все заказы, оформленные в этом аккаунте, появятся в{" "}
              <Link href="/account" className="text-brand hover:underline">
                личном кабинете
              </Link>
              .
            </p>
          </section>

          <p className="text-ink leading-relaxed">
            Остались вопросы об оформлении заказа, оплате или доставке? Смотрите
            страницу{" "}
            <Link href="/delivery" className="text-brand hover:underline">
              «Оплата и доставка»
            </Link>{" "}
            или{" "}
            <Link href="/contacts" className="text-brand hover:underline">
              свяжитесь с нами
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
