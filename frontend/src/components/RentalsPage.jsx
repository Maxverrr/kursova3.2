import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../services/api';

const RentalsPage = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingRental, setEditingRental] = useState(null);

    useEffect(() => {
        fetchRentals();
    }, []);

    const fetchRentals = async () => {
        try {
            console.log('Starting to fetch rentals...');
            setLoading(true);
            const data = await ApiService.getRentals();
            console.log('Received rentals data:', data);
            setRentals(data);
        } catch (err) {
            console.error('Error fetching rentals:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (rentalId, updatedData) => {
        try {
            await ApiService.updateRental(rentalId, updatedData);
            setEditingRental(null);
            await fetchRentals();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (rentalId) => {
        if (window.confirm('Ви впевнені, що хочете видалити це замовлення? Цю дію неможливо скасувати.')) {
            try {
                await ApiService.deleteRental(rentalId);
                await fetchRentals();
            } catch (err) {
                setError(err.message);
            }
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
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">Замовлення</h1>
                
                <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <div className="min-w-full inline-block align-middle">
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Автомобіль</th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Клієнт</th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Дата початку</th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Дата закінчення</th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Сума</th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Дії</th>
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
                                                                {rental.car_id?.name}
                                                            </Link>
                                                        )}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {rental.client_id ? (
                                                        <div>
                                                            <div>{rental.client_id.email}</div>
                                                            <div className="text-xs text-gray-400">
                                                                {rental.client_id.last_name} {rental.client_id.first_name}
                                                            </div>
                                                        </div>
                                                    ) : 'Невідомо'}
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
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        <button
                                                            onClick={() => setEditingRental(rental)}
                                                            className="text-yellow-500 hover:text-yellow-400"
                                                        >
                                                            Редагувати
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(rental._id)}
                                                            className="text-red-500 hover:text-red-400"
                                                        >
                                                            Видалити
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {editingRental && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-lg w-full max-w-md">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-white mb-4">Редагувати замовлення</h2>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleEdit(editingRental._id, {
                                        start_date: e.target.start_date.value,
                                        end_date: e.target.end_date.value,
                                        total_price: parseFloat(e.target.total_price.value)
                                    });
                                }}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Дата початку</label>
                                            <input
                                                type="datetime-local"
                                                name="start_date"
                                                defaultValue={editingRental.start_date ? new Date(editingRental.start_date).toISOString().slice(0, 16) : ''}
                                                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Дата закінчення</label>
                                            <input
                                                type="datetime-local"
                                                name="end_date"
                                                defaultValue={editingRental.end_date ? new Date(editingRental.end_date).toISOString().slice(0, 16) : ''}
                                                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Сума</label>
                                            <input
                                                type="number"
                                                name="total_price"
                                                defaultValue={editingRental.total_price}
                                                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setEditingRental(null)}
                                            className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                                        >
                                            Скасувати
                                        </button>
                                        <button
                                            type="submit"
                                            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                                        >
                                            Зберегти
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RentalsPage; 