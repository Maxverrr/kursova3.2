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
                  <h2 className="text-2xl font-bold text-white">Додати новий автомобіль</h2>
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
    <Routes>
      <Route path="/" element={<CarManagement />} />
    </Routes>
  );
}

export default MainApp; 