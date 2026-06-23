import { useState, useEffect, useRef } from 'react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import ApiService from '../services/api';
import { getCarSpecLabels } from '../utils/carDisplay';

const getBrandLogoPath = (brand) => (
    `/img/brands/${brand.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.png`
);

const FilterForm = ({ onApplyFilters, onClose, initialFilters = {} }) => {
    const [referenceData, setReferenceData] = useState({
        bodyTypes: [],
        classes: [],
        fuelTypes: [],
        brands: [],
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
        brand: initialFilters.brand || '',
        color: initialFilters.color || '',
        available: initialFilters.available || ''
    });
    const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
    const brandMenuRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReferenceData = async () => {
            try {
                setLoading(true);
                const [bodyTypes, classes, fuelTypes, brands] = await Promise.all([
                    ApiService.request('/body-types'),
                    ApiService.request('/classes'),
                    ApiService.request('/fuel-types'),
                    ApiService.getCarBrands()
                ]);
                setReferenceData({ bodyTypes, classes, fuelTypes, brands });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReferenceData();
    }, []);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (brandMenuRef.current && !brandMenuRef.current.contains(event.target)) {
                setIsBrandMenuOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
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
            brand: '',
            color: '',
            available: ''
        });
    };

    if (loading) return <div className="text-center py-4 text-white">Завантаження...</div>;
    if (error) return <div className="text-red-500 text-center py-4">Помилка: {error}</div>;

    const inputClassName = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    const labelClassName = "block text-sm font-medium text-gray-200";
    const selectClassName = "mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500";
    const selectedFuelType = referenceData.fuelTypes.find(type => type._id === filters.fuelType);
    const specLabels = getCarSpecLabels(selectedFuelType?.fuel_type || '');

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-white">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
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

                {/* Brand */}
                <div ref={brandMenuRef} className="relative">
                    <label className={labelClassName}>Марка</label>
                    <button
                        type="button"
                        onClick={() => setIsBrandMenuOpen(open => !open)}
                        aria-haspopup="listbox"
                        aria-expanded={isBrandMenuOpen}
                        className={`${selectClassName} flex items-center justify-between gap-3 text-left`}
                    >
                        <span className="flex min-w-0 items-center gap-3">
                            {filters.brand && (
                                <img
                                    src={getBrandLogoPath(filters.brand)}
                                    alt=""
                                    className="h-6 w-8 shrink-0 object-contain"
                                    onLoad={(event) => { event.currentTarget.style.visibility = 'visible'; }}
                                    onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }}
                                />
                            )}
                            <span className="truncate">{filters.brand || 'Будь-яка марка'}</span>
                        </span>
                        <FiChevronDown
                            aria-hidden="true"
                            className={`shrink-0 transition-transform ${isBrandMenuOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {isBrandMenuOpen && (
                        <div
                            role="listbox"
                            aria-label="Марка автомобіля"
                            className="absolute inset-x-0 z-30 mt-2 max-h-64 overflow-y-auto rounded-md border border-gray-600 bg-gray-800 p-1 shadow-2xl"
                        >
                            <button
                                type="button"
                                role="option"
                                aria-selected={!filters.brand}
                                onClick={() => {
                                    setFilters(prev => ({ ...prev, brand: '' }));
                                    setIsBrandMenuOpen(false);
                                }}
                                className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm text-gray-100 hover:bg-gray-700"
                            >
                                <span>Будь-яка марка</span>
                                {!filters.brand && <FiCheck aria-hidden="true" />}
                            </button>
                            {referenceData.brands.map(brand => (
                                <button
                                    key={brand}
                                    type="button"
                                    role="option"
                                    aria-selected={filters.brand === brand}
                                    onClick={() => {
                                        setFilters(prev => ({ ...prev, brand }));
                                        setIsBrandMenuOpen(false);
                                    }}
                                    className="flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-sm text-gray-100 hover:bg-gray-700"
                                >
                                    <span className="flex min-w-0 items-center gap-3">
                                        <img
                                            src={getBrandLogoPath(brand)}
                                            alt=""
                                            loading="lazy"
                                            className="h-7 w-9 shrink-0 object-contain"
                                            onLoad={(event) => { event.currentTarget.style.visibility = 'visible'; }}
                                            onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }}
                                        />
                                        <span className="truncate">{brand}</span>
                                    </span>
                                    {filters.brand === brand && <FiCheck aria-hidden="true" className="shrink-0" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Engine Volume Range */}
                <div className="space-y-2">
                    <label className={labelClassName}>
                        {specLabels.capacityLabel} ({specLabels.capacityUnit})
                    </label>
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

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
                <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-md bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                >
                    Скинути
                </button>
                <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                    Застосувати
                </button>
            </div>
        </form>
    );
};

export default FilterForm; 
