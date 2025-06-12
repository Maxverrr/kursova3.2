const SupportPage = () => {
  const handlePhoneClick = () => {
    window.location.href = 'tel:+380950390916';
  };

  const handleTelegramClick = () => {
    window.location.href = 'https://t.me/bgarage_support_bot';
  };

  return (
    <div className="fixed inset-0 bg-[#FFE4D6] overflow-hidden">
      <div className="h-full flex flex-col items-center justify-center gap-8 p-4">
        <div className="flex flex-col items-center justify-center gap-8 w-full max-w-screen-lg mx-auto">
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

    
            {/* Телефон */}
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
    </div>
  );
};

export default SupportPage; 

