import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import ApiService from '../services/api';
import CarForm from './CarForm';
import FilterForm from './FilterForm';
import {
    formatCardCapacity,
    formatCardConsumption,
    getCarSpecLabels,
    withImageKitBackgroundRemoval,
} from '../utils/carDisplay';
const CarList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [sortBy, setSortBy] = useState('name');
    const [order, setOrder] = useState('ASC');
    const { user } = useAuth();
    const [editingCar, setEditingCar] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

   
    useEffect(() => {
        const handleCarListUpdate = () => {
            console.log('Car list update event received');
            fetchCars();
        };

        window.addEventListener('carListUpdated', handleCarListUpdate);     
        return () => { window.removeEventListener('carListUpdated', handleCarListUpdate);};
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilter(searchTerm);
        }, 1000); 

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setSearchParams({ page: page.toString() });
    }, [page, setSearchParams]);

    const formatFilterValue = (key, value) => {
        if (key.endsWith('Name')) return null; 
        const specLabels = getCarSpecLabels(activeFilters.fuelTypeName || '');
        const displayKey = {
            minPrice: 'Ціна від',
            maxPrice: 'Ціна до',
            minEngineVolume: `${specLabels.capacityLabel} від`,
            maxEngineVolume: `${specLabels.capacityLabel} до`,
            minHorsepower: 'Потужність від',
            maxHorsepower: 'Потужність до',
            bodyType: 'Тип кузова',
            class: 'Клас',
            fuelType: 'Тип палива',
            color: 'Колір',
            available: 'Доступність'
        }[key];

        if (!displayKey) return null;

        let displayValue = value;
        if (key === 'bodyType') {
            displayValue = activeFilters.bodyTypeName || value;
        } else if (key === 'class') {
            displayValue = activeFilters.className || value;
        } else if (key === 'fuelType') {
            displayValue = activeFilters.fuelTypeName || value;
        } else if (key === 'available') {
            displayValue = value === 'true' ? 'Доступний' : 'Недоступний';
        } else if (key.startsWith('min') || key.startsWith('max')) {
            if (key.includes('Price')) {
                displayValue = `${value}₴`;
            } else if (key.includes('EngineVolume')) {
                displayValue = `${value} ${specLabels.capacityUnit}`;
            } else if (key.includes('Horsepower')) {
                displayValue = `${value} к.с.`;
            }
        }

        return `${displayKey}: ${displayValue}`;
    };

    const fetchCars = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await ApiService.getCars({
                page,
                filter,
                sortBy,
                order,
                ...activeFilters
            });
            setCars(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCars();
    }, [page, filter, sortBy, order, activeFilters]);

    const handleDelete = async (id) => {
        if (window.confirm('Ви впевнені, що хочете видалити цей автомобіль? Цю дію неможливо скасувати.')) {
            try {
                await ApiService.deleteCar(id);
                setCars(cars.filter(car => car._id !== id));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleEdit = (car) => {
        const formData = {
            ...car,
            body_type_id: car.body_type?._id,
            class_id: car.class?._id,
            fuel_type_id: car.fuel_type?._id,
            status_id: car.status?._id
        };
        setEditingCar(formData);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (updatedCarData) => {
        try {
            setLoading(true);
            await ApiService.updateCar(editingCar._id, updatedCarData);
            setIsEditModalOpen(false);
            setEditingCar(null);
            await fetchCars();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
        setPage(1);
    };

    const clearFilters = () => {
        setActiveFilters({});
        setFilter('');
        setPage(1);
    };

    if (loading) return <div className="text-center py-4 text-white">Завантаження...</div>;
    if (error) return <div className="text-red-500 text-center py-4">Помилка: {error}</div>;

    return (
        <>
            <div className="relative z-10 space-y-5 p-0 text-white sm:space-y-6 sm:p-4">
            <div className="flex flex-col gap-4">
                {/* Топ оренд місяця */}
            <div className="mb-4 glass-panel p-4 sm:mb-8 sm:p-6">
                <h2 className="mb-4 text-center text-xl font-bold text-white sm:text-2xl">Топ оренди місяця</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-6">
                     <div className="relative group rounded-lg overflow-hidden glass-card-frame">
                        <Link to="/cars/683ed7492979b884fda5ed4d">
                            <img src="/img/topaudi.JPEG" alt="Audi RS6" className="w-full h-auto" />
                        </Link>
                        <div className="absolute inset-x-0 bottom-0 flex h-[28%] items-center justify-center bg-gradient-to-t from-black/90 to-black/100 transition-all duration-300 sm:h-0 sm:group-hover:h-[22%]">
                            <Link
                            to="/cars/683ed7492979b884fda5ed4d"
                            className="rounded-full bg-orange-900 px-5 py-2 text-sm font-medium text-white opacity-100 transition-opacity duration-300 delay-150 sm:opacity-0 sm:group-hover:opacity-100"
                            >
                            Орендувати
                            </Link>
                        </div>
                        </div>


                     <div className="relative group rounded-lg overflow-hidden glass-card-frame">
                        <Link to="/cars/683ed7492979b884fda5ed51">
                            <img src="/img/topbmw.JPEG" alt="BMW M5"/>
                        </Link>
                        <div className="absolute inset-x-0 bottom-0 flex h-[28%] items-center justify-center bg-gradient-to-t from-black/90 to-black/100 transition-all duration-300 sm:h-0 sm:group-hover:h-[22%]">
                            <Link
                            to="/cars/683ed7492979b884fda5ed51"
                            className="rounded-full bg-orange-900 px-5 py-2 text-sm font-medium text-white opacity-100 transition-opacity duration-300 delay-150 sm:opacity-0 sm:group-hover:opacity-100"
                            >
                            Орендувати
                            </Link>
                        </div>
                        </div>   
                        
                    <div className="relative group rounded-lg overflow-hidden glass-card-frame">
                        <Link to="/cars/683ee2745bdbcc2301360100">
                            <img src="/img/topmerc.JPEG" alt="Mercedes-Benz C63"/>
                        </Link>
                        <div className="absolute inset-x-0 bottom-0 flex h-[28%] items-center justify-center bg-gradient-to-t from-black/90 to-black/100 transition-all duration-300 sm:h-0 sm:group-hover:h-[22%]">
                            <Link
                            to="/cars/683ee2745bdbcc2301360100"
                            className="rounded-full bg-orange-900 px-5 py-2 text-sm font-medium text-white opacity-100 transition-opacity duration-300 delay-150 sm:opacity-0 sm:group-hover:opacity-100"
                            >
                            Орендувати
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            
                {/* Пошук та сортування */}
                <div className="glass-panel flex flex-col items-stretch gap-4 p-4 sm:p-5 lg:flex-row lg:items-center">
                    <input
                        type="text"
                        placeholder="Пошук автомобілів..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-2 glass-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                    <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:gap-4">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="min-w-0 rounded-lg bg-gray-900/95 px-3 py-2 text-white glass-input focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-4"
                        >    
                            <option className="bg-gray-900 text-white" value="name">За назвою</option>
                            <option className="bg-gray-900 text-white" value="price_per_day">За ціною</option>
                            <option className="bg-gray-900 text-white" value="fuel_consumption">За витратою</option>
                            <option className="bg-gray-900 text-white" value="horsepower">За потужністю</option>
                        </select>
                        <button
                            onClick={() => setOrder(order === 'ASC' ? 'DESC' : 'ASC')}
                            className="rounded-lg px-4 py-2 text-white transition-colors glass-btn"
                        >
                            {order === 'ASC' ? '↑' : '↓'}
                        </button>
                        <button
                            onClick={() => setIsFilterModalOpen(true)}
                            className="col-span-2 rounded-lg px-4 py-2 text-white transition-colors glass-btn sm:col-span-1 whitespace-nowrap"
                        >
                            Розширений пошук
                        </button>
                    </div>
                </div>

                {/* Активні фільтрів */}
                {Object.keys(activeFilters).length > 0 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm">
                        <span className="font-medium whitespace-nowrap">Активні фільтри:</span>
                        <div className="flex flex-wrap gap-2 flex-1">
                            {Object.entries(activeFilters).map(([key, value]) => {
                                const formattedFilter = formatFilterValue(key, value);
                                if (!formattedFilter) return null;
                                return (
                                    <span
                                        key={key}
                                        className="px-2 py-1 glass-chip text-white rounded-full"
                                    >
                                        {formattedFilter}
                                    </span>
                                );
                            })}
                            <button
                                onClick={clearFilters}
                                className="px-2 py-1 text-red-400 hover:text-red-300"
                            >
                                Очистити все
                            </button>
                        </div>
                    </div>
                )}
            </div>

            

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {cars.map(car => {
                    const specLabels = getCarSpecLabels(car);
                    return (
                    <div key={car._id} className="relative w-full aspect-[16/10.2] rounded-xl glass-card-frame overflow-hidden group sm:aspect-[16/9.924]">
                        <div className="car-showroom-bg absolute inset-0" />
                        <img
                            src={withImageKitBackgroundRemoval(car.photo) || '/placeholder-car.jpg'}
                            alt={car.name}
                            className="absolute inset-0 z-[1] h-full w-full object-cover drop-shadow-[0_24px_30px_rgba(0,0,0,0.55)] transition duration-300 group-hover:scale-[1.03]"
                        />

                        {/* Індикатор класу */}
                        <div className="absolute inset-0 z-[2]">
                            <img 
                                src={`/img/class_${car.class?.class_name.toLowerCase()}.png`}
                                alt={car.class?.class_name}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Тінь справа */}
                        <div className="absolute top-0 right-0 z-[2] h-full w-[24%] bg-black/55 sm:w-[23.2%] sm:bg-black/50" />
                        
                        {/* Тінь зверху */}
                        <div className="absolute top-0 left-0 right-0 z-[2] h-[17.5%] bg-black/50" />

                        {/* Вміст */}
                        <div className="relative z-[3] h-full p-[3%] flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-x-3">
                                    <img 
                                        src={`/img/brands/${car.name.split(' ')[0].toLowerCase()}.png`} 
                                        alt={`${car.name.split(' ')[0]} logo`}
                                        className="h-5 w-auto sm:h-[min(2.5vw,1.9rem)]"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                    <h3 className="max-w-[11rem] truncate text-[clamp(0.95rem,4.4vw,1.35rem)] font-bold leading-tight text-white sm:max-w-none sm:text-[min(2.2vw,1.9rem)]">{car.name}</h3>
                                </div>
                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] sm:px-[2.5%] sm:py-[0.7%] sm:text-[min(1vw,0.9rem)] ${
                                    car.status?.status ? 'bg-green-800/80 text-green-200' : 'bg-red-800/80 text-red-200'
                                }`}>
                                    {car.status?.status ? 'Доступний' : 'Недоступний'}
                                </span>
                            </div>

                            {/* Характеристики авто */}
                            <div className="flex justify-end">
                                <div className="space-y-[0.01%]">
                                    <div className="text-right">
                                        <p className="text-[clamp(1rem,4.8vw,1.45rem)] font-bold leading-none text-white sm:text-[min(3vw,2.2rem)]">{car.horsepower}</p>
                                        <p className="text-[clamp(0.55rem,2.5vw,0.72rem)] leading-tight text-white opacity-80 sm:text-[min(1vw,0.9rem)]">к.с.</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[clamp(0.95rem,4.4vw,1.35rem)] leading-none text-white sm:text-[min(3vw,2.1rem)]">{formatCardCapacity(car.engine_volume, car)}</p>
                                        <p className="max-w-[6.5rem] text-[clamp(0.52rem,2.2vw,0.68rem)] leading-tight text-white opacity-80 sm:max-w-none sm:text-[min(1vw,0.9rem)]">{specLabels.capacityLabel}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[clamp(0.95rem,4.4vw,1.35rem)] leading-none text-white sm:text-[min(3vw,2.1rem)]">{formatCardConsumption(car.fuel_consumption)}</p>
                                        <p className="max-w-[6.5rem] text-[clamp(0.52rem,2.2vw,0.68rem)] leading-tight text-white opacity-80 sm:max-w-none sm:text-[min(1vw,0.9rem)]">{specLabels.consumptionLabel}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[clamp(0.95rem,4.4vw,1.35rem)] font-bold leading-none text-white sm:text-[min(3vw,2.1rem)]">{car.price_per_day}₴</p>
                                        <p className="text-[clamp(0.52rem,2.2vw,0.68rem)] leading-tight text-white opacity-80 sm:text-[min(1vw,0.9rem)]">/день</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Анімація*/}
                        <div className="absolute inset-x-0 bottom-0 z-[4] flex h-[20%] items-center justify-center bg-gradient-to-t from-black/90 to-black/70 transition-all duration-300 ease-out sm:h-0 sm:group-hover:h-[22%]">
                            <Link 
                                to={`/cars/${car._id}?returnPage=${page}`}
                                className="rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white opacity-100 transition-opacity duration-300 delay-150 hover:bg-blue-700 sm:px-[3%] sm:py-[1%] sm:text-[min(1.2vw,0.875rem)] sm:opacity-0 sm:group-hover:opacity-100"
                            >       
                                Детальніше
                            </Link>
                        </div>
                    </div>
                    );
                })}
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-full sm:w-auto px-4 py-2 glass-btn text-white rounded disabled:opacity-40"
                >
                    Попередня
                </button>
                <span className="py-2 px-4 glass-chip rounded text-white font-semibold">Сторінка {page}</span>
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={cars.length < 6}
                    className="w-full sm:w-auto px-4 py-2 glass-btn text-white rounded disabled:opacity-40"
                >
                    Наступна
                </button>
            </div>

            {/* Модальне вікно редагування */}
            {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div className="glass-panel-strong z-50 mx-3 max-h-[90vh] w-full max-w-4xl overflow-y-auto sm:mx-4">
                        <div className="p-4 sm:p-6">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <h2 className="text-xl font-bold text-white sm:text-2xl">Редагувати автомобіль</h2>
                                <button
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingCar(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-200 text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>
                            <CarForm 
                                onSubmit={handleUpdate}
                                initialData={editingCar}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Модальне вікно фільтра */}
            {isFilterModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div className="glass-panel-strong z-50 mx-3 max-h-[90vh] w-full max-w-4xl overflow-y-auto sm:mx-4">
                        <div className="p-4 sm:p-6">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <h2 className="text-xl font-bold text-white sm:text-2xl">Розширений пошук</h2>
                                <button
                                    onClick={() => setIsFilterModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-200 text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>
                            <FilterForm 
                                onApplyFilters={handleApplyFilters}
                                onClose={() => setIsFilterModalOpen(false)}
                                initialFilters={activeFilters}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default CarList; 
