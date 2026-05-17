import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthPageLayout from './AuthPageLayout';
import { pageInputClass } from './AppPageLayout';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData.email, formData.password);
      navigate('/MainApp?page=1');
    } catch (err) {
      setError(err.message || 'Помилка під час входу в систему');
    }
  };

  return (
    <AuthPageLayout>
      <h1 className="text-center text-2xl font-bold sm:text-3xl">Ласкаво просимо</h1>
      <p className="mt-2 text-center text-sm text-white/60 sm:text-base">
        Увійдіть до системи оренди автомобілів
      </p>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
            Електронна пошта
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Введіть вашу електронну пошту"
            className={pageInputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/80">
            Пароль
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Введіть ваш пароль"
            className={pageInputClass}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500"
        >
          Увійти
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/60">
        Немає облікового запису?{' '}
        <Link to="/signup" className="font-medium text-blue-400 hover:text-blue-300">
          Зареєструватися
        </Link>
      </p>
    </AuthPageLayout>
  );
};

export default Login;
