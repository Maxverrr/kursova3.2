const SupportPage = () => {
  const handlePhoneClick = () => {
    window.location.href = 'tel:+380950390916';
  };

  const handleTelegramClick = () => {
    window.location.href = 'https://t.me/bgarage_support_bot';
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-[#FFE4D6] pt-10">
      <div className="flex flex-col items-center justify-center gap-8 w-full max-w-screen-lg mx-auto p-4">
        {/*Телеграм*/}
        <button 
          onClick={handleTelegramClick}
          className="transform hover:scale-105 transition-transform duration-200 w-full"
        >
          <img 
            src="/img/supportt.png" 
            alt="Telegram Support" 
            className="w-full max-w-md md:max-w-xl lg:max-w-2xl h-auto mx-auto"
          />
        </button>

        {/* Кнопка для дзвінка */}
        <button 
          onClick={handlePhoneClick}
          className="transform hover:scale-105 transition-transform duration-200 w-full"
        >
          <img 
            src="/img/supportp.PNG" 
            alt="Phone Support" 
            className="w-full max-w-md md:max-w-xl lg:max-w-2xl h-auto mx-auto"
          />
        </button>
      </div>
    </div>
  );
};

export default SupportPage; 