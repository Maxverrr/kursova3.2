import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../services/api';
import AppPageLayout, {
  pagePanelClass,
  pageTableHeadClass,
  pageTableCellClass,
  pageInputClass,
  pageModalOverlayClass,
  pageModalClass,
} from './AppPageLayout';

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
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'Помилка формату дати';
  }
};

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
      setLoading(true);
      setError(null);
      const data = await ApiService.getRentals();
      setRentals(data);
    } catch (err) {
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
    if (!window.confirm('Ви впевнені, що хочете видалити це замовлення?')) return;
    try {
      await ApiService.deleteRental(rentalId);
      await fetchRentals();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <AppPageLayout title="Замовлення">
        <p className="text-center text-white/70">Завантаження...</p>
      </AppPageLayout>
    );
  }

  if (error) {
    return (
      <AppPageLayout title="Замовлення">
        <p className="text-center text-red-400">Помилка: {error}</p>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout
      title="Замовлення"
      subtitle="Усі оренди клієнтів. Редагування та видалення доступні адміністратору."
      headerExtra={
        <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium">
          Всього: {rentals.length}
        </span>
      }
    >
      <div className={pagePanelClass}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className={pageTableHeadClass}>
              <tr>
                <th className={`${pageTableCellClass} text-left`}>Автомобіль</th>
                <th className={`${pageTableCellClass} text-left`}>Клієнт</th>
                <th className={`${pageTableCellClass} text-left`}>Початок</th>
                <th className={`${pageTableCellClass} text-left`}>Кінець</th>
                <th className={`${pageTableCellClass} text-left`}>Сума</th>
                <th className={`${pageTableCellClass} text-left`}>Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rentals.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`${pageTableCellClass} text-center text-white/50`}>
                    Замовлень поки немає
                  </td>
                </tr>
              ) : (
                rentals.map((rental) => (
                  <tr key={rental._id} className="transition hover:bg-white/5">
                    <td className={pageTableCellClass}>
                      {rental.car_id?._id ? (
                        <Link
                          to={`/cars/${rental.car_id._id}`}
                          className="font-medium text-blue-400 hover:text-blue-300"
                        >
                          {rental.car_id?.name}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className={pageTableCellClass}>
                      {rental.client_id ? (
                        <div>
                          <div>{rental.client_id.email}</div>
                          <div className="text-xs text-white/45">
                            {rental.client_id.last_name} {rental.client_id.first_name}
                          </div>
                        </div>
                      ) : (
                        'Невідомо'
                      )}
                    </td>
                    <td className={pageTableCellClass}>{formatDate(rental.start_date)}</td>
                    <td className={pageTableCellClass}>{formatDate(rental.end_date)}</td>
                    <td className={`${pageTableCellClass} font-semibold`}>{rental.total_price} ₴</td>
                    <td className={pageTableCellClass}>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setEditingRental(rental)}
                          className="text-amber-400 hover:text-amber-300"
                        >
                          Редагувати
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(rental._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Видалити
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingRental && (
        <div className={pageModalOverlayClass}>
          <div className={pageModalClass}>
            <h2 className="mb-4 text-xl font-bold">Редагувати замовлення</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEdit(editingRental._id, {
                  start_date: e.target.start_date.value,
                  end_date: e.target.end_date.value,
                  total_price: parseFloat(e.target.total_price.value),
                });
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/70">Дата початку</label>
                  <input
                    type="datetime-local"
                    name="start_date"
                    defaultValue={
                      editingRental.start_date
                        ? new Date(editingRental.start_date).toISOString().slice(0, 16)
                        : ''
                    }
                    className={pageInputClass}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">Дата закінчення</label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    defaultValue={
                      editingRental.end_date
                        ? new Date(editingRental.end_date).toISOString().slice(0, 16)
                        : ''
                    }
                    className={pageInputClass}
                  />
                </div>
                <div>
                  <label className="text-sm text-white/70">Сума</label>
                  <input
                    type="number"
                    name="total_price"
                    defaultValue={editingRental.total_price}
                    className={pageInputClass}
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditingRental(null)}
                  className="rounded-lg border border-white/20 px-4 py-2 text-white/80 hover:bg-white/10"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"
                >
                  Зберегти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppPageLayout>
  );
};

export default RentalsPage;
