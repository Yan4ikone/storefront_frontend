export default function Hero() {
  return (
    <section className="bg-brand">
      <div className="max-w-container mx-auto px-4 py-10 md:py-14 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="text-accent font-semibold text-sm uppercase tracking-wide mb-3">
            Запчасти · Аксессуары · Инструменты
          </p>
          <h1 className="text-white text-3xl md:text-4xl font-extrabold leading-tight mb-4">
            Оригинальные и совместимые запчасти для смартфонов и ноутбуков
          </h1>
          <p className="text-white/70 mb-6 max-w-md">
            Более 5000 наименований в наличии. Проверка каждой позиции перед отправкой
            и гарантия на большинство товаров.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#catalog"
              className="bg-accent hover:bg-accent-dark transition-colors text-white font-semibold rounded-card px-6 py-3"
            >
              Перейти в каталог
            </a>
            <a
              href="#"
              className="border border-white/30 hover:border-white/60 transition-colors text-white font-semibold rounded-card px-6 py-3"
            >
              Как оформить заказ
            </a>
          </div>
        </div>

        {/* Плейсхолдер под баннер/фото — заменяется реальной картинкой позже */}
        <div className="hidden md:flex h-64 rounded-card bg-white/5 border border-white/10 items-center justify-center text-white/30 text-sm">
          Место под баннер / фото
        </div>
      </div>
    </section>
  );
}
