import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ApiService from '../services/api';

const UserRentalsPage = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchUserRentals();
    }, []);

    const fetchUserRentals = async () => {
        try {
            setLoading(true);
            const allRentals = await ApiService.getRentals();
            // Filter rentals for current user
            const userRentals = allRentals.filter(rental => 
                rental.client_id && rental.client_id._id === user.id
            );
            setRentals(userRentals);
        } catch (err) {
            console.error('Error fetching user rentals:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'Не вказано';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Некоректна дата';
            
            return new Intl.DateTimeFormat('uk-UA', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Помилка формату дати';
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-800 to-gray-900 pt-24">
            <div className="container mx-auto px-4">
                <div className="text-white text-xl text-center">Завантаження...</div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-800 to-gray-900 pt-24">
            <div className="container mx-auto px-4">
                <div className="text-red-500 text-xl text-center">Помилка: {error}</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-800 to-gray-900 pt-24 px-4">
            <div className="container mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">Мої замовлення</h1>
                
                {rentals.length === 0 ? (
                    <div className="bg-gray-800 rounded-lg shadow-xl p-8 text-center">
                        <p className="text-gray-300 text-lg">У вас поки що немає замовлень</p>
                    </div>
                ) : (
                    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <div className="min-w-full inline-block align-middle">
                                <div className="overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-700">
                                        <thead className="bg-gray-700">
                                            <tr>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Автомобіль</th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Дата початку</th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Дата закінчення</th>
                                                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Сума</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                                            {rentals.map(rental => (
                                                <tr key={rental._id} className="hover:bg-gray-700/50">
                                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        
                                                    {rental.car_id?._id && (
                                                            <Link
                                                                to={`/cars/${rental.car_id._id}`}
                                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                                            >
                                                                {rental.car_id?.name || 'Невідомо'}
                                                            </Link>
                                                        )}
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        {formatDate(rental.start_date)}
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        {formatDate(rental.end_date)}
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                        {rental.total_price} ₴
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserRentalsPage;