import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone_number: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signup(formData);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Помилка під час реєстрації');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Створити обліковий запис</h1>
        <p className="subtitle">Зареєструйтесь, щоб почати користуватися системою оренди автомобілів</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Електронна пошта</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Введіть вашу електронну пошту"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введіть ваш пароль"
              minLength="6"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="first_name">Ім'я</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Введіть ваше ім'я"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Прізвище</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Введіть ваше прізвище"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="middle_name">По батькові</label>
            <input
              type="text"
              id="middle_name"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
              placeholder="Введіть ваше по батькові"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone_number">Номер телефону</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Введіть ваш номер телефону"
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Створити обліковий запис
          </button>
        </form>

        <p className="auth-footer">
          Вже маєте обліковий запис? <Link to="/login">Увійти</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup; 