import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import MainApp from './components/MainApp.jsx';
import UsersPage from './components/UsersPage.jsx';
import RentalsPage from './components/RentalsPage.jsx';
import UserRentalsPage from './components/UserRentalsPage.jsx';
import SupportPage from './components/SupportPage.jsx';
import Header from './components/Header.jsx';
import MainPage from './components/MainPage.jsx';
import CarDetails from './components/CarDetails.jsx';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  
  // Показуємо хедер завжди, крім сторінок логіну та реєстрації
  const showHeader = !['/login', '/signup'].includes(location.pathname);

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        {/* Публічні маршрути */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Navigate to="/MainApp" />} />
        <Route path="/MainApp" element={<MainApp />} />
        <Route path="/cars/:id" element={<CarDetails />} />
        <Route path="/mainpage" element={<MainPage />} />
        <Route path="/support" element={<SupportPage />} />

        {/* Захищені маршрути */}
        <Route path="/my-rentals" element={
          <PrivateRoute>
            <UserRentalsPage />
          </PrivateRoute>
        } />

        {/* Маршрути тільки для адміністратора */}
        <Route path="/users" element={
          <PrivateRoute adminOnly={true}>
            <UsersPage />
          </PrivateRoute>
        } />
        <Route path="/rentals" element={
          <PrivateRoute adminOnly={true}>
            <RentalsPage />
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
