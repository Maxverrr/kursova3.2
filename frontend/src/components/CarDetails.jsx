import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import ApiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import CarForm from './CarForm';
import PremiumBackground from './PremiumBackground';
import RentModal from './RentModal';
import {
    calculateRentalPrice,
    applyRentalStartTime,
    applyRentalEndTime,
    buildRentalOptionsPayload,
} from '../utils/rentalPricing';
import {
    formatCapacity,
    formatConsumption,
    getCarSpecLabels,
    withImageKitBackgroundRemoval,
} from '../utils/carDisplay';

const CarDetails = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const returnPage = searchParams.get('returnPage') || '1';
    const navigate = useNavigate();
    const { user } = useAuth();
    const [car, setCar] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRentModalOpen, setIsRentModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [rentDates, setRentDates] = useState({
        startDate: null,
        endDate: null
    });
    const [priceBreakdown, setPriceBreakdown] = useState(null);
    const [rentOptions, setRentOptions] = useState({
        delivery: false,
        deliveryKm: '',
        returnElsewhere: false,
        returnKm: '',
        childSeat: false,
        bikeRack: false,
        fullInsurance: false,
    });
    const [rentError, setRentError] = useState(null);
    const [existingRentals, setExistingRentals] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Отримуємо основні дані про автомобіль та відгуки (мають бути публічними)
                try {
                    const [carData, reviewsData] = await Promise.all([
                        ApiService.getCar(id),
                        ApiService.getCarReviews(id)
                    ]);
                    setCar(carData);
                    setReviews(reviewsData);
                } catch (err) {
                    console.error('Error fetching car data:', err);
                    setError(err.message || 'Помилка при завантаженні даних автомобіля');
                    return;
                }

                // Отримуємо дані про оренду, тільки якщо користувач автентифікований
                if (user) {
                    try {
                        const rentalsResponse = await ApiService.getCarRentals(id);
                        setExistingRentals(rentalsResponse.map(rental => ({
                            start: new Date(rental.start_date),
                            end: new Date(rental.end_date)
                        })));
                    } catch (err) {
                        console.error('Error fetching rentals:', err);
                        // Не встановлюємо стан помилки для невдалого запиту оренди
                        // Просто логуємо, оскільки це не критично для перегляду деталей авто
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, user]);

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

    const handleEdit = async (updatedCarData) => {
        try {
            setLoading(true);
            const updatedCar = await ApiService.updateCar(id, updatedCarData);
            setCar(updatedCar);
            setIsEditModalOpen(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Ви впевнені, що хочете видалити цей автомобіль?')) {
            try {
                await ApiService.deleteCar(id);
                navigate('/MainApp?page=1');
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const recalculatePrice = (start, end, options) => {
        if (!start || !end || !car) {
            setPriceBreakdown(null);
            return;
        }
        const pricing = calculateRentalPrice(car.price_per_day, start, end, options);
        setPriceBreakdown(pricing);
    };

    const resetRentForm = () => {
        setRentDates({ startDate: null, endDate: null });
        setRentOptions({
            delivery: false,
            deliveryKm: '',
            returnElsewhere: false,
            returnKm: '',
            childSeat: false,
            bikeRack: false,
            fullInsurance: false,
        });
        setPriceBreakdown(null);
        setRentError(null);
    };

    const handleRentOptionChange = (field, value) => {
        const nextOptions = { ...rentOptions, [field]: value };
        setRentOptions(nextOptions);
        recalculatePrice(rentDates.startDate, rentDates.endDate, nextOptions);
    };

    const handleRentDatesChange = (dates) => {
        const [start, end] = dates;
        setRentDates({
            startDate: start,
            endDate: end
        });
        recalculatePrice(start, end, rentOptions);
    };

    // Функція для перевірки, чи дата заблокована
    const isDateDisabled = (date) => {
        if (!existingRentals || !date) return false;
        return existingRentals.some(rental => {
            if (!rental.start || !rental.end) return false;
            const checkDate = date.getTime();
            return checkDate >= rental.start.getTime() && checkDate <= rental.end.getTime();
        });
    };

    // Кастомний рендеринг дня
    const renderDayContents = (day, date) => {
        const isDisabled = isDateDisabled(date);
        return (
            <div
                style={{
                    color: isDisabled ? 'red' : 'inherit',
                    textDecoration: isDisabled ? 'line-through' : 'none'
                }}
            >
                {day}
            </div>
        );
    };

    const handleRentSubmit = async (e) => {
        e.preventDefault();
        setRentError(null);

        if (!car || !user || !rentDates.startDate || !rentDates.endDate) {
            setRentError('Будь ласка, заповніть всі необхідні поля');
            return;
        }

        if (rentOptions.delivery && (!rentOptions.deliveryKm || Number(rentOptions.deliveryKm) <= 0)) {
            setRentError('Вкажіть відстань для доставки авто додому');
            return;
        }

        if (rentOptions.returnElsewhere && (!rentOptions.returnKm || Number(rentOptions.returnKm) <= 0)) {
            setRentError('Вкажіть відстань для повернення в іншому місці');
            return;
        }

        try {
            const startDateTime = applyRentalStartTime(rentDates.startDate);
            const endDateTime = applyRentalEndTime(rentDates.endDate);
            const pricing = calculateRentalPrice(
                car.price_per_day,
                rentDates.startDate,
                rentDates.endDate,
                rentOptions
            );
            const optionsPayload = buildRentalOptionsPayload(pricing, rentOptions);

            const availability = await ApiService.checkCarAvailability(
                id,
                startDateTime.toISOString(),
                endDateTime.toISOString()
            );

            if (!availability.available) {
                const overlappingDatesStr = availability.overlappingDates
                    .map(dates => `${formatDate(dates.start)} - ${formatDate(dates.end)}`)
                    .join(', ');
                setRentError(`Автомобіль вже орендовано на дати: ${overlappingDatesStr}. Будь ласка виберіть іншу дату.`);
                return;
            }

            const rentalData = {
                car_id: id,
                client_id: user.id,
                start_date: startDateTime.toISOString(),
                end_date: endDateTime.toISOString(),
                base_rental_price: pricing.basePrice,
                options: optionsPayload,
                total_price: pricing.totalPrice
            };

            await ApiService.createRental(rentalData);

            setIsRentModalOpen(false);
            resetRentForm();
            navigate('/my-rentals');
        } catch (err) {
            console.error('Rental submission error:', err);
            setRentError(err.message || 'Сталася помилка при оформленні оренди. Спробуйте ще раз.');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Ви впевнені, що хочете видалити цей відгук?')) return;
        try {
            await ApiService.deleteReview(reviewId);
            setReviews(reviews.filter(r => r._id !== reviewId));
        } catch (err) {
            alert(err.message || 'Помилка при видаленні відгуку');
        }
    };

    if (loading) return (
        <>
            <PremiumBackground variant="details" />
            <div className="min-h-screen flex items-center justify-center relative z-10">
                <div className="text-white text-xl">Завантаження...</div>
            </div>
        </>
    );

    if (error) return (
        <>
            <PremiumBackground variant="details" />
            <div className="min-h-screen flex items-center justify-center relative z-10">
                <div className="text-red-500 text-xl">Помилка: {error}</div>
            </div>
        </>
    );

    if (!car) return (
        <>
            <PremiumBackground variant="details" />
            <div className="min-h-screen flex items-center justify-center relative z-10">
                <div className="text-white text-xl">Автомобіль не знайдено</div>
            </div>
        </>
    );

    const specLabels = getCarSpecLabels(car);

    return (
        <>
            <PremiumBackground variant="details" />
            <div className="min-h-screen w-full relative">
            <div className="container mx-auto px-4 pt-[calc(var(--site-header-height)+1rem)] pb-4 relative z-10">
                <Link 
                    to={`/MainApp?page=${returnPage}`}
                    className="mb-5 inline-block rounded-full px-5 py-2 text-sm text-white transition-colors glass-btn sm:mb-8 sm:px-6 sm:text-base"
                >
                    ← Назад до списку
                </Link>

                <div className="glass-panel-strong overflow-hidden">
                    <div className="car-showroom-bg relative h-64 overflow-hidden sm:h-80 lg:h-96">
                        <img 
                            src={withImageKitBackgroundRemoval(car.photo) || '/placeholder-car.jpg'} 
                            alt={car.name}
                            className="relative z-[1] h-full w-full object-cover drop-shadow-[0_34px_45px_rgba(0,0,0,0.6)]"
                        />
                        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/75 via-transparent to-black/20" />
                        <h1 className="absolute bottom-5 left-4 right-4 z-[3] text-2xl font-bold leading-tight text-white sm:bottom-6 sm:left-6 sm:text-4xl">{car.name}</h1>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-4 sm:p-6 md:grid-cols-2 md:gap-8">
                        <div className="space-y-5 sm:space-y-6">
                            <div className="glass-section">
                                <h2 className="mb-4 text-xl font-bold text-white sm:text-2xl">Характеристики</h2>
                                <div className="space-y-3 text-gray-300">
                                    <p className="flex justify-between gap-4">
                                        <span>Потужність:</span>
                                        <span className="text-right font-semibold">{car.horsepower} к.с.</span>
                                    </p>
                                    <p className="flex justify-between gap-4">
                                        <span>{specLabels.capacityLabel}:</span>
                                        <span className="text-right font-semibold">{formatCapacity(car.engine_volume, car)}</span>
                                    </p>
                                    <p className="flex justify-between gap-4">
                                        <span>{specLabels.consumptionLabel}:</span>
                                        <span className="text-right font-semibold">{formatConsumption(car.fuel_consumption, car)}</span>
                                    </p>
                                    <p className="flex justify-between gap-4">
                                        <span>Тип палива:</span>
                                        <span className="text-right font-semibold">{car.fuel_type?.fuel_type}</span>
                                    </p>
                                    <p className="flex justify-between gap-4">
                                        <span>Тип кузова:</span>
                                        <span className="text-right font-semibold">{car.body_type?.type_name}</span>
                                    </p>
                                    <p className="flex justify-between gap-4">
                                        <span>Клас:</span>
                                        <span className="text-right font-semibold">{car.class?.class_name}</span>
                                    </p>
                                    <p className="flex justify-between gap-4">
                                        <span>Колір:</span>
                                        <span className="text-right font-semibold">{car.color}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="glass-section">
                                <h2 className="mb-4 text-xl font-bold text-white sm:text-2xl">Ціна</h2>
                                <p className="text-3xl font-bold text-blue-400 sm:text-4xl">{car.price_per_day}₴ <span className="text-base text-gray-400 sm:text-lg">/день</span></p>
                            </div>
                        </div>

                        <div className="space-y-5 sm:space-y-6">
                            <div className="glass-section">
                                <h2 className="mb-4 text-xl font-bold text-white sm:text-2xl">Статус</h2>
                                <span className={`px-4 py-2 rounded-full text-sm ${
                                    car.status?.status ? 'bg-green-800/80 text-green-200' : 'bg-red-800/80 text-red-200'
                                }`}>
                                    {car.status?.status ? 'Доступний' : 'Недоступний'}
                                </span>
                            </div>

                            {car.status?.status && (
                                <button 
                                    onClick={() => {
                                        if (!user) {
                                            setIsAuthModalOpen(true);
                                            return;
                                        }
                                        setIsRentModalOpen(true);
                                        resetRentForm();
                                    }}
                                    className="w-full rounded-lg px-6 py-3 text-base font-semibold text-white transition-colors glass-cta sm:text-lg"
                                >
                                    Орендувати
                                </button>
                            )}

                            {user?.role === 'admin' && (
                                <div className="mt-4 space-y-3">
                                    <button 
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="w-full rounded-lg bg-yellow-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-pink-500 sm:text-lg"
                                    >
                                        Редагувати
                                    </button>
                                    <button 
                                        onClick={handleDelete}
                                        className="w-full rounded-lg bg-red-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-red-700 sm:text-lg"
                                    >
                                        Видалити
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Секція відгуків */}
                    <div className="border-t glass-divider">
                        <div className="p-4 sm:p-6">
                            <h2 className="mb-6 text-xl font-bold text-white sm:text-2xl">Відгуки</h2>
                            
                            {/* Форма додавання відгуку */}
                            {user && (
                                <form 
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const comment = e.target.comment.value;
                                        if (!comment.trim()) return;
                                        
                                        try {
                                            const newReview = await ApiService.createReview(id, { comment });
                                            setReviews([newReview, ...reviews]);
                                            e.target.reset();
                                        } catch (err) {
                                            alert(err.message || 'Помилка при додаванні відгуку');
                                        }
                                    }}
                                    className="mb-8 glass-panel p-4"
                                >
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <textarea
                                            name="comment"
                                            placeholder="Напишіть свій відгук..."
                                            className="flex-1 glass-input text-white rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            className="px-6 py-3 glass-cta text-white rounded-lg transition-colors h-fit self-end"
                                        >
                                            Додати відгук
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-6">
                            {reviews.length === 0 ? (
                                <p className="text-gray-400">Поки що немає відгуків про цей автомобіль</p>
                            ) : (
                                    reviews.map(review => (
                                        <div key={review._id} className="glass-panel p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-white">
                                                        {review.client.first_name} {review.client.middle_name} {review.client.last_name}
                                                    </h3>
                                                    <p className="text-sm text-gray-400">{formatDate(review.review_date)}</p>
                                                </div>
                                                {(user && (user.role === 'admin' || user.id === review.client._id)) && (
                                                    <button
                                                        onClick={() => handleDeleteReview(review._id)}
                                                        className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                                                    >
                                                        Видалити
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-gray-300">{review.comment}</p>
                                        </div>
                                    ))
                                )}
                                </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальне вікно оренди */}
            {isRentModalOpen && (
                <RentModal
                    car={car}
                    rentDates={rentDates}
                    rentOptions={rentOptions}
                    priceBreakdown={priceBreakdown}
                    rentError={rentError}
                    existingRentals={existingRentals}
                    onClose={() => {
                        setIsRentModalOpen(false);
                        resetRentForm();
                    }}
                    onSubmit={handleRentSubmit}
                    onDatesChange={handleRentDatesChange}
                    onOptionChange={handleRentOptionChange}
                    renderDayContents={renderDayContents}
                />
            )}

            {/* Модальне вікно авторизації */}
            {isAuthModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="glass-panel-strong w-full max-w-md p-4 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Необхідна авторизація</h2>
                            <button
                                onClick={() => setIsAuthModalOpen(false)}
                                className="text-gray-400 hover:text-gray-200"
                            >
                                ×
                            </button>
                        </div>
                        <p className="text-gray-300 mb-6">
                            Щоб орендувати автомобіль, будь ласка, увійдіть до свого облікового запису.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsAuthModalOpen(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                            >
                                Закрити
                            </button>
                            <button
                                onClick={() => {
                                    setIsAuthModalOpen(false);
                                    navigate('/login');
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                            >
                                Увійти
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальне вікно редагування */}
            {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div className="glass-panel-strong z-50 mx-3 max-h-[90vh] w-full max-w-4xl overflow-y-auto sm:mx-4">
                        <div className="p-4 sm:p-6">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <h2 className="text-xl font-bold text-white sm:text-2xl">Редагувати автомобіль</h2>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-200 text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>
                            <CarForm 
                                onSubmit={handleEdit}
                                initialData={car}
                            />
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
};

export default CarDetails; 
