import type { Metadata } from "next";
import { Phone, Mail, Clock, MapPin } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Контакты — ScreenHub",
};

export default function ContactsPage() {
  return (
    <main>
      <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Контакты" }]} />

      <div className="max-w-container mx-auto px-4 py-10">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-2xl font-bold">Контакты</h1>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-card border border-border bg-white p-5 flex items-start gap-3">
              <Phone size={20} className="text-brand shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-1">Телефон</p>
                <a href="tel:+79014922269" className="text-ink hover:text-brand">
                  +7 (901) 492-22-69
                </a>
              </div>
            </div>

            <div className="rounded-card border border-border bg-white p-5 flex items-start gap-3">
              <Mail size={20} className="text-brand shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-1">Email</p>
                <a href="mailto:info@screenhub.example" className="text-ink hover:text-brand">
                  info@screenhub.example
                </a>
              </div>
            </div>

            <div className="rounded-card border border-border bg-white p-5 flex items-start gap-3">
              <Clock size={20} className="text-brand shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-1">Часы работы</p>
                <p className="text-ink">Ежедневно: 09:00–18:00</p>
              </div>
            </div>

            <div className="rounded-card border border-border bg-white p-5 flex items-start gap-3">
              <MapPin size={20} className="text-brand shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-1">Пункт самовывоза</p>
                <p className="text-ink">г. Кореновск, ул. Ленина, 124</p>
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">По каким вопросам обращаться</h2>
            <p className="text-ink leading-relaxed">
              Подбор запчасти под вашу модель устройства, статус уже оформленного
              заказа (укажите номер заказа), обмен и возврат, вопросы по обработке
              персональных данных — по любому из этих поводов можно написать или
              позвонить нам.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
