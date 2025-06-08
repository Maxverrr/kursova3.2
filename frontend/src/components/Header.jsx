import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  
  return (
    <header className="bg-gray-800 text-white py-4 w-full fixed top-0 left-0 right-0 z-50">
      <nav className="flex items-center px-6 flex-wrap">
        {/* Left section */}
        <div className="w-1/4 flex-shrink-0 min-w-fit">
          <Link to="/mainpage" className="text-3xl font-medium hover:text-gray-300">Головна</Link>
        </div>

        {/* Center section */}
        <div className="flex-1 flex justify-center items-center space-x-8 min-w-fit">
          <Link to="/MainApp" className="text-3xl font-medium hover:text-gray-300">Автопарк</Link>
        </div>

        {/* Right section */}
        <div className="flex-1 flex justify-end items-center space-x-4 min-w-fit">
          <Link to="/support" className="text-2xl font-medium hover:text-gray-300">Тех. підтримка</Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/users" className="text-2xl font-medium hover:text-gray-300">Користувачі</Link>
              <Link to="/rentals" className="text-2xl font-medium hover:text-gray-300">Замовлення📃</Link>
            </>
          )}
          {user?.role === 'user' && (
            <Link to="/my-rentals" className="text-2xl font-medium hover:text-gray-300">Мої замовлення📃</Link>
          )}
          {user && (
            <>
              <span className="text-gray-300 text-2xl">{user.email}</span>
              <button
                onClick={logout}
                className="text-2xl px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Вийти
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header; 