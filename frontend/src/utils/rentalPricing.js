export const RENTAL_START_HOUR = 8;
export const RENTAL_START_MINUTE = 0;
export const RENTAL_END_HOUR = 22;
export const RENTAL_END_MINUTE = 59;

export const OPTION_RATES = {
  deliveryPerKm: 30,
  returnPerKm: 30,
  childSeat: 150,
  bikeRack: 200,
  insuranceRate: 0.15,
};

export function applyRentalStartTime(date) {
  const d = new Date(date);
  d.setHours(RENTAL_START_HOUR, RENTAL_START_MINUTE, 0, 0);
  return d;
}

export function applyRentalEndTime(date) {
  const d = new Date(date);
  d.setHours(RENTAL_END_HOUR, RENTAL_END_MINUTE, 0, 0);
  return d;
}

export function countRentalDays(startDate, endDate) {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

export function calculateRentalPrice(pricePerDay, startDate, endDate, options = {}) {
  const days = countRentalDays(startDate, endDate);
  const basePrice = days * pricePerDay;

  const deliveryKm = options.delivery ? Math.max(0, Number(options.deliveryKm) || 0) : 0;
  const returnKm = options.returnElsewhere ? Math.max(0, Number(options.returnKm) || 0) : 0;

  const deliveryPrice = options.delivery ? deliveryKm * OPTION_RATES.deliveryPerKm : 0;
  const returnPrice = options.returnElsewhere ? returnKm * OPTION_RATES.returnPerKm : 0;
  const childSeatPrice = options.childSeat ? OPTION_RATES.childSeat : 0;
  const bikeRackPrice = options.bikeRack ? OPTION_RATES.bikeRack : 0;
  const insurancePrice = options.fullInsurance
    ? Math.round(basePrice * OPTION_RATES.insuranceRate)
    : 0;

  const optionsTotal =
    deliveryPrice + returnPrice + childSeatPrice + bikeRackPrice + insurancePrice;

  return {
    days,
    basePrice,
    deliveryPrice,
    returnPrice,
    childSeatPrice,
    bikeRackPrice,
    insurancePrice,
    optionsTotal,
    totalPrice: basePrice + optionsTotal,
  };
}

export function buildRentalOptionsPayload(pricing, formOptions) {
  return {
    delivery: {
      enabled: Boolean(formOptions.delivery),
      km: formOptions.delivery ? Math.max(0, Number(formOptions.deliveryKm) || 0) : 0,
      price: pricing.deliveryPrice,
    },
    return_elsewhere: {
      enabled: Boolean(formOptions.returnElsewhere),
      km: formOptions.returnElsewhere ? Math.max(0, Number(formOptions.returnKm) || 0) : 0,
      price: pricing.returnPrice,
    },
    child_seat: {
      enabled: Boolean(formOptions.childSeat),
      price: pricing.childSeatPrice,
    },
    bike_rack: {
      enabled: Boolean(formOptions.bikeRack),
      price: pricing.bikeRackPrice,
    },
    full_insurance: {
      enabled: Boolean(formOptions.fullInsurance),
      price: pricing.insurancePrice,
    },
  };
}

export function formatRentalTimeRange(startDate, endDate) {
  const start = applyRentalStartTime(startDate);
  const end = applyRentalEndTime(endDate);
  const fmt = new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return { start, end, label: `${fmt.format(start)} — ${fmt.format(end)}` };
}
