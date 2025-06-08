import { useNavigate } from 'react-router-dom';

const MainPage = () => {
  const navigate = useNavigate();

  return (
    //Фон
    <div className="relative min-h-screen w-full">
      <div 
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ 
          backgroundImage: 'url("/img/main.jpeg")',
          zIndex: -1
        }}
      />
      
      {/*Кнопка*/}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="absolute top-[55%]">
          <button
            onClick={() => navigate('/MainApp')}
            className="px-8 py-4 bg-white text-black text-4xl font-bold rounded-lg hover:bg-gray-200 transition-all transform hover:scale-105 shadow-xl"
          >
            Орендувати автомобіль зараз
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainPage;