import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import { uk } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import {
  OPTION_RATES,
  formatRentalTimeRange,
  calculateRentalPrice,
} from '../utils/rentalPricing';

const RENT_CALENDAR_STYLES = `
  .rent-calendar-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  .rent-calendar {
    font-family: inherit;
    background: rgba(17, 24, 39, 0.95) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 1rem !important;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
  }
  .rent-calendar .react-datepicker__header {
    background: rgba(255, 255, 255, 0.05) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    padding-top: 0.85rem;
  }
  .rent-calendar .react-datepicker__current-month,
  .rent-calendar .react-datepicker__day-name {
    color: rgba(255, 255, 255, 0.85) !important;
  }
  .rent-calendar .react-datepicker__day {
    color: rgba(255, 255, 255, 0.9) !important;
    border-radius: 0.5rem !important;
    margin: 0.12rem !important;
    width: 2.1rem !important;
    line-height: 2.1rem !important;
  }
  .rent-calendar .react-datepicker__day:hover {
    background: rgba(59, 130, 246, 0.35) !important;
  }
  .rent-calendar .react-datepicker__day--disabled {
    color: rgba(239, 68, 68, 0.55) !important;
    text-decoration: line-through;
  }
  .rent-calendar .react-datepicker__day--outside-month {
    color: rgba(255, 255, 255, 0.25) !important;
  }
  .rent-calendar .react-datepicker__day--in-selecting-range,
  .rent-calendar .react-datepicker__day--in-range {
    background: rgba(37, 99, 235, 0.45) !important;
    color: #fff !important;
  }
  .rent-calendar .react-datepicker__day--range-start,
  .rent-calendar .react-datepicker__day--range-end,
  .rent-calendar .react-datepicker__day--selected {
    background: #2563eb !important;
    color: #fff !important;
    font-weight: 600;
  }
  .rent-calendar .react-datepicker__navigation-icon::before {
    border-color: rgba(255, 255, 255, 0.7) !important;
  }
  .rent-calendar .react-datepicker__month-container {
    float: none;
  }
  .rent-calendar .react-datepicker__month {
    margin: 0.5rem;
  }
`;

const RentModalCalendarStyles = () => <style>{RENT_CALENDAR_STYLES}</style>;

const OptionRow = ({ checked, onToggle, title, subtitle, price, children }) => (
  <div
    className={`rounded-xl border p-4 transition-[border-color,background-color] duration-200 ${
      checked
        ? 'border-blue-500/45 bg-blue-600/[0.08]'
        : 'border-white/10 hover:bg-white/5'
    }`}
  >
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onToggle(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-blue-500"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium text-white">{title}</p>
            {subtitle && <p className="mt-0.5 text-sm text-white/45">{subtitle}</p>}
          </div>
          {price !== undefined && (
            <span className="shrink-0 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-sm font-semibold text-blue-300">
              {price}
            </span>
          )}
        </div>
        {children}
      </div>
    </div>
  </div>
);

const RentModal = ({
  car,
  rentDates,
  rentOptions,
  priceBreakdown,
  rentError,
  existingRentals,
  onClose,
  onSubmit,
  onDatesChange,
  onOptionChange,
  renderDayContents,
}) => {
  const hasFullRange = rentDates.startDate && rentDates.endDate;
  const datesReady = Boolean(hasFullRange);

  const insurancePreview = datesReady
    ? `${calculateRentalPrice(car.price_per_day, rentDates.startDate, rentDates.endDate, {
        fullInsurance: true,
      }).insurancePrice} грн`
    : '—';

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const excludedDates = existingRentals.flatMap((rental) => {
    const dates = [];
    let currentDate = new Date(rental.start);
    const end = new Date(rental.end);
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  });

  return createPortal(
    <>
      <RentModalCalendarStyles />
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-3 backdrop-blur-md sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rent-modal-title"
    >
      <div
        className="glass-panel-strong flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-violet-600/10 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-300/80">
                Бронювання
              </p>
              <h2 id="rent-modal-title" className="mt-1 text-xl font-bold text-white sm:text-2xl">
                {car.name}
              </h2>
              <p className="mt-1 text-sm text-white/55">
                від <span className="font-semibold text-blue-300">{car.price_per_day} грн</span> / доба
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-xl text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Закрити"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <p className="mb-5 rounded-xl border border-blue-500/25 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
            <span className="font-medium">Графік оренди:</span> щоденно з{' '}
            <strong>08:00</strong> до <strong>22:59</strong>
            {hasFullRange && (
              <span className="mt-1 block text-blue-200/80">
                {formatRentalTimeRange(rentDates.startDate, rentDates.endDate).label}
              </span>
            )}
          </p>

          {rentError && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-900/40 px-4 py-3 text-sm text-red-200">
              {rentError}
            </div>
          )}

          <form id="rent-form" onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-white/10 bg-gray-900/50 p-4">
              <h3 className="mb-1 text-base font-semibold text-white">Календар</h3>
              <p className="mb-4 text-sm text-white/45">
                {rentDates.startDate && !rentDates.endDate
                  ? 'Оберіть дату повернення авто'
                  : 'Оберіть діапазон дат оренди (початок → кінець)'}
              </p>
              <div className="flex w-full justify-center">
                <DatePicker
                  selected={rentDates.startDate}
                  onChange={onDatesChange}
                  startDate={rentDates.startDate}
                  endDate={rentDates.endDate}
                  selectsRange
                  inline
                  minDate={new Date()}
                  locale={uk}
                  calendarClassName="rent-calendar"
                  renderDayContents={renderDayContents}
                  excludeDates={excludedDates}
                />
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">Додаткові опції</h3>
                <p className="mt-1 text-sm text-white/45">
                  {datesReady
                    ? 'Оберіть потрібні послуги — сума оновиться автоматично'
                    : 'Спочатку оберіть дати в календарі'}
                </p>
              </div>

              <div className={`space-y-3 ${!datesReady ? 'pointer-events-none opacity-45' : ''}`}>
                <OptionRow
                  checked={rentOptions.delivery}
                  onToggle={(v) => onOptionChange('delivery', v)}
                  title="Доставка авто додому"
                  subtitle={`${OPTION_RATES.deliveryPerKm} грн за км`}
                >
                  {rentOptions.delivery && (
                    <input
                      type="number"
                      min="1"
                      placeholder="Відстань, км"
                      value={rentOptions.deliveryKm}
                      onChange={(e) => onOptionChange('deliveryKm', e.target.value)}
                      className="mt-3 w-full rounded-lg border border-white/15 bg-gray-900/80 px-3 py-2 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none"
                    />
                  )}
                </OptionRow>

                <OptionRow
                  checked={rentOptions.returnElsewhere}
                  onToggle={(v) => onOptionChange('returnElsewhere', v)}
                  title="Повернення в іншому місці"
                  subtitle={`${OPTION_RATES.returnPerKm} грн за км`}
                >
                  {rentOptions.returnElsewhere && (
                    <input
                      type="number"
                      min="1"
                      placeholder="Відстань, км"
                      value={rentOptions.returnKm}
                      onChange={(e) => onOptionChange('returnKm', e.target.value)}
                      className="mt-3 w-full rounded-lg border border-white/15 bg-gray-900/80 px-3 py-2 text-white placeholder:text-white/30 focus:border-blue-500 focus:outline-none"
                    />
                  )}
                </OptionRow>

                <OptionRow
                  checked={rentOptions.childSeat}
                  onToggle={(v) => onOptionChange('childSeat', v)}
                  title="Дитяче крісло"
                  price={`${OPTION_RATES.childSeat} грн`}
                />

                <OptionRow
                  checked={rentOptions.bikeRack}
                  onToggle={(v) => onOptionChange('bikeRack', v)}
                  title="Кріплення для велосипедів"
                  price={`${OPTION_RATES.bikeRack} грн`}
                />

                <OptionRow
                  checked={rentOptions.fullInsurance}
                  onToggle={(v) => onOptionChange('fullInsurance', v)}
                  title="Повне страхування авто"
                  subtitle="15% від вартості оренди"
                  price={priceBreakdown ? `${priceBreakdown.insurancePrice} грн` : insurancePreview}
                />
              </div>
            </section>
          </form>
        </div>

        <div className="border-t border-white/10 bg-gray-900/80 px-5 py-4 sm:px-6">
          {priceBreakdown ? (
            <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
              <div>
                <span className="text-white/45">Днів</span>
                <p className="font-semibold text-white">{priceBreakdown.days}</p>
              </div>
              <div>
                <span className="text-white/45">Оренда</span>
                <p className="font-semibold text-white">{priceBreakdown.basePrice} грн</p>
              </div>
              {priceBreakdown.optionsTotal > 0 && (
                <div>
                  <span className="text-white/45">Опції</span>
                  <p className="font-semibold text-white">{priceBreakdown.optionsTotal} грн</p>
                </div>
              )}
              <div className="col-span-2 sm:col-span-1 sm:text-right">
                <span className="text-white/45">Разом</span>
                <p className="text-2xl font-bold text-blue-400">{priceBreakdown.totalPrice} грн</p>
              </div>
            </div>
          ) : (
            <p className="mb-4 text-center text-sm text-white/45">
              Оберіть дати в календарі, щоб побачити суму оренди
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/20 px-5 py-2.5 text-white/80 transition hover:bg-white/10"
            >
              Скасувати
            </button>
            <button
              type="submit"
              form="rent-form"
              disabled={!datesReady}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-600 disabled:shadow-none"
            >
              Підтвердити оренду
            </button>
          </div>
        </div>
      </div>
    </div>
    </>,
    document.body
  );
};

export default RentModal;
