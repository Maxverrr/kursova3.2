import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../services/api';
import RentalEditModal from './RentalEditModal';
import AppPageLayout, { pagePanelClass } from './AppPageLayout';

const RENTAL_EDIT_DEADLINE_MS = 2 * 24 * 60 * 60 * 1000;

const formatDate = (dateString) => {
  try {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '—';
  }
};

const getRentalStatusFromRental = (rental) => {
  if (rental.status === 'cancelled') {
    return {
      label: 'Скасована',
      badge: 'bg-red-500/20 text-red-300 border-red-500/30',
      accent: 'border-red-500',
      progress: 0,
    };
  }

  const now = Date.now();
  const start = new Date(rental.start_date).getTime();
  const end = new Date(rental.end_date).getTime();
  if (now < start) {
    return {
      label: 'Майбутня',
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      accent: 'border-sky-500',
      progress: 0,
    };
  }
  if (now > end) {
    return {
      label: 'Завершена',
      badge: 'bg-white/10 text-white/50 border-white/20',
      accent: 'border-white/20',
      progress: 100,
    };
  }
  const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  return {
    label: 'Активна',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    accent: 'border-emerald-500',
    progress: Math.round(progress),
  };
};

const canModifyRental = (rental) =>
  rental.status !== 'cancelled' &&
  new Date(rental.start_date).getTime() - Date.now() >= RENTAL_EDIT_DEADLINE_MS;

const StatCard = ({ label, value, hint }) => (
  <div className={`${pagePanelClass} p-5`}>
    <p className="text-xs font-semibold uppercase tracking-wider text-white/45">{label}</p>
    <p className="mt-2 text-2xl font-bold">{value}</p>
    {hint && <p className="mt-1 text-sm text-white/50">{hint}</p>}
  </div>
);

const getSelectedOptions = (options) => {
  if (!options) return [];
  const items = [];
  if (options.delivery?.enabled) {
    items.push(`Доставка додому (${options.delivery.km} км) — ${options.delivery.price} грн`);
  }
  if (options.return_elsewhere?.enabled) {
    items.push(`Повернення в іншому місці (${options.return_elsewhere.km} км) — ${options.return_elsewhere.price} грн`);
  }
  if (options.child_seat?.enabled) {
    items.push(`Дитяче крісло — ${options.child_seat.price} грн`);
  }
  if (options.bike_rack?.enabled) {
    items.push(`Кріплення для велосипедів — ${options.bike_rack.price} грн`);
  }
  if (options.full_insurance?.enabled) {
    items.push(`Повне страхування — ${options.full_insurance.price} грн`);
  }
  return items;
};

const UserRentalsPage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRental, setEditingRental] = useState(null);

  useEffect(() => {
    fetchUserRentals();
  }, []);

  const fetchUserRentals = async () => {
    try {
      setLoading(true);
      setError(null);
      const userRentals = await ApiService.getRentals();
      setRentals(userRentals);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (rentalId, updatedData) => {
    try {
      setError(null);
      await ApiService.updateRental(rentalId, updatedData);
      setEditingRental(null);
      await fetchUserRentals();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = async (rentalId) => {
    if (!window.confirm('Ви впевнені, що хочете скасувати це бронювання?')) return;
    try {
      setError(null);
      await ApiService.deleteRental(rentalId);
      await fetchUserRentals();
    } catch (err) {
      setError(err.message);
    }
  };

  const stats = useMemo(() => {
    const now = Date.now();
    let active = 0;
    let totalSpent = 0;
    rentals.forEach((r) => {
      if (r.status !== 'cancelled') {
        totalSpent += Number(r.total_price) || 0;
      }
      const start = new Date(r.start_date).getTime();
      const end = new Date(r.end_date).getTime();
      if (r.status !== 'cancelled' && now >= start && now <= end) active += 1;
    });
    return { total: rentals.length, active, totalSpent };
  }, [rentals]);

  if (loading) {
    return (
      <AppPageLayout title="Мої оренди">
        <p className="text-center text-white/70">Завантаження...</p>
      </AppPageLayout>
    );
  }

  if (error) {
    return (
      <AppPageLayout title="Мої оренди">
        <p className="text-center text-red-400">Помилка: {error}</p>
      </AppPageLayout>
    );
  }

  return (
    <AppPageLayout
      title="Мої оренди"
      subtitle="Історія ваших бронювань та поточні активні поїздки."
      variant="details"
    >
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Всього оренд" value={stats.total} />
        <StatCard label="Зараз активні" value={stats.active} hint="авто в оренді зараз" />
        <StatCard
          label="Загальна сума"
          value={`${stats.totalSpent.toLocaleString('uk-UA')} ₴`}
          hint="за весь час"
        />
      </div>

      {rentals.length === 0 ? (
        <div className={`${pagePanelClass} p-10 text-center`}>
          <p className="text-lg text-white/70">У вас поки що немає оренд</p>
          <Link
            to="/MainApp"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500"
          >
            Переглянути автопарк
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {rentals.map((rental) => {
            const status = getRentalStatusFromRental(rental);
            const canModify = canModifyRental(rental);
            return (
              <article
                key={rental._id}
                className={`${pagePanelClass} border-l-4 p-5 ${status.accent}`}
              >
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    {rental.car_id?._id ? (
                      <Link
                        to={`/cars/${rental.car_id._id}`}
                        className="text-xl font-bold text-white hover:text-blue-400"
                      >
                        {rental.car_id?.name || 'Автомобіль'}
                      </Link>
                    ) : (
                      <span className="text-xl font-bold">Автомобіль</span>
                    )}
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${status.badge}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white/45">Початок</p>
                    <p className="mt-1 font-medium">{formatDate(rental.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-white/45">Кінець</p>
                    <p className="mt-1 font-medium">{formatDate(rental.end_date)}</p>
                  </div>
                </div>

                {status.label === 'Активна' && (
                  <div className="mb-4">
                    <div className="mb-1 flex justify-between text-xs text-white/50">
                      <span>Прогрес оренди</span>
                      <span>{status.progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${status.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {getSelectedOptions(rental.options).length > 0 && (
                  <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                    <p className="mb-2 text-white/45">Додаткові опції</p>
                    <ul className="space-y-1 text-white/75">
                      {getSelectedOptions(rental.options).map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-end justify-between gap-4">
                    <p className="text-sm text-white/50">Сума оренди</p>
                    <p className="text-2xl font-bold text-blue-400">{rental.total_price} ₴</p>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-white/45">
                      {canModify
                        ? 'Редагування та скасування доступні за 2 дня до початку оренди.'
                        : 'Редагування і скасування вже недоступні.'}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingRental(rental)}
                        disabled={!canModify}
                        className="rounded-lg border border-amber-400/40 px-3 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/30 disabled:hover:bg-transparent"
                      >
                        Редагувати
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancel(rental._id)}
                        disabled={!canModify}
                        className="rounded-lg border border-red-400/40 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/30 disabled:hover:bg-transparent"
                      >
                        Скасувати
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editingRental && (
        <RentalEditModal
          rental={editingRental}
          title="Редагувати моє бронювання"
          onClose={() => setEditingRental(null)}
          onSave={(updatedData) => handleEdit(editingRental._id, updatedData)}
        />
      )}
    </AppPageLayout>
  );
};

export default UserRentalsPage;
