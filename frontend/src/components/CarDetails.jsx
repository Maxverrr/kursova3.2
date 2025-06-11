import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import ApiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import CarForm from './CarForm';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { uk } from 'date-fns/locale';

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
    const [totalPrice, setTotalPrice] = useState(0);
    const [rentError, setRentError] = useState(null);
    const [existingRentals, setExistingRentals] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch basic car data and reviews (these should be public)
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

                // Only fetch rentals if user is authenticated
                if (user) {
                    try {
                        const rentalsResponse = await ApiService.getRentals();
                        const carRentals = rentalsResponse.filter(rental => 
                            rental.car_id && rental.car_id._id === id
                        );
                        setExistingRentals(carRentals.map(rental => ({
                            start: new Date(rental.start_date),
                            end: new Date(rental.end_date)
                        })));
                    } catch (err) {
                        console.error('Error fetching rentals:', err);
                        // Don't set error state for rentals fetch failure
                        // Just log it since it's not critical for viewing car details
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

    const handleRentDatesChange = (dates) => {
        const [start, end] = dates;
        setRentDates({
            startDate: start,
            endDate: end
        });

        if (start && end && car) {
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            if (days > 0) {
                setTotalPrice(days * car.price_per_day);
            }
        } else {
            setTotalPrice(0);
        }
    };

    // Function to check if a date is disabled
    const isDateDisabled = (date) => {
        if (!existingRentals || !date) return false;
        return existingRentals.some(rental => {
            if (!rental.start || !rental.end) return false;
            const checkDate = date.getTime();
            return checkDate >= rental.start.getTime() && checkDate <= rental.end.getTime();
        });
    };

    // Custom day rendering
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

        try {
            // Convert dates to ISO format with timezone
            const startDateTime = new Date(rentDates.startDate);
            const endDateTime = new Date(rentDates.endDate);
            
            console.log('Submitting rental with dates:', {
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
                originalStartDate: rentDates.startDate,
                originalEndDate: rentDates.endDate
            });

            // Check availability
            const availability = await ApiService.checkCarAvailability(
                id,
                startDateTime.toISOString(),
                endDateTime.toISOString()
            );

            console.log('Availability response:', availability);

            if (!availability.available) {
                // Format overlapping dates message
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
                total_price: totalPrice
            };

            console.log('Creating rental with data:', rentalData);

            // Create rental with proper date format
            const response = await ApiService.createRental(rentalData);
            
            console.log('Rental creation response:', response);

            // Close modal and show success message
            setIsRentModalOpen(false);
            alert('Оренду успішно оформлено!');
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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
            <div className="text-white text-xl">Завантаження...</div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
            <div className="text-red-500 text-xl">Помилка: {error}</div>
        </div>
    );

    if (!car) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
            <div className="text-white text-xl">Автомобіль не знайдено</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
            <div className="container mx-auto px-4 pt-24 pb-8">
                <Link 
                    to={`/MainApp?page=${returnPage}`}
                    className="inline-block mb-8 px-6 py-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"
                >
                    ← Назад до списку
                </Link>

                <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    <div className="relative h-96">
                        <img 
                            src={car.photo || '/placeholder-car.jpg'} 
                            alt={car.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <h1 className="absolute bottom-6 left-6 text-4xl font-bold text-white">{car.name}</h1>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">Характеристики</h2>
                                <div className="space-y-3 text-gray-300">
                                    <p className="flex justify-between">
                                        <span>Потужність:</span>
                                        <span className="font-semibold">{car.horsepower} к.с.</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Об'єм двигуна:</span>
                                        <span className="font-semibold">{car.engine_volume}л</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Розхід палива:</span>
                                        <span className="font-semibold">{car.fuel_consumption}л/100км</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Тип палива:</span>
                                        <span className="font-semibold">{car.fuel_type?.fuel_type}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Тип кузова:</span>
                                        <span className="font-semibold">{car.body_type?.type_name}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Клас:</span>
                                        <span className="font-semibold">{car.class?.class_name}</span>
                                    </p>
                                    <p className="flex justify-between">
                                        <span>Колір:</span>
                                        <span className="font-semibold">{car.color}</span>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">Ціна</h2>
                                <p className="text-4xl font-bold text-blue-400">{car.price_per_day}₴ <span className="text-lg text-gray-400">/день</span></p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">Статус</h2>
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
                                    }}
                                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
                                >
                                    Орендувати
                                </button>
                            )}

                            {user?.role === 'admin' && (
                                <div className="space-y-3 mt-4">
                                    <button 
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-pink-500 transition-colors text-lg font-semibold"
                                    >
                                        Редагувати
                                    </button>
                                    <button 
                                        onClick={handleDelete}
                                        className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-lg font-semibold"
                                    >
                                        Видалити
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="border-t border-gray-700">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">Відгуки</h2>
                            
                            {/* Add Review Form */}
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
                                    className="mb-8 bg-gray-700/30 p-4 rounded-lg"
                                >
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <textarea
                                            name="comment"
                                            placeholder="Напишіть свій відгук..."
                                            className="flex-1 bg-gray-700 text-white rounded-lg p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                        <button
                                            type="submit"
                                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-fit self-end"
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
                                        <div key={review._id} className="bg-gray-700/50 rounded-lg p-4">
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

            {/* Rent Modal */}
            {isRentModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg w-full max-w-md">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white">Оформлення оренди</h2>
                                <button
                                    onClick={() => setIsRentModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-200"
                                >
                                    ×
                                </button>
                            </div>

                            {rentError && (
                                <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded">
                                    {rentError}
                                </div>
                            )}

                            <form onSubmit={handleRentSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Оберіть дати оренди
                                    </label>
                                    <DatePicker
                                        selected={rentDates.startDate}
                                        onChange={handleRentDatesChange}
                                        startDate={rentDates.startDate}
                                        endDate={rentDates.endDate}
                                        selectsRange
                                        inline
                                        minDate={new Date()}
                                        locale={uk}
                                        dateFormat="dd.MM.yyyy"
                                        renderDayContents={renderDayContents}
                                        excludeDates={existingRentals.flatMap(rental => {
                                            const dates = [];
                                            let currentDate = new Date(rental.start);
                                            while (currentDate <= rental.end) {
                                                dates.push(new Date(currentDate));
                                                currentDate.setDate(currentDate.getDate() + 1);
                                            }
                                            return dates;
                                        })}
                                        className="w-full bg-gray-700 text-white rounded-lg"
                                    />
                                </div>

                                {totalPrice > 0 && (
                                    <div className="bg-gray-700/50 p-4 rounded">
                                        <h3 className="text-lg font-semibold text-white mb-2">
                                            Підсумок замовлення
                                        </h3>
                                        <div className="space-y-2 text-gray-300">
                                            <div className="flex justify-between">
                                                <span>Ціна за день:</span>
                                                <span>{car.price_per_day}₴</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Кількість днів:</span>
                                                <span>
                                                    {Math.ceil(
                                                        (rentDates.endDate - rentDates.startDate) /
                                                        (1000 * 60 * 60 * 24)
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between font-semibold text-white border-t border-gray-600 pt-2 mt-2">
                                                <span>Загальна сума:</span>
                                                <span>{totalPrice}₴</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsRentModalOpen(false)}
                                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                                    >
                                        Скасувати
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!rentDates.startDate || !rentDates.endDate}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                    >
                                        Підтвердити оренду
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Auth Modal */}
            {isAuthModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg w-full max-w-md p-6">
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

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-50"></div>
                    <div className="bg-gray-800 rounded-lg w-full max-w-4xl mx-4 z-50 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-white">Редагувати автомобіль</h2>
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
    );
};

export default CarDetails; 