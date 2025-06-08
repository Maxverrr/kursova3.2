import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import MainApp from './components/MainApp.jsx';
import UsersPage from './components/UsersPage.jsx';
import RentalsPage from './components/RentalsPage.jsx';
import MyRentalsPage from './components/MyRentalsPage.jsx';
import SupportPage from './components/SupportPage.jsx';
import { AuthProvider } from './context/AuthContext';
import './App.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={
            <PrivateRoute>
              <MainApp />
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
              <MyRentalsPage />
            </PrivateRoute>
          } />
          <Route path="/support" element={
            <PrivateRoute>
              <SupportPage />
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
