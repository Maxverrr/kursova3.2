import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Header = () => {
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };
  
  return (
    <header className="bg-gray-800 text-white py-2 sm:py-4 w-full fixed top-0 left-0 right-0 z-50">
      <nav className="flex items-center px-2 sm:px-6 flex-wrap">
        {/* Left section */}
        <div className="w-1/4 flex-shrink-0 min-w-fit">
          <Link to="/mainpage" className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium hover:text-gray-300 transition-colors">Головна</Link>
        </div>

        {/* Center section */}
        <div className="flex-1 flex justify-center items-center space-x-4 sm:space-x-8 min-w-fit">
          <Link to="/MainApp" className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium hover:text-gray-300 transition-colors">Автопарк</Link>
        </div>

        {/* Right section */}
        <div className="flex-1 flex justify-end items-center space-x-2 sm:space-x-4 min-w-fit">
          <Link to="/support" className="text-sm sm:text-lg md:text-xl lg:text-2xl font-medium hover:text-gray-300 transition-colors">Тех. підтримка</Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/users" className="text-sm sm:text-lg md:text-xl lg:text-2xl font-medium hover:text-gray-300 transition-colors">Користувачі</Link>
              <Link to="/rentals" className="text-sm sm:text-lg md:text-xl lg:text-2xl font-medium hover:text-gray-300 transition-colors">Замовлення📃</Link>
            </>
          )}
          {user?.role === 'user' && (
            <Link to="/my-rentals" className="text-sm sm:text-lg md:text-xl lg:text-2xl font-medium hover:text-gray-300 transition-colors">Мої замовлення📃</Link>
          )}
          {user ? (
            <>
              <span className="hidden sm:inline text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-300">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm sm:text-lg md:text-xl lg:text-2xl px-2 sm:px-4 py-1 sm:py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Вийти
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm sm:text-lg md:text-xl lg:text-2xl px-2 sm:px-4 py-1 sm:py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Увійти
            </Link>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Підтвердження виходу</h2>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ×
              </button>
            </div>
            <p className="text-gray-300 mb-6">
              Ви впевнені, що хочете вийти з облікового запису?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                Скасувати
              </button>
              <button
                onClick={() => {
                  logout();
                  setIsLogoutModalOpen(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500"
              >
                Вийти
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 