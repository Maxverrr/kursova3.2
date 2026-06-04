import { Routes, Route } from 'react-router-dom';
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
import PremiumBackground from './PremiumBackground';

function CarManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const handleAddCar = async (carData) => {
    try {
      await ApiService.createCar(carData);
      setIsModalOpen(false);
      // Dispatch custom event to update car list
      window.dispatchEvent(new CustomEvent('carListUpdated'));
    } catch (error) {
      console.error('Error adding car:', error);
      throw error;
    }
  };

  return (
    <>
      <PremiumBackground variant="fleet" />
      <div className="min-h-screen w-full relative">
        <div className="container mx-auto px-4 pt-[calc(var(--site-header-height)+1.5rem)] pb-8">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          {user?.role === 'admin' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 sm:w-auto"
            >
              Додати новий автомобіль
            </button>
          )}
        </div>

        <CarList />

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-panel-strong max-h-[90vh] w-full max-w-4xl overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h2 className="text-xl font-bold text-white sm:text-2xl">Додати новий автомобіль</h2>
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
    </>
  );
}

function MainApp() {
  return (
    <Routes>
      <Route path="/" element={<CarManagement />} />
    </Routes>
  );
}

export default MainApp; 
