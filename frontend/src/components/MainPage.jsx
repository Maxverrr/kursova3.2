import { Link } from 'react-router-dom';
import { FaPhone, FaTelegram, FaInstagram } from 'react-icons/fa';

/** Шлях до фото в hero-блоці (рядок ~5) */
const HERO_CAR_IMAGE = '/img/mainpagebmw.png';

const FEATURES = [
  {
    title: 'Технічні характеристики',
    text: 'У нашому автопарку — сучасні моделі з розумними системами безпеки, комфортом і стабільною потужністю для будь-якої поїздки.',
  },
  {
    title: 'Наші клієнти',
    text: 'Працюємо з приватними клієнтами та бізнесом: прозорі умови, швидке оформлення і підтримка на кожному етапі оренди.',
  },
  {
    title: 'Екологічність',
    text: 'Розширюємо лінійку економічних і гібридних авто — менше витрат палива без компромісів із якістю сервісу.',
  },
];

const MainPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 pt-28 lg:pt-32">
        {/* Hero */}
        <section
          className="mb-16 grid grid-cols-1 items-center gap-10 lg:mb-24 lg:grid-cols-2 lg:gap-12"
          aria-labelledby="landing-heading"
        >
          <div className="order-2 lg:order-1">
            <h1
              id="landing-heading"
              className="mb-7 text-[clamp(2.75rem,8vw,5.5rem)] font-extrabold uppercase leading-[0.95] tracking-tight"
            >
              <span className="block">Авто.</span>
              <span className="block">Для.</span>
              <span className="block">будь-якої.</span>
              <span className="block">подорожі.</span>
            </h1>
            <p className="mb-8 max-w-md text-base leading-relaxed text-white/75 sm:text-[1.0625rem]">
              У нас є автомобілі на кожну міську поїздку і далеку дорогу. Перегляньте
              автопарк і оберіть модель під свій стиль життя.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/MainApp"
                className="inline-flex items-center justify-center border-2 border-white bg-white px-7 py-3.5 text-[0.9375rem] font-semibold text-black transition hover:-translate-y-0.5 hover:bg-neutral-200"
              >
                Наш автопарк
              </Link>
              <Link
                to="/support"
                className="inline-flex items-center justify-center border-2 border-white bg-transparent px-7 py-3.5 text-[0.9375rem] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Зв&apos;язатися
              </Link>
            </div>
          </div>

          <div
            className="relative order-1 mx-auto aspect-square w-full max-w-[520px] lg:order-2 lg:ml-auto lg:max-w-none"
            aria-hidden="true"
          >
            <div className="absolute left-[-4%] top-[8%] z-0 h-[72%] w-[28%] bg-[#3d3d3d]" />
            <div className="absolute right-[-6%] top-[18%] z-0 h-[58%] w-[22%] bg-[#e85d04]" />
            <div className="absolute bottom-[-2%] right-[4%] z-0 h-[22%] w-[42%] bg-[#e8e4df]" />
            <div className="relative z-10 mx-auto mt-[11%] h-[78%] w-[78%] overflow-hidden bg-neutral-900">
              <img
                src={HERO_CAR_IMAGE}
                alt="Преміальний автомобіль Burunduk Garage"
                className="h-full w-full object-cover object-[center_40%]"
                onError={(e) => {
                  e.currentTarget.src = HERO_CAR_IMAGE_FALLBACK;
                }}
              />
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          className="grid grid-cols-1 gap-10 border-t border-white/10 pt-8 md:grid-cols-3 md:gap-8"
          aria-label="Переваги сервісу"
        >
          {FEATURES.map((item) => (
            <article key={item.title}>
              <h2 className="mb-3 text-lg font-bold uppercase tracking-wide">{item.title}</h2>
              <p className="text-[0.9375rem] leading-relaxed text-white/70">{item.text}</p>
            </article>
          ))}
        </section>

        {/* Contact */}
        <footer className="mt-16 border-t border-white/10 pt-8">
          <p className="mb-5 text-center text-sm font-bold uppercase tracking-widest text-white/50">
            Зв&apos;яжіться з нами
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
            <a
              href="tel:+380962523909"
              className="inline-flex items-center gap-2 text-[0.9375rem] text-white/85 transition hover:text-[#e85d04]"
            >
              <FaPhone className="text-lg" />
              <span>+38 (096) 252-39-09</span>
            </a>
            <a
              href="https://t.me/Burunduk_garage"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[0.9375rem] text-white/85 transition hover:text-[#e85d04]"
            >
              <FaTelegram className="text-lg" />
              <span>@Burunduk_garage</span>
            </a>
            <a
              href="https://instagram.com/Burunduk_garage"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[0.9375rem] text-white/85 transition hover:text-[#e85d04]"
            >
              <FaInstagram className="text-lg" />
              <span>@Burunduk_garage</span>
            </a>
          </div>
        </footer>
            </div>
            </div>
  );
};

export default MainPage;
