import React from 'react';
import { Link } from 'react-router-dom';
import { FaPhone, FaTelegram, FaInstagram, FaClock, FaShieldAlt, FaMoneyBillWave, FaCar, FaCalendarAlt, FaMouse, FaTruck, FaCarSide, FaTag, FaRoad } from 'react-icons/fa';

const AdvantageCard = ({ icon, title, description }) => (
  <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
    <div className="text-blue-500 text-3xl sm:text-4xl mb-3 sm:mb-4 flex justify-center">
      {icon}
    </div>
    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 text-center">{title}</h3>
    <p className="text-gray-300 text-sm sm:text-base text-center">{description}</p>
  </div>
);

const MainPage = () => {
  const advantages = [
    {
      icon: <FaClock />,
      title: "Цілодобова підтримка",
      description: "Ми завжди на зв'язку — 24/7 онлайн і телефоном."
    },
    {
      icon: <FaShieldAlt />,
      title: "Страхування включено",
      description: "Усі авто застраховані — ніяких прихованих витрат."
    },
    {
      icon: <FaMoneyBillWave />,
      title: "Без депозиту",
      description: "Не блокуємо гроші на карті — чесні умови оренди."
    },
    {
      icon: <FaCar />,
      title: "Авто в ідеальному стані",
      description: "Регулярне техобслуговування, чистота та повний бак при видачі."
    },
    {
      icon: <FaCalendarAlt />,
      title: "Гнучка оренда (від 1 дня)",
      description: "Хоч на 1 день, хоч на місяць — підлаштовуємось під тебе."
    },
    {
      icon: <FaMouse />,
      title: "Швидке бронювання онлайн",
      description: "Займає менше 2 хвилин. Без дзвінків і зайвих паперів."
    },
    {
      icon: <FaTruck />,
      title: "Доставка авто до клієнта",
      description: "Можемо привезти автомобіль прямо до тебе (у межах міста)."
    },
    {
      icon: <FaCarSide />,
      title: "Великий вибір авто",
      description: "Від бюджетних моделей до преміум-класу та позашляховиків."
    },
    {
      icon: <FaTag />,
      title: "Прозоре ціноутворення",
      description: "Всі ціни видно одразу — ніяких «дрібних шрифтів»."
    },
    {
      icon: <FaRoad />,
      title: "Без обмеження пробігу",
      description: "Їдь скільки хочеш — без доплат за кілометраж."
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-blue-900">
     
      <div className="container mx-auto px-4 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 px-2">
            Оренда автомобілів в Україні
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">
            Зручно, швидко та надійно
          </p>
          <Link
            to="/MainApp"
            className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white text-lg sm:text-xl font-bold rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Орендувати автомобіль зараз
          </Link>
        </div>

       
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16">
          {advantages.map((advantage, index) => (
            <AdvantageCard key={index} {...advantage} />
          ))}
        </div>

       
        <div className="bg-gray-800 rounded-lg p-6 sm:p-8 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
            Зв'яжіться з нами
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <a
              href="tel:+380962523909"
              className="flex items-center justify-center space-x-3 text-white hover:text-blue-400 transition-colors p-2 sm:p-0"
            >
              <FaPhone className="text-xl sm:text-2xl" />
              <span className="text-base sm:text-xl">+38 (096) 252-39-09</span>
            </a>
            <a
              href="https://t.me/Burunduk_garage"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-3 text-white hover:text-blue-400 transition-colors p-2 sm:p-0"
            >
              <FaTelegram className="text-xl sm:text-2xl" />
              <span className="text-base sm:text-xl">@Burunduk_garage</span>
            </a>
            <a
              href="https://instagram.com/Burunduk_garage"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-3 text-white hover:text-blue-400 transition-colors p-2 sm:p-0"
            >
              <FaInstagram className="text-xl sm:text-2xl" />
              <span className="text-base sm:text-xl">@Burunduk_garage</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;