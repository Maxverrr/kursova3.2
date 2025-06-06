import { useState, useEffect } from 'react';
import ApiService from '../services/api';

const CarForm = ({ onSubmit, initialData = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        body_type_id: '',
        class_id: '',
        engine_volume: '',
        horsepower: '',
        fuel_type_id: '',
        fuel_consumption: '',
        color: '',
        price_per_day: '',
        status_id: '',
        photo: ''
    });
    const [referenceData, setReferenceData] = useState({
        bodyTypes: [],
        classes: [],
        fuelTypes: [],
        statuses: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                body_type_id: initialData.body_type_id || initialData.body_type?._id || '',
                class_id: initialData.class_id || initialData.class?._id || '',
                fuel_type_id: initialData.fuel_type_id || initialData.fuel_type?._id || '',
                status_id: initialData.status_id || initialData.status?._id || ''
            });
        }
    }, [initialData]);

    useEffect(() => {
        const fetchReferenceData = async () => {
            try {
                setLoading(true);
                const data = await ApiService.getReferenceData();
                setReferenceData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReferenceData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            
            // Transform data for API
            const submitData = {
                ...formData,
                engine_volume: parseFloat(formData.engine_volume),
                horsepower: parseInt(formData.horsepower),
                price_per_day: parseFloat(formData.price_per_day),
                fuel_consumption: formData.fuel_consumption.toString()
            };

            await onSubmit(submitData);
            
            if (!initialData) {
                setFormData({
                    name: '',
                    body_type_id: '',
                    class_id: '',
                    engine_volume: '',
                    horsepower: '',
                    fuel_type_id: '',
                    fuel_consumption: '',
                    color: '',
                    price_per_day: '',
                    status_id: '',
                    photo: ''
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !initialData) return <div className="text-center py-4">Завантаження...</div>;
    if (error) return <div className="text-red-500 text-center py-4">Помилка: {error}</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-400 p-6 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Назва</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">URL фото</label>
                    <input
                        type="url"
                        name="photo"
                        value={formData.photo}
                        onChange={handleChange}
                        required
                        placeholder="https://example.com/car-photo.jpg"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Тип кузова</label>
                    <select
                        name="body_type_id"
                        value={formData.body_type_id}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Оберіть тип кузова</option>
                        {referenceData.bodyTypes.map(type => (
                            <option key={type._id} value={type._id}>{type.type_name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Клас</label>
                    <select
                        name="class_id"
                        value={formData.class_id}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Оберіть клас</option>
                        {referenceData.classes.map(cls => (
                            <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Об'єм двигуна (л)</label>
                    <input
                        type="number"
                        name="engine_volume"
                        value={formData.engine_volume}
                        onChange={handleChange}
                        step="0.1"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Потужність (к.с.)</label>
                    <input
                        type="number"
                        name="horsepower"
                        value={formData.horsepower}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Тип палива</label>
                    <select
                        name="fuel_type_id"
                        value={formData.fuel_type_id}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Оберіть тип палива</option>
                        {referenceData.fuelTypes.map(type => (
                            <option key={type._id} value={type._id}>{type.fuel_type}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Витрата палива (л/100км)</label>
                    <input
                        type="number"
                        name="fuel_consumption"
                        value={formData.fuel_consumption}
                        onChange={handleChange}
                        step="0.1"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Колір</label>
                    <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Ціна за день (₴)</label>
                    <input
                        type="number"
                        name="price_per_day"
                        value={formData.price_per_day}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Статус</label>
                    <select
                        name="status_id"
                        value={formData.status_id}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">Оберіть статус</option>
                        {referenceData.statuses.map(status => (
                            <option key={status._id} value={status._id}>{status.status ? 'Доступний' : 'Недоступний'}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
                >
                    {loading ? 'Збереження...' : initialData ? 'Оновити' : 'Створити'}
                </button>
            </div>
        </form>
    );
};

export default CarForm; 