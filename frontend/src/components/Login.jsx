import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

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
            await login(formData.email, formData.password);
            navigate('/MainApp?page=1');
        } catch (err) {
            setError(err.message || 'Помилка під час входу в систему');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1>Ласкаво просимо</h1>
                <p className="subtitle">Увійдіть до системи оренди автомобілів</p>

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
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button">
                        Увійти
                    </button>
                </form>

                <p className="auth-footer">
                    Немає облікового запису? <Link to="/signup">Зареєструватися</Link>
                </p>
            </div>
        </div>
    );
};

export default Login; 