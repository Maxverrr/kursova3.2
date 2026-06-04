const RENTAL_START_HOUR = 8;
const RENTAL_START_MINUTE = 0;
const RENTAL_END_HOUR = 22;
const RENTAL_END_MINUTE = 59;

const OPTION_RATES = {
  deliveryPerKm: 30,
  returnPerKm: 30,
  childSeat: 150,
  bikeRack: 200,
  insuranceRate: 0.15,
};

function applyRentalStartTime(date) {
  const d = new Date(date);
  d.setHours(RENTAL_START_HOUR, RENTAL_START_MINUTE, 0, 0);
  return d;
}

function applyRentalEndTime(date) {
  const d = new Date(date);
  d.setHours(RENTAL_END_HOUR, RENTAL_END_MINUTE, 0, 0);
  return d;
}

function countRentalDays(startDate, endDate) {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function normalizeOptions(options = {}) {
  return {
    delivery: Boolean(options.delivery?.enabled),
    deliveryKm: Math.max(0, Number(options.delivery?.km) || 0),
    returnElsewhere: Boolean(options.return_elsewhere?.enabled),
    returnKm: Math.max(0, Number(options.return_elsewhere?.km) || 0),
    childSeat: Boolean(options.child_seat?.enabled),
    bikeRack: Boolean(options.bike_rack?.enabled),
    fullInsurance: Boolean(options.full_insurance?.enabled),
  };
}

function calculateRentalPrice(pricePerDay, startDate, endDate, options = {}) {
  const days = countRentalDays(startDate, endDate);
  const basePrice = days * pricePerDay;

  const deliveryPrice = options.delivery ? options.deliveryKm * OPTION_RATES.deliveryPerKm : 0;
  const returnPrice = options.returnElsewhere ? options.returnKm * OPTION_RATES.returnPerKm : 0;
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

function applyRentalTimes(startDate, endDate) {
  return {
    start: applyRentalStartTime(startDate),
    end: applyRentalEndTime(endDate),
  };
}

function validateRentalPrice(pricePerDay, startDate, endDate, options, expectedTotal) {
  const normalized = normalizeOptions(options);
  const pricing = calculateRentalPrice(pricePerDay, startDate, endDate, normalized);
  return Math.abs(pricing.totalPrice - Number(expectedTotal)) <= 1;
}

module.exports = {
  OPTION_RATES,
  applyRentalStartTime,
  applyRentalEndTime,
  applyRentalTimes,
  countRentalDays,
  normalizeOptions,
  calculateRentalPrice,
  validateRentalPrice,
};
