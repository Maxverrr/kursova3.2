import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../services/api';
import RentalEditModal from './RentalEditModal';
import AppPageLayout, {
  pagePanelClass,
  pageTableHeadClass,
  pageTableCellClass,
  pageInputClass,
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

const countOptions = (options) => {
  if (!options) return 0;
  return [
    options.delivery?.enabled,
    options.return_elsewhere?.enabled,
    options.child_seat?.enabled,
    options.bike_rack?.enabled,
    options.full_insurance?.enabled,
  ].filter(Boolean).length;
};

const getRentalStatus = (rental) => {
  if (rental.status === 'cancelled') {
    return {
      label: 'Скасовано',
      className: 'bg-red-500/15 text-red-300 border-red-500/25',
    };
  }

  const now = Date.now();
  const start = new Date(rental.start_date).getTime();
  const end = new Date(rental.end_date).getTime();

  if (now < start) {
    return {
      label: 'Майбутнє',
      className: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
    };
  }

  if (now > end) {
    return {
      label: 'Завершено',
      className: 'bg-white/10 text-white/55 border-white/20',
    };
  }

  return {
    label: 'Активне',
    className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  };
};

const RentalsPage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRental, setEditingRental] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    status: '',
  });
  const [draftFilters, setDraftFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    status: '',
  });

  const fetchRentals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value)
      );
      const data = await ApiService.getRentals(params);
      setRentals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

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
    if (!window.confirm('Ви впевнені, що хочете видалити це бронювання?')) return;
    try {
      await ApiService.deleteRental(rentalId);
      await fetchRentals();
    } catch (err) {
      setError(err.message);
    }
  };

  const activeFilterCount = useMemo(
    () => Object.values(draftFilters).filter(Boolean).length,
    [draftFilters]
  );

  const applyFilters = () => {
    setFilters(draftFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { search: '', dateFrom: '', dateTo: '', status: '' };
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
  };

  if (loading) {
    return (
      <AppPageLayout title="Бронювання">
        <p className="text-center text-white/70">Завантаження...</p>
      </AppPageLayout>
    );
  }

  if (error) {
    return (
      <AppPageLayout title="Бронювання">
        <p className="text-center text-red-400">Помилка: {error}</p>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout
      title="Бронювання"
      subtitle="Усі бронювання клієнтів. Редагування, статуси та видалення доступні адміністратору."
      headerExtra={
        <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium">
          Всього: {rentals.length}
        </span>
      }
    >
      <div className={`${pagePanelClass} mb-5 p-4`}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_auto_auto] lg:items-end">
          <div>
            <label className="text-sm text-white/70">Пошук</label>
            <input
              type="search"
              value={draftFilters.search}
              onChange={(e) => setDraftFilters((current) => ({ ...current, search: e.target.value }))}
              placeholder="Автомобіль, email, ім'я або телефон клієнта"
              className={pageInputClass}
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Оренда від</label>
            <input
              type="date"
              value={draftFilters.dateFrom}
              onChange={(e) => setDraftFilters((current) => ({ ...current, dateFrom: e.target.value }))}
              className={pageInputClass}
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Оренда до</label>
            <input
              type="date"
              value={draftFilters.dateTo}
              onChange={(e) => setDraftFilters((current) => ({ ...current, dateTo: e.target.value }))}
              className={pageInputClass}
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Статус</label>
            <select
              value={draftFilters.status}
              onChange={(e) => setDraftFilters((current) => ({ ...current, status: e.target.value }))}
              className={pageInputClass}
            >
              <option value="">Усі</option>
              <option value="current">Активні</option>
              <option value="future">Майбутнє</option>
              <option value="completed">Завершено</option>
              <option value="cancelled">Скасовані</option>
            </select>
          </div>
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"
          >
            Застосувати
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-white/20 px-4 py-2 text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 lg:mb-0"
            disabled={activeFilterCount === 0}
          >
            Очистити
          </button>
        </div>
      </div>

      <div className={pagePanelClass}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className={pageTableHeadClass}>
              <tr>
                <th className={`${pageTableCellClass} text-left`}>Автомобіль</th>
                <th className={`${pageTableCellClass} text-left`}>Клієнт</th>
                <th className={`${pageTableCellClass} text-left`}>Початок</th>
                <th className={`${pageTableCellClass} text-left`}>Кінець</th>
                <th className={`${pageTableCellClass} text-left`}>Статус</th>
                <th className={`${pageTableCellClass} text-left`}>Сума</th>
                <th className={`${pageTableCellClass} text-left`}>Опції</th>
                <th className={`${pageTableCellClass} text-left`}>Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rentals.length === 0 ? (
                <tr>
                  <td colSpan={8} className={`${pageTableCellClass} text-center text-white/50`}>
                    Бронювань поки немає
                  </td>
                </tr>
              ) : (
                rentals.map((rental) => {
                  const status = getRentalStatus(rental);
                  return (
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
                    <td className={pageTableCellClass}>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className={`${pageTableCellClass} font-semibold`}>{rental.total_price} ₴</td>
                    <td className={pageTableCellClass}>
                      {countOptions(rental.options) > 0 ? (
                        <span className="inline-flex whitespace-nowrap rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-200">
                          {countOptions(rental.options)} опц.
                        </span>
                      ) : (
                        <span className="text-white/35">—</span>
                      )}
                    </td>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingRental && (
        <RentalEditModal
          rental={editingRental}
          title="Редагувати бронювання"
          allowStatusEdit
          onClose={() => setEditingRental(null)}
          onSave={(updatedData) => handleEdit(editingRental._id, updatedData)}
        />
      )}
    </AppPageLayout>
  );
};

export default RentalsPage;
