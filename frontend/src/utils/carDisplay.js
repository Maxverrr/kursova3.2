export const isElectricCar = (carOrFuelType) => {
  const fuelType =
    typeof carOrFuelType === 'string'
      ? carOrFuelType
      : carOrFuelType?.fuel_type?.fuel_type || carOrFuelType?.fuel_type || '';

  return fuelType.toLowerCase().includes('елект') || fuelType.toLowerCase().includes('electric');
};

const firstNumber = (value) => {
  const match = String(value ?? '').replace(',', '.').match(/\d+(\.\d+)?/);
  return match ? match[0] : value;
};

export const getCarSpecLabels = (carOrFuelType) => {
  const electric = isElectricCar(carOrFuelType);

  return {
    electric,
    capacityLabel: electric ? 'Ємність батареї' : "Об'єм двигуна",
    capacityUnit: electric ? 'кВт·год' : 'л',
    consumptionLabel: electric ? 'Витрата енергії' : 'Розхід палива',
    consumptionUnit: electric ? 'кВт·год/100км' : 'л/100км',
  };
};

export const formatCapacity = (value, carOrFuelType) => {
  const labels = getCarSpecLabels(carOrFuelType);
  const normalizedValue = labels.electric ? firstNumber(value) : Number(value).toFixed(1);
  return `${normalizedValue} ${labels.capacityUnit}`;
};

export const formatConsumption = (value, carOrFuelType) => {
  const labels = getCarSpecLabels(carOrFuelType);
  return `${firstNumber(value)}${labels.consumptionUnit}`;
};

export const formatCardCapacity = (value, carOrFuelType) => {
  const labels = getCarSpecLabels(carOrFuelType);
  return labels.electric ? `${firstNumber(value)} кВт` : firstNumber(value);
};

export const formatCardConsumption = (value) => firstNumber(value);

export const withImageKitBackgroundRemoval = (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('ik.imagekit.io') || imageUrl.includes('tr:e-bgremove')) {
    return imageUrl;
  }

  const [baseUrl, queryString] = imageUrl.split('?');
  const marker = 'ik.imagekit.io/';
  const markerIndex = baseUrl.indexOf(marker);
  const pathStart = baseUrl.indexOf('/', markerIndex + marker.length);

  if (pathStart === -1) return imageUrl;

  return `${baseUrl.slice(0, pathStart)}/tr:e-bgremove${baseUrl.slice(pathStart)}${queryString ? `?${queryString}` : ''}`;
};
