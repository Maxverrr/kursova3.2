import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthPageLayout from './AuthPageLayout';
import { pageInputClass } from './AppPageLayout';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone_number: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const field = (id, label, type = 'text', extra = {}) => (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-white/80">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={formData[id]}
        onChange={handleChange}
        className={pageInputClass}
        required
        {...extra}
      />
    </div>
  );

  return (
    <AuthPageLayout wide>
      <h1 className="text-center text-2xl font-bold sm:text-3xl">Створити обліковий запис</h1>
      <p className="mt-2 text-center text-sm text-white/60">
        Зареєструйтесь, щоб почати користуватися системою оренди
      </p>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {field('email', 'Електронна пошта', 'email', { placeholder: 'email@example.com' })}
        {field('password', 'Пароль', 'password', {
          placeholder: 'Мінімум 6 символів',
          minLength: 6,
        })}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field('first_name', "Ім'я", 'text', { placeholder: "Ваше ім'я" })}
          {field('last_name', 'Прізвище', 'text', { placeholder: 'Ваше прізвище' })}
        </div>
        {field('middle_name', 'По батькові', 'text', { placeholder: 'По батькові' })}
        {field('phone_number', 'Номер телефону', 'tel', { placeholder: '+380...' })}

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500"
        >
          Створити обліковий запис
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/60">
        Вже маєте обліковий запис?{' '}
        <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
          Увійти
        </Link>
      </p>
    </AuthPageLayout>
  );
};

export default Signup;
