import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user } = useAuth();
  
  // Не показуємо хедер на сторінках логіну та реєстрації
  const showHeader = user && !['/login', '/signup'].includes(window.location.pathname);

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Navigate to="/mainpage" />} />
        <Route path="/mainpage" element={
          <PrivateRoute>
            <MainPage />
          </PrivateRoute>
        } />
        <Route path="/MainApp" element={
          <PrivateRoute>
            <MainApp />
          </PrivateRoute>
        } />
        <Route path="/cars/:id" element={
          <PrivateRoute>
            <CarDetails />
          </PrivateRoute>
        } />
        <Route path="/users" element={
          <PrivateRoute>
            <UsersPage />
          </PrivateRoute>
        } />
        <Route path="/rentals" element={
          <PrivateRoute>
            <RentalsPage />
          </PrivateRoute>
        } />
        <Route path="/my-rentals" element={
          <PrivateRoute>
            <UserRentalsPage />
          </PrivateRoute>
        } />
        <Route path="/support" element={
          <PrivateRoute>
            <SupportPage />
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
