import { useNavigate } from 'react-router-dom';

const MainPage = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("/img/main.jpeg")',
          zIndex: -1
        }}
      />
      
      <div className="relative z-10 h-full flex items-center justify-center">
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