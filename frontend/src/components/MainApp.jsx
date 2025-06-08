import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import CarList from './CarList';
import CarForm from './CarForm';
import CarDetails from './CarDetails';
import MainPage from './MainPage';
import SupportPage from './SupportPage';
import UsersPage from './UsersPage';
import RentalsPage from './RentalsPage';
import UserRentalsPage from './UserRentalsPage';
import ApiService from '../services/api';

const Header = () => {
  const { user, logout } = useAuth();
  
  return (
    <header className="bg-gray-800 text-white py-4 w-full fixed top-0 left-0 right-0 z-50">
      <nav className="flex items-center px-6 flex-wrap">
        {/* Left section */}
        <div className="w-1/4 flex-shrink-0 min-w-fit">
          <a href="/main" className="text-3xl font-medium hover:text-gray-300">Головна</a>
        </div>

        {/* Center section */}
        <div className="flex-1 flex justify-center items-center space-x-8 min-w-fit">
          <a href="/" className="text-3xl font-medium hover:text-gray-300">Автопарк</a>
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

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

function CarManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const handleAddCar = async (carData) => {
    await ApiService.createCar(carData);
    setIsModalOpen(false);
    window.location.reload(); 
  };

  return (
    <div>
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex justify-between items-center mb-8">
          {user?.role === 'admin' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Додати новий автомобіль
            </button>
          )}
        </div>

        <CarList />

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white"> Додати новий автомобіль</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-300 hover:text-gray-500"
                  >
                    ×
                  </button>
                </div>
                <CarForm onSubmit={handleAddCar} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MainApp() {
  return (
    <div>
      <Header />
      <Routes>
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <SupportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <CarManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cars/:id"
          element={
            <ProtectedRoute>
              <CarDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute adminOnly={true}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rentals"
          element={
            <ProtectedRoute adminOnly={true}>
              <RentalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-rentals"
          element={
            <ProtectedRoute>
              <UserRentalsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default MainApp; 