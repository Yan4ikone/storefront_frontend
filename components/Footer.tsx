import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white/70">
      <div className="max-w-container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <p className="text-white font-extrabold text-xl mb-3">МобДетали</p>
          <p className="max-w-[220px]">
            Запчасти, инструменты и аксессуары для смартфонов и ноутбуков.
          </p>
        </div>

        <div>
          <p className="text-white font-semibold mb-3">Покупателям</p>
          <ul className="space-y-2">
            <li>
              <Link href="/how-to-order" className="hover:text-white">
                Как оформить заказ
              </Link>
            </li>
            <li>
              <Link href="/delivery" className="hover:text-white">
                Оплата и доставка
              </Link>
            </li>
            <li>
              <Link href="/warranty" className="hover:text-white">
                Гарантия
              </Link>
            </li>
            <li>
              <Link href="/catalog" className="hover:text-white">
                Прайс-лист
              </Link>
            </li>
            <li>
              <Link href="/contacts" className="hover:text-white">
                Контакты
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-white font-semibold mb-3">Каталог</p>
          <ul className="space-y-2">
            <li>
              <a href="#catalog" className="hover:text-white">
                Аккумуляторы
              </a>
            </li>
            <li>
              <a href="#catalog" className="hover:text-white">
                Дисплеи
              </a>
            </li>
            <li>
              <a href="#catalog" className="hover:text-white">
                Запчасти
              </a>
            </li>
            <li>
              <a href="#catalog" className="hover:text-white">
                Аксессуары
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-white font-semibold mb-3">Контакты</p>
          <ul className="space-y-2">
            <li>+7 (000) 000-00-00</li>
            <li>info@mobdetali.example</li>
            <li>Ежедневно: 09:00–19:00</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-container mx-auto px-4 py-4 text-xs flex flex-col sm:flex-row gap-2 sm:justify-between">
          <p>© {new Date().getFullYear()} МобДетали. Все права защищены.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">
              Политика конфиденциальности
            </Link>
            <Link href="/cookies" className="hover:text-white">
              Файлы cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
