import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { useAuth } from '../context/AuthContext';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const { user: currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await ApiService.getUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (userId, updatedData) => {
        try {
            await ApiService.updateUser(userId, updatedData);
            setEditingUser(null);
            await fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Ви впевнені, що хочете видалити цього користувача? Цю дію неможливо скасувати.')) {
            try {
                await ApiService.deleteUser(userId);
                await fetchUsers();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 pt-24">
            <div className="container mx-auto px-4">
                <div className="text-white text-xl text-center">Завантаження...</div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 pt-24">
            <div className="container mx-auto px-4">
                <div className="text-red-500 text-xl text-center">Помилка: {error}</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-800 to-gray-900 pt-24 px-4">
            <div className="container mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">Користувачі</h1>
                
                <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <div className="min-w-full inline-block align-middle">
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-gray-700">
                                        <tr>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Email</th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Ім'я</th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Прізвище</th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Роль</th>
                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Дії</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                                        {users.map(user => (
                                            <tr key={user._id} className="hover:bg-gray-700/50">
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {user.email}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {user.first_name}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {user.last_name}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    {user.role}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        <button
                                                            onClick={() => setEditingUser(user)}
                                                            className="text-yellow-500 hover:text-yellow-400"
                                                        >
                                                            Редагувати
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user._id)}
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

                {editingUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-lg w-full max-w-md">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-white mb-4">Редагувати користувача</h2>
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleEdit(editingUser._id, {
                                        first_name: e.target.first_name.value,
                                        last_name: e.target.last_name.value,
                                        role: e.target.role.value
                                    });
                                }}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Ім'я</label>
                                            <input
                                                type="text"
                                                name="first_name"
                                                defaultValue={editingUser.first_name}
                                                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Прізвище</label>
                                            <input
                                                type="text"
                                                name="last_name"
                                                defaultValue={editingUser.last_name}
                                                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300">Роль</label>
                                            <select
                                                name="role"
                                                defaultValue={editingUser.role}
                                                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                                            >
                                                <option value="user">Користувач</option>
                                                <option value="admin">Адміністратор</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setEditingUser(null)}
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

export default UsersPage; 