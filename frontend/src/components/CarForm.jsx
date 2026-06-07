import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import { getCarImageStyle, getCarSpecLabels, withImageKitBackgroundRemoval } from '../utils/carDisplay';

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
        photo: '',
        image_position_x: 0,
        image_position_y: 0,
        image_zoom: 1
    });
    const [referenceData, setReferenceData] = useState({
        bodyTypes: [],
        classes: [],
        fuelTypes: [],
        statuses: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const selectedFuelType = referenceData.fuelTypes.find(
        type => type._id === formData.fuel_type_id
    );
    const specLabels = getCarSpecLabels(selectedFuelType?.fuel_type || initialData);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                body_type_id: initialData.body_type_id || initialData.body_type?._id || '',
                class_id: initialData.class_id || initialData.class?._id || '',
                fuel_type_id: initialData.fuel_type_id || initialData.fuel_type?._id || '',
                status_id: initialData.status_id || initialData.status?._id || '',
                image_position_x: initialData.image_position_x ?? 0,
                image_position_y: initialData.image_position_y ?? 0,
                image_zoom: initialData.image_zoom ?? 1
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

    const resetImagePosition = () => {
        setFormData(prev => ({
            ...prev,
            image_position_x: 0,
            image_position_y: 0,
            image_zoom: 1
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
                fuel_consumption: formData.fuel_consumption.toString(),
                image_position_x: parseFloat(formData.image_position_x) || 0,
                image_position_y: parseFloat(formData.image_position_y) || 0,
                image_zoom: parseFloat(formData.image_zoom) || 1
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
                    photo: '',
                    image_position_x: 0,
                    image_position_y: 0,
                    image_zoom: 1
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
        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-gray-400 p-4 shadow sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
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

                <div className="md:col-span-2">
                    <div className="rounded-lg border border-white/15 bg-slate-950 p-4 shadow-inner">
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-white">Позиція фото на карточці</h3>
                                <p className="text-sm text-slate-300">Рухай фото повзунками і збережи авто.</p>
                            </div>
                            <button
                                type="button"
                                onClick={resetImagePosition}
                                className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
                            >
                                Скинути
                            </button>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,1fr)]">
                            <div className="car-showroom-bg relative aspect-[16/9.5] overflow-hidden rounded-lg border border-white/10">
                                {formData.photo ? (
                                    <img
                                        src={withImageKitBackgroundRemoval(formData.photo)}
                                        alt="Прев'ю авто"
                                        style={getCarImageStyle(formData)}
                                        className="absolute h-full w-full object-cover drop-shadow-[0_24px_32px_rgba(0,0,0,0.55)]"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-400">
                                        Встав URL фото, щоб побачити прев'ю.
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 rounded-lg bg-white/5 p-4">
                                <label className="block">
                                    <div className="mb-2 flex items-center justify-between gap-3 text-sm text-white">
                                        <span>Лівіше / правіше</span>
                                        <input
                                            type="number"
                                            name="image_position_x"
                                            value={formData.image_position_x}
                                            onChange={handleChange}
                                            min="-120"
                                            max="120"
                                            step="1"
                                            className="w-20 rounded border-white/20 bg-slate-900 px-2 py-1 text-right text-white"
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        name="image_position_x"
                                        value={formData.image_position_x}
                                        onChange={handleChange}
                                        min="-120"
                                        max="120"
                                        step="1"
                                        className="w-full accent-blue-500"
                                    />
                                </label>

                                <label className="block">
                                    <div className="mb-2 flex items-center justify-between gap-3 text-sm text-white">
                                        <span>Вище / нижче</span>
                                        <input
                                            type="number"
                                            name="image_position_y"
                                            value={formData.image_position_y}
                                            onChange={handleChange}
                                            min="-120"
                                            max="120"
                                            step="1"
                                            className="w-20 rounded border-white/20 bg-slate-900 px-2 py-1 text-right text-white"
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        name="image_position_y"
                                        value={formData.image_position_y}
                                        onChange={handleChange}
                                        min="-120"
                                        max="120"
                                        step="1"
                                        className="w-full accent-blue-500"
                                    />
                                </label>

                                <label className="block">
                                    <div className="mb-2 flex items-center justify-between gap-3 text-sm text-white">
                                        <span>Масштаб</span>
                                        <input
                                            type="number"
                                            name="image_zoom"
                                            value={formData.image_zoom}
                                            onChange={handleChange}
                                            min="0.4"
                                            max="2.5"
                                            step="0.01"
                                            className="w-20 rounded border-white/20 bg-slate-900 px-2 py-1 text-right text-white"
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        name="image_zoom"
                                        value={formData.image_zoom}
                                        onChange={handleChange}
                                        min="0.4"
                                        max="2.5"
                                        step="0.01"
                                        className="w-full accent-blue-500"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
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
                    <label className="block text-sm font-medium text-gray-700">
                        {specLabels.capacityLabel} ({specLabels.capacityUnit})
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700">
                        {specLabels.consumptionLabel} ({specLabels.consumptionUnit})
                    </label>
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

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 sm:w-auto"
                >
                    {loading ? 'Збереження...' : initialData ? 'Оновити' : 'Створити'}
                </button>
            </div>
        </form>
    );
};

export default CarForm; 
