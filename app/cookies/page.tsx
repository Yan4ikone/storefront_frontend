import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Файлы cookie — МобДетали",
};

export default function CookiesPage() {
  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Файлы cookie" }]} />

      <div className="max-w-container mx-auto px-4 py-10">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-2xl font-bold">Файлы cookie и локальное хранилище браузера</h1>

          <section className="space-y-3">
            <p className="text-ink leading-relaxed">
              Сейчас сайт МобДетали не использует рекламные или отслеживающие
              файлы cookie. Вместо cookie сайт хранит несколько технических значений
              прямо в вашем браузере (это называется локальным хранилищем —
              localStorage/sessionStorage) — они нужны для работы сайта и никуда с
              вашего устройства не отправляются, кроме случаев, описанных ниже.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Что именно хранится в браузере</h2>
            <ul className="list-disc list-inside text-ink leading-relaxed space-y-1.5">
              <li>
                <span className="font-medium">Корзина</span> — состав вашей корзины,
                чтобы она не пропадала при переходах по сайту и обновлении страницы.
              </li>
              <li>
                <span className="font-medium">Вход в аккаунт покупателя</span> — если
                вы вошли в личный кабинет, токен входа сохраняется в браузере, чтобы
                не запрашивать пароль при каждом визите. При выходе токен удаляется.
              </li>
              <li>
                <span className="font-medium">Вход в админку</span> — у сотрудников
                магазина токен входа хранится только на время открытой вкладки
                браузера.
              </li>
            </ul>
            <p className="text-ink leading-relaxed">
              Эти данные хранятся локально на вашем устройстве и используются только
              для работы самого сайта — при обращении к нашему серверу токен входа
              передаётся, чтобы подтвердить, что запрос от вас, но сами данные
              корзины и содержимое хранилища мы не собираем и не анализируем.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Если это изменится</h2>
            <p className="text-ink leading-relaxed">
              Если в будущем мы подключим аналитику посещаемости или рекламные
              сервисы, которые используют cookie, мы обновим эту страницу и, где
              это требуется по закону, спросим ваше согласие.
            </p>
          </section>

          <p className="text-xs text-muted">
            См. также{" "}
            <Link href="/privacy" className="text-brand hover:underline">
              политику конфиденциальности
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
