import { useState, useEffect } from 'react';
import ApiService from '../services/api';
import AppPageLayout, { pagePanelClass } from './AppPageLayout';

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString('uk-UA')} грн`;

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

const StatCard = ({ label, value, hint, accent = 'from-blue-600/20 to-indigo-600/10' }) => (
  <div className={`${pagePanelClass} relative overflow-hidden p-5`}>
    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`} />
    <div className="relative">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/45">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {hint && <p className="mt-1 text-sm text-white/50">{hint}</p>}
    </div>
  </div>
);

const OPTION_LABELS = {
  delivery: 'Доставка додому',
  return_elsewhere: 'Повернення в іншому місці',
  child_seat: 'Дитяче крісло',
  bike_rack: 'Кріплення для велосипедів',
  full_insurance: 'Повне страхування',
};

const AdminStatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ApiService.getAdminStatistics();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <AppPageLayout title="Статистика" variant="fleet">
        <p className="text-center text-white/70">Завантаження статистики...</p>
      </AppPageLayout>
    );
  }

  if (error) {
    return (
      <AppPageLayout title="Статистика" variant="fleet">
        <p className="text-center text-red-400">Помилка: {error}</p>
      </AppPageLayout>
    );
  }

  const { overview, topCars, optionsUsage, monthlyRevenue, recentRentals } = stats;
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);
  const maxOptionCount = Math.max(...Object.values(optionsUsage), 1);
  const chartPoints = monthlyRevenue.map((month, index) => {
    const x = monthlyRevenue.length === 1 ? 50 : (index / (monthlyRevenue.length - 1)) * 100;
    const y = 90 - (month.revenue / maxRevenue) * 70;
    return { ...month, x, y };
  });
  const chartLine = chartPoints.map((point) => `${point.x},${point.y}`).join(' ');
  const chartArea = `0,100 ${chartLine} 100,100`;

  return (
    <AppPageLayout
      title="Панель статистики"
      subtitle="Огляд бізнес-показників Burunduk Garage для адміністратора."
      variant="fleet"
    >
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Загальний дохід"
          value={formatMoney(overview.totalRevenue)}
          hint="за весь час"
          accent="from-emerald-600/25 to-teal-600/10"
        />
        <StatCard
          label="Дохід за місяць"
          value={formatMoney(overview.monthRevenue)}
          hint={`${overview.monthRentals} бронювань`}
          accent="from-blue-600/25 to-cyan-600/10"
        />
        <StatCard
          label="Активні оренди"
          value={overview.activeRentals}
          hint="зараз на лінії"
          accent="from-amber-600/25 to-orange-600/10"
        />
        <StatCard
          label="Середній чек"
          value={formatMoney(overview.avgOrderValue)}
          hint={`${overview.totalRentals} бронювань всього`}
          accent="from-violet-600/25 to-purple-600/10"
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Користувачі" value={overview.usersCount} accent="from-slate-600/20 to-slate-800/10" />
        <StatCard label="Автомобілі в базі" value={overview.carsCount} accent="from-slate-600/20 to-slate-800/10" />
        <StatCard label="Доступні авто" value={overview.availableCars} accent="from-green-600/20 to-emerald-800/10" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={`${pagePanelClass} p-6`}>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Дохід по місяцях</h2>
              <p className="mt-1 text-sm text-white/45">Динаміка доходу за останні 6 місяців</p>
            </div>
            <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300">
              max {formatMoney(maxRevenue)}
            </span>
          </div>
          <div className="relative h-72 overflow-x-auto pb-2 sm:h-64 sm:overflow-visible sm:pb-0">
            <div className="relative h-full min-w-[520px] sm:min-w-0">
            <div className="absolute inset-x-0 top-4 bottom-10 flex flex-col justify-between">
              {[0, 1, 2, 3].map((line) => (
                <div key={line} className="border-t border-white/10" />
              ))}
            </div>
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-x-0 top-2 h-44 w-full overflow-visible"
              aria-hidden="true"
            >
              <polygon points={chartArea} fill="rgba(16, 185, 129, 0.12)" />
              <polyline
                points={chartLine}
                fill="none"
                stroke="rgb(52, 211, 153)"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {chartPoints.map((point) => (
                <circle
                  key={point.label}
                  cx={point.x}
                  cy={point.y}
                  r="2"
                  fill="rgb(15, 23, 42)"
                  stroke="rgb(110, 231, 183)"
                  strokeWidth="1.6"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            <div className="absolute inset-x-0 bottom-0 grid grid-cols-6 gap-2">
              {chartPoints.map((month) => (
                <div key={month.label} className="min-w-0 text-center">
                  <p className="truncate text-xs font-semibold text-white/70">{month.label}</p>
                  <p className="mt-1 text-[11px] text-emerald-300">
                    {(month.revenue / 1000).toFixed(month.revenue >= 1000 ? 0 : 1)}k
                  </p>
                  <p className="text-[10px] text-white/35">{month.count} бр.</p>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>

        <div className={`${pagePanelClass} p-6`}>
          <h2 className="mb-6 text-lg font-bold text-white">Популярні додаткові опції</h2>
          <div className="space-y-4">
            {Object.entries(optionsUsage).map(([key, count]) => (
              <div key={key}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-white/80">{OPTION_LABELS[key]}</span>
                  <span className="font-medium text-white">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                    style={{ width: `${(count / maxOptionCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={`${pagePanelClass} p-6`}>
          <h2 className="mb-4 text-lg font-bold text-white">Топ автомобілів</h2>
          {topCars.length === 0 ? (
            <p className="text-white/50">Даних поки немає</p>
          ) : (
            <div className="space-y-3">
              {topCars.map((car, index) => (
                <div
                  key={car.id}
                  className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/30 text-sm font-bold text-blue-200">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-white">{car.name}</p>
                      <p className="text-xs text-white/45">{car.count} бронювань</p>
                    </div>
                  </div>
                  <span className="font-semibold text-emerald-300 sm:text-right">{formatMoney(car.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`${pagePanelClass} p-6`}>
          <h2 className="mb-4 text-lg font-bold text-white">Останні бронювання</h2>
          <div className="space-y-3">
            {recentRentals.map((rental) => (
              <div
                key={rental.id}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-white">{rental.carName}</p>
                    <p className="text-xs text-white/45">{rental.clientEmail}</p>
                  </div>
                  <span className="shrink-0 font-semibold text-blue-300">
                    {formatMoney(rental.totalPrice)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-white/40">
                  {formatDate(rental.startDate)} → {formatDate(rental.endDate)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppPageLayout>
  );
};

export default AdminStatsPage;
