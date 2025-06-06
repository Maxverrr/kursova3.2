import { useState, useEffect } from 'react';
import ApiService from '../services/api';

const FilterForm = ({ onApplyFilters, onClose, initialFilters = {} }) => {
    const [referenceData, setReferenceData] = useState({
        bodyTypes: [],
        classes: [],
        fuelTypes: [],
    });
    const [filters, setFilters] = useState({
        minPrice: initialFilters.minPrice || '',
        maxPrice: initialFilters.maxPrice || '',
        minEngineVolume: initialFilters.minEngineVolume || '',
        maxEngineVolume: initialFilters.maxEngineVolume || '',
        minHorsepower: initialFilters.minHorsepower || '',
        maxHorsepower: initialFilters.maxHorsepower || '',
        bodyType: initialFilters.bodyType || '',
        class: initialFilters.class || '',
        fuelType: initialFilters.fuelType || '',
        color: initialFilters.color || '',
        available: initialFilters.available || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReferenceData = async () => {
            try {
                setLoading(true);
                const [bodyTypes, classes, fuelTypes] = await Promise.all([
                    ApiService.request('/body-types'),
                    ApiService.request('/classes'),
                    ApiService.request('/fuel-types')
                ]);
                setReferenceData({ bodyTypes, classes, fuelTypes });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReferenceData();
    }, []);

    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            ...initialFilters
        }));
    }, [initialFilters]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== '') {
                if (key === 'bodyType') {
                    const bodyType = referenceData.bodyTypes.find(t => t._id === value);
                    acc[key] = value;
                    acc[`${key}Name`] = bodyType?.type_name || value;
                } else if (key === 'class') {
                    const classType = referenceData.classes.find(c => c._id === value);
                    acc[key] = value;
                    acc[`${key}Name`] = classType?.class_name || value;
                } else if (key === 'fuelType') {
                    const fuelType = referenceData.fuelTypes.find(f => f._id === value);
                    acc[key] = value;
                    acc[`${key}Name`] = fuelType?.fuel_type || value;
                } else {
                    acc[key] = value;
                }
            }
            return acc;
        }, {});
        onApplyFilters(activeFilters);
        onClose();
    };

    const handleReset = () => {
        setFilters({
            minPrice: '',
            maxPrice: '',
            minEngineVolume: '',
            maxEngineVolume: '',
            minHorsepower: '',
            maxHorsepower: '',
            bodyType: '',
            class: '',
            fuelType: '',
            color: '',
            available: ''
        });
    };

    if (loading) return <div className="text-center py-4 text-white">Завантаження...</div>;
    if (error) return <div className="text-red-500 text-center py-4">Помилка: {error}</div>;

    const inputClassName = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    const labelClassName = "block text-sm font-medium text-gray-200";
    const selectClassName = "mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Range */}
                <div className="space-y-2">
                    <label className={labelClassName}>Ціна (₴/день)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            name="minPrice"
                            value={filters.minPrice}
                            onChange={handleChange}
                            placeholder="Від"
                            className={inputClassName}
                        />
                        <input
                            type="number"
                            name="maxPrice"
                            value={filters.maxPrice}
                            onChange={handleChange}
                            placeholder="До"
                            className={inputClassName}
                        />
                    </div>
                </div>

                {/* Engine Volume Range */}
                <div className="space-y-2">
                    <label className={labelClassName}>Об'єм двигуна (л)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            name="minEngineVolume"
                            value={filters.minEngineVolume}
                            onChange={handleChange}
                            placeholder="Від"
                            step="0.1"
                            className={inputClassName}
                        />
                        <input
                            type="number"
                            name="maxEngineVolume"
                            value={filters.maxEngineVolume}
                            onChange={handleChange}
                            placeholder="До"
                            step="0.1"
                            className={inputClassName}
                        />
                    </div>
                </div>

                {/* Horsepower Range */}
                <div className="space-y-2">
                    <label className={labelClassName}>Потужність (к.с.)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            name="minHorsepower"
                            value={filters.minHorsepower}
                            onChange={handleChange}
                            placeholder="Від"
                            className={inputClassName}
                        />
                        <input
                            type="number"
                            name="maxHorsepower"
                            value={filters.maxHorsepower}
                            onChange={handleChange}
                            placeholder="До"
                            className={inputClassName}
                        />
                    </div>
                </div>

                {/* Body Type */}
                <div>
                    <label className={labelClassName}>Тип кузова</label>
                    <select
                        name="bodyType"
                        value={filters.bodyType}
                        onChange={handleChange}
                        className={selectClassName}
                    >
                        <option value="">Будь-який</option>
                        {referenceData.bodyTypes.map(type => (
                            <option key={type._id} value={type._id}>{type.type_name}</option>
                        ))}
                    </select>
                </div>

                {/* Class */}
                <div>
                    <label className={labelClassName}>Клас</label>
                    <select
                        name="class"
                        value={filters.class}
                        onChange={handleChange}
                        className={selectClassName}
                    >
                        <option value="">Будь-який</option>
                        {referenceData.classes.map(cls => (
                            <option key={cls._id} value={cls._id}>{cls.class_name}</option>
                        ))}
                    </select>
                </div>

                {/* Fuel Type */}
                <div>
                    <label className={labelClassName}>Тип палива</label>
                    <select
                        name="fuelType"
                        value={filters.fuelType}
                        onChange={handleChange}
                        className={selectClassName}
                    >
                        <option value="">Будь-який</option>
                        {referenceData.fuelTypes.map(type => (
                            <option key={type._id} value={type._id}>{type.fuel_type}</option>
                        ))}
                    </select>
                </div>

                {/* Color */}
                <div>
                    <label className={labelClassName}>Колір</label>
                    <input
                        type="text"
                        name="color"
                        value={filters.color}
                        onChange={handleChange}
                        placeholder="Будь-який колір"
                        className={inputClassName}
                    />
                </div>

                {/* Availability */}
                <div>
                    <label className={labelClassName}>Доступність</label>
                    <select
                        name="available"
                        value={filters.available}
                        onChange={handleChange}
                        className={selectClassName}
                    >
                        <option value="">Будь-яка</option>
                        <option value="true">Доступний</option>
                        <option value="false">Недоступний</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                    Скинути
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Застосувати
                </button>
            </div>
        </form>
    );
};

export default FilterForm; 