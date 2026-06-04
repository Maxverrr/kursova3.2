import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  calculateRentalPrice,
  buildRentalOptionsPayload,
  OPTION_RATES,
} from '../utils/rentalPricing';
import {
  pageInputClass,
  pageModalClass,
  pageModalOverlayClass,
} from './AppPageLayout';

const dateInputValue = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const optionsToForm = (options = {}) => ({
  delivery: Boolean(options.delivery?.enabled),
  deliveryKm: options.delivery?.km || '',
  returnElsewhere: Boolean(options.return_elsewhere?.enabled),
  returnKm: options.return_elsewhere?.km || '',
  childSeat: Boolean(options.child_seat?.enabled),
  bikeRack: Boolean(options.bike_rack?.enabled),
  fullInsurance: Boolean(options.full_insurance?.enabled),
});

const OptionCheckbox = ({ checked, onChange, title, subtitle, children }) => (
  <label className="block rounded-lg border border-white/10 bg-white/[0.03] p-3">
    <span className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-blue-500"
      />
      <span className="flex-1">
        <span className="block font-medium text-white">{title}</span>
        {subtitle && <span className="mt-0.5 block text-sm text-white/45">{subtitle}</span>}
      </span>
    </span>
    {children}
  </label>
);

const RentalEditModal = ({
  rental,
  title = 'Редагувати бронювання',
  allowStatusEdit = false,
  onClose,
  onSave,
}) => {
  const [startDate, setStartDate] = useState(dateInputValue(rental.start_date));
  const [endDate, setEndDate] = useState(dateInputValue(rental.end_date));
  const [status, setStatus] = useState(rental.status || 'active');
  const [options, setOptions] = useState(() => optionsToForm(rental.options));
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const priceBreakdown = useMemo(() => {
    const pricePerDay = Number(rental.car_id?.price_per_day) || 0;
    if (!pricePerDay || !startDate || !endDate) return null;

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return null;

    return calculateRentalPrice(pricePerDay, start, end, options);
  }, [endDate, options, rental.car_id?.price_per_day, startDate]);

  const setOption = (field, value) => {
    setOptions((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError('');

    if (!startDate || !endDate || !priceBreakdown) {
      setFormError('Оберіть коректний діапазон дат');
      return;
    }

    if (options.delivery && (!options.deliveryKm || Number(options.deliveryKm) <= 0)) {
      setFormError('Вкажіть відстань для доставки авто');
      return;
    }

    if (options.returnElsewhere && (!options.returnKm || Number(options.returnKm) <= 0)) {
      setFormError('Вкажіть відстань для повернення в іншому місці');
      return;
    }

    onSave({
      start_date: new Date(`${startDate}T00:00:00`).toISOString(),
      end_date: new Date(`${endDate}T00:00:00`).toISOString(),
      options: buildRentalOptionsPayload(priceBreakdown, options),
      ...(allowStatusEdit ? { status } : {}),
    });
  };

  return createPortal(
    <div className={pageModalOverlayClass} role="dialog" aria-modal="true">
      <div className={`${pageModalClass} max-h-[92vh] max-w-2xl overflow-y-auto`}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="mt-1 text-sm text-white/45">
              {rental.car_id?.name || 'Автомобіль'} · {rental.client_id?.email || 'ваше бронювання'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-white/50 hover:text-white"
            aria-label="Закрити"
          >
            ×
          </button>
        </div>

        {formError && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-white/70">Дата початку</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={pageInputClass}
                required
              />
            </div>
            <div>
              <label className="text-sm text-white/70">Дата завершення</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={pageInputClass}
                required
              />
            </div>
          </div>

          {allowStatusEdit && (
            <div>
              <label className="text-sm text-white/70">Статус</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={pageInputClass}
              >
                <option value="active">Активне</option>
                <option value="cancelled">Скасовано</option>
              </select>
            </div>
          )}

          <div>
            <h3 className="mb-3 font-semibold text-white">Додаткові опції</h3>
            <div className="space-y-3">
              <OptionCheckbox
                checked={options.delivery}
                onChange={(value) => setOption('delivery', value)}
                title="Доставка авто додому"
                subtitle={`${OPTION_RATES.deliveryPerKm} грн за км`}
              >
                {options.delivery && (
                  <input
                    type="number"
                    min="1"
                    value={options.deliveryKm}
                    onChange={(e) => setOption('deliveryKm', e.target.value)}
                    placeholder="Відстань, км"
                    className={pageInputClass}
                  />
                )}
              </OptionCheckbox>

              <OptionCheckbox
                checked={options.returnElsewhere}
                onChange={(value) => setOption('returnElsewhere', value)}
                title="Повернення в іншому місці"
                subtitle={`${OPTION_RATES.returnPerKm} грн за км`}
              >
                {options.returnElsewhere && (
                  <input
                    type="number"
                    min="1"
                    value={options.returnKm}
                    onChange={(e) => setOption('returnKm', e.target.value)}
                    placeholder="Відстань, км"
                    className={pageInputClass}
                  />
                )}
              </OptionCheckbox>

              <OptionCheckbox
                checked={options.childSeat}
                onChange={(value) => setOption('childSeat', value)}
                title="Дитяче крісло"
                subtitle={`${OPTION_RATES.childSeat} грн`}
              />
              <OptionCheckbox
                checked={options.bikeRack}
                onChange={(value) => setOption('bikeRack', value)}
                title="Кріплення для велосипедів"
                subtitle={`${OPTION_RATES.bikeRack} грн`}
              />
              <OptionCheckbox
                checked={options.fullInsurance}
                onChange={(value) => setOption('fullInsurance', value)}
                title="Повне страхування авто"
                subtitle="15% від вартості оренди"
              />
            </div>
          </div>

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-blue-100/70">Оновлена сума</span>
              <span className="text-2xl font-bold text-blue-300">
                {priceBreakdown ? `${priceBreakdown.totalPrice} грн` : '—'}
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
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
    </div>,
    document.body
  );
};

export default RentalEditModal;
