import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — МобДетали",
};

export default function PrivacyPage() {
  return (
    <main>
      <Breadcrumbs
        items={[{ label: "Главная", href: "/" }, { label: "Политика конфиденциальности" }]}
      />

      <div className="max-w-container mx-auto px-4 py-10">
        <div className="max-w-3xl space-y-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">Политика конфиденциальности</h1>
            <p className="text-sm text-muted">Действует с {new Date().getFullYear()} года</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Общие положения</h2>
            <p className="text-ink leading-relaxed">
              Настоящая политика описывает, какие персональные данные собирает
              интернет-магазин МобДетали ({"["}указать организационно-правовую форму
              и название владельца сайта — ИП/ООО{"]"}, далее — «Магазин») на сайте
              mobdetali.example, как их использует и как их защищает, в соответствии
              с Федеральным законом от 27.07.2006 №152-ФЗ «О персональных данных».
            </p>
            <p className="text-ink leading-relaxed">
              Оформляя заказ или регистрируясь на сайте, вы соглашаетесь с условиями
              этой политики.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Какие данные мы собираем</h2>
            <p className="text-ink leading-relaxed">В зависимости от того, как вы пользуетесь сайтом:</p>
            <ul className="list-disc list-inside text-ink leading-relaxed space-y-1">
              <li>При регистрации — email и/или телефон, пароль (хранится в виде хэша, не в открытом виде), имя (необязательно).</li>
              <li>
                При оформлении заказа — имя, телефон, email (необязательно), адрес
                доставки (если выбрана курьерская доставка), комментарий к заказу.
              </li>
              <li>Технические данные о заказе — состав корзины, сумма, дата и статус.</li>
            </ul>
            <p className="text-ink leading-relaxed">
              Мы не запрашиваем данные о здоровье, судимости и другие специальные
              категории персональных данных, и не собираем данные о детях
              осознанно.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. Зачем мы используем эти данные</h2>
            <ul className="list-disc list-inside text-ink leading-relaxed space-y-1">
              <li>Оформление и выполнение заказа, связь с вами по заказу.</li>
              <li>Работа личного кабинета — вход в аккаунт, история заказов.</li>
              <li>Ответы на обращения, направленные через контакты на сайте.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Передача данных третьим лицам</h2>
            <p className="text-ink leading-relaxed">
              Сейчас Магазин не передаёт персональные данные сторонним компаниям —
              оплата принимается при получении заказа, а доставка согласуется
              напрямую с вами (см. страницу{" "}
              <Link href="/delivery" className="text-brand hover:underline">
                «Оплата и доставка»
              </Link>
              ). Если в будущем мы подключим платёжные сервисы или транспортные
              компании, которым потребуется передавать часть ваших данных для
              выполнения заказа (например, имя и адрес — курьерской службе), мы
              обновим эту страницу заранее.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Хранение данных</h2>
            <p className="text-ink leading-relaxed">
              Данные аккаунта хранятся, пока существует ваш аккаунт. Данные заказов,
              оформленных без регистрации, хранятся для истории и учёта заказов
              магазина. Вы можете попросить удалить свои данные — см. раздел 6.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Ваши права</h2>
            <p className="text-ink leading-relaxed">
              Вы можете запросить доступ к своим персональным данным, попросить их
              исправить или удалить, обратившись к нам по контактам, указанным на
              странице{" "}
              <Link href="/contacts" className="text-brand hover:underline">
                «Контакты»
              </Link>
              . Мы ответим в разумный срок.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Файлы cookie и локальное хранилище браузера</h2>
            <p className="text-ink leading-relaxed">
              О том, что сайт хранит в вашем браузере, — на странице{" "}
              <Link href="/cookies" className="text-brand hover:underline">
                «Файлы cookie»
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8. Изменения политики</h2>
            <p className="text-ink leading-relaxed">
              Мы можем обновлять эту политику — актуальная версия всегда доступна на
              этой странице. Существенные изменения (например, появление новых
              получателей данных) мы отметим отдельно.
            </p>
          </section>

          <p className="text-xs text-muted">
            Вопросы по обработке персональных данных можно направить по контактам со
            страницы{" "}
            <Link href="/contacts" className="text-brand hover:underline">
              «Контакты»
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
