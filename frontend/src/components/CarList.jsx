import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import ApiService from '../services/api';
import CarForm from './CarForm';
import FilterForm from './FilterForm';

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
        const displayKey = {
            minPrice: 'Ціна від',
            maxPrice: 'Ціна до',
            minEngineVolume: "Об'єм двигуна від",
            maxEngineVolume: "Об'єм двигуна до",
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
                displayValue = `${value}л`;
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
        
        <div className="space-y-6 text-white p-4">
            <div className="flex flex-col gap-4">
                {/* Top rentals of the month section */}
            <div className="mb-8">
                <h2 className="text-2xl text-center font-bold text-white mb-4">Топ оренди місяця</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="relative group rounded-lg overflow-hidden bg-gray-700">
                        <Link to="/cars/683ed7492979b884fda5ed4d">
                            <img src="/img/topaudi.JPEG" alt="Audi RS6" className="w-full h-auto" />
                        </Link>
                        <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-14 bg-gradient-to-t from-black/90 to-black/70 transition-all duration-300 flex items-center justify-center">
                            <Link
                            to="/cars/683ed7492979b884fda5ed4d"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 px-6 py-2 bg-orange-900 rounded-full text-white font-medium"
                            >
                            Орендувати
                            </Link>
                        </div>
                        </div>


                     <div className="relative group rounded-lg overflow-hidden bg-gray-700">
                        <Link to="/cars/683ed7492979b884fda5ed51">
                            <img src="/img/topbmw.JPEG" alt="BMW M5"/>
                        </Link>
                        <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-14 bg-gradient-to-t from-black/90 to-black/70 transition-all duration-300 flex items-center justify-center">
                            <Link
                            to="/cars/683ed7492979b884fda5ed51"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 px-6 py-2 bg-orange-900 rounded-full text-white font-medium"
                            >
                            Орендувати
                            </Link>
                        </div>
                        </div>   
                        
                    <div className="relative group rounded-lg overflow-hidden bg-gray-700">
                        <Link to="/cars/683ee2745bdbcc2301360100">
                            <img src="/img/topmerc.JPEG" alt="Mercedes-Benz C63"/>
                        </Link>
                        <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-14 bg-gradient-to-t from-black/90 to-black/70 transition-all duration-300 flex items-center justify-center">
                            <Link
                            to="/cars/683ee2745bdbcc2301360100"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 px-6 py-2 bg-orange-900 rounded-full text-white font-medium"
                            >
                            Орендувати
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            
                {/* Search and Sort Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                    <input
                        type="text"
                        placeholder="Пошук автомобілів..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    />
                    <div className="flex gap-2 sm:gap-4">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                        >    
                            <option value="name">За назвою</option>
                            <option value="price_per_day">За ціною</option>
                            <option value="engine_volume">За об'ємом двигуна</option>
                            <option value="horsepower">За потужністю</option>
                        </select>
                        <button
                            onClick={() => setOrder(order === 'ASC' ? 'DESC' : 'ASC')}
                            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            {order === 'ASC' ? '↑' : '↓'}
                        </button>
                        <button
                            onClick={() => setIsFilterModalOpen(true)}
                            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap"
                        >
                            Розширений пошук
                        </button>
                    </div>
                </div>

                {/* Active Filters Display */}
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
                                        className="px-2 py-1 bg-gray-700 text-white rounded-full"
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

            

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cars.map(car => (
                    <div key={car._id} className="relative w-full aspect-[16/9.924] rounded-lg shadow-lg overflow-hidden group">
                        {/* Background Image */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ 
                                backgroundImage: `url(${car.photo || '/placeholder-car.jpg'})`,
                            }}
                        />

                        {/* Class Indicator */}
                        <div className="absolute inset-0">
                            <img 
                                src={`/img/class_${car.class?.class_name.toLowerCase()}.png`}
                                alt={car.class?.class_name}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Dark Overlay - Right */}
                        <div className="absolute top-0 right-0 h-full bg-black/50 w-[23.2%]" />
                        
                        {/* Dark Overlay - Top */}
                        <div className="absolute top-0 left-0 right-0 h-[17.5%] bg-black/50" />

                        {/* Content */}
                        <div className="relative h-full p-[3%] flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <h3 className="text-[min(2.2vw,1.9rem)] font-bold text-white">{car.name}</h3>
                                <span className={`px-[2.5%] py-[0.7%] rounded-full text-[min(1vw,0.9rem)] ${
                                    car.status?.status ? 'bg-green-800/80 text-green-200' : 'bg-red-800/80 text-red-200'
                                }`}>
                                    {car.status?.status ? 'Доступний' : 'Недоступний'}
                                </span>
                            </div>

                            {/* Car Specs */}
                            <div className="flex justify-end">
                                <div className="space-y-[0.01%]">
                                    <div className="text-right">
                                        <p className="text-[min(3vw,2.2rem)] font-bold text-white">{car.horsepower}</p>
                                        <p className="text-[min(1vw,0.9rem)] text-white opacity-80">к.с.</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[min(3vw,2.1rem)] text-white">{Number(car.engine_volume).toFixed(1)}</p>
                                        <p className="text-[min(1vw,0.9rem)] text-white opacity-80">Об'єм двигуна</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[min(3vw,2.1rem)] text-white">{car.fuel_consumption}</p>
                                        <p className="text-[min(1vw,0.9rem)] text-white opacity-80">Розхід палива</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[min(3vw,2.1rem)] font-bold text-white">{car.price_per_day}₴</p>
                                        <p className="text-[min(1vw,0.9rem)] text-white opacity-80">/день</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hover Animation Stripe with Details Link */}
                        <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-[22%] bg-gradient-to-t from-black/90 to-black/70 transition-all duration-300 ease-out flex items-center justify-center">
                            <Link 
                                to={`/cars/${car._id}?returnPage=${page}`}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 px-[3%] py-[1%] bg-blue-600 hover:bg-blue-700 rounded-full text-white text-[min(1.2vw,0.875rem)] font-medium"
                            >       
                                Детальніше
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-700 text-white rounded disabled:bg-gray-800 disabled:text-gray-500"
                >
                    Попередня
                </button>
                <span className="py-2">Сторінка {page}</span>
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={cars.length < 6}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-700 text-white rounded disabled:bg-gray-800 disabled:text-gray-500"
                >
                    Наступна
                </button>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div className="bg-gray-800 rounded-lg w-full max-w-4xl mx-4 z-50">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-white">Редагувати автомобіль</h2>
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

            {/* Filter Modal */}
            {isFilterModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div className="bg-gray-800 rounded-lg w-full max-w-4xl mx-4 z-50">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-white">Розширений пошук</h2>
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
    );
};

export default CarList; 