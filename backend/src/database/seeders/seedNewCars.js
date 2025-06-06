const mongoose = require('mongoose');
const Car = require('../../models/Car');
require('dotenv').config();

const newCarsData = [
  {
    name: "Mercedes-Benz S-Class",
    bodytype: "683e166e5ebb8d775823bb10",
    class: "683e166e5ebb8d775823bb18",
    engine_volume: 3.0,
    horsepower: 429,
    fueltype: "683e166e5ebb8d775823bb20",
    fuel_consumption: 9.5,
    color: "Чорний",
    price_per_day: 4000,
    status: "683e166e5ebb8d775823bb2a",
    photo: "https://ik.imagekit.io/burunduk/mercedes_s_class.jpeg"
  },
  {
    name: "BMW 7 Series",
    bodytype: "683e166e5ebb8d775823bb10",
    class: "683e166e5ebb8d775823bb18",
    engine_volume: 3.0,
    horsepower: 335,
    fueltype: "683e166e5ebb8d775823bb21",
    fuel_consumption: 8.0,
    color: "Синій",
    price_per_day: 3800,
    status: "683e166e5ebb8d775823bb2a",
    photo: "https://ik.imagekit.io/burunduk/bmw_7_series.jpeg"
  },
  {
    name: "Audi A8",
    bodytype: "683e166e5ebb8d775823bb10",
    class: "683e166e5ebb8d775823bb18",
    engine_volume: 3.0,
    horsepower: 335,
    fueltype: "683e166e5ebb8d775823bb20",
    fuel_consumption: 8.3,
    color: "Сірий",
    price_per_day: 3700,
    status: "683e166e5ebb8d775823bb2a",
    photo: "https://ik.imagekit.io/burunduk/audi_a8.jpeg"
  },
  {
    name: "Lexus LS",
    bodytype: "683e166e5ebb8d775823bb10",
    class: "683e166e5ebb8d775823bb18",
    engine_volume: 3.5,
    horsepower: 416,
    fueltype: "683e166e5ebb8d775823bb24",
    fuel_consumption: 9.0,
    color: "Білий",
    price_per_day: 3600,
    status: "683e166e5ebb8d775823bb2a",
    photo: "https://ik.imagekit.io/burunduk/lexus_ls.jpeg"
  },
  {
    name: "Jaguar XJ",
    bodytype: "683e166e5ebb8d775823bb10",
    class: "683e166e5ebb8d775823bb18",
    engine_volume: 3.0,
    horsepower: 340,
    fueltype: "683e166e5ebb8d775823bb20",
    fuel_consumption: 9.4,
    color: "Зелений",
    price_per_day: 3500,
    status: "683e166e5ebb8d775823bb2a",
    photo: "https://ik.imagekit.io/burunduk/jaguar_xj.jpeg"
  },
  {
    name: "BMW M5",
    bodytype: "683e166e5ebb8d775823bb10",
    class: "683e166e5ebb8d775823bb1a",
    engine_volume: 4.4,
    horsepower: 600,
    fueltype: "683e166e5ebb8d775823bb20",
    fuel_consumption: 10.5,
    color: "Червоний",
    price_per_day: 4500,
    status: "683e166e5ebb8d775823bb2a",
    photo: "https://ik.imagekit.io/burunduk/bmw_m5.jpeg"
  },
  {
    name: "Audi RS5",
    bodytype: "683e166e5ebb8d775823bb0e",
    class: "683e166e5ebb8d775823bb1a",
    engine_volume: 2.9,
    horsepower: 444,
    fueltype: "683e166e5ebb8d775823bb20",
    fuel_consumption: 9.2,
    color: "Синій",
    price_per_day: 4300,
    status: "683e166e5ebb8d775823bb2a",
    photo: "https://ik.imagekit.io/burunduk/audi_rs5.jpeg"
  },
  {
    name: "Mercedes-AMG C63",
    bodytype: "683e166e5ebb8d775823bb10",
    class: "683e166e5ebb8d775823bb1a",
    engine_volume: 4.0,
    horsepower: 469,
    fueltype: "683e166e5ebb8d775823bb20",
    fuel_consumption: 10.0,
    color: "Чорний",
    price_per_day: 4400,
    status: "683e166e5ebb8d775823bb2a",
    photo: "https://ik.imagekit.io/burunduk/mercedes_amg_c63.jpeg"
  },
  {
    name: "Alfa Romeo Giulia Quadrifoglio",
    bodytype: "683e166e5ebb8d775823bb10",
    class: "683e166e5ebb8d775823bb1a",
    engine_volume: 2.9,
    horsepower: 505,
    fueltype: "683e166e5ebb8d775823bb20",
    fuel_consumption: 9.8,
    color: "Зелений",
    price_per_day: 4200,
    status: "683e166e5ebb8d775823bb2a",
    photo: "https://ik.imagekit.io/burunduk/alfa_giulia_q.jpeg"
  },
  {
    name: "Porsche Panamera",
    bodytype: "683e166e5ebb8d775823bb0f",
    class: "683e166e5ebb8d775823bb1a",
    engine_volume: 3.0,
    horsepower: 330,
    fueltype: "683e166e5ebb8d775823bb20",
    fuel_consumption: 9.0,
    color: "Сірий",
    price_per_day: 4600,
    status: "683e166e5ebb8d775823bb2a",
    photo: "https://ik.imagekit.io/burunduk/porsche_panamera.jpeg"
  },
  {
    name: "Peugeot 208",
    bodytype: "683e166e5ebb8d775823bb0f",
    class: "683e166e5ebb8d775823bb17",
    engine_volume: 1.2,
    horsepower: 75,
    fueltype: "683e166e5ebb8d775823bb20",
    fuel_consumption: 4.5,
    color: "Жовтий",
    price_per_day: 800,
    status: "683e166e5ebb8d775823bb2a",
    photo: "https://ik.imagekit.io/burunduk/peugeot_208.jpeg"
  },
  {
    name: "Volkswagen Polo",
    bodytype: "683e166e5ebb8d775823bb0f",
    class: "683e166e5ebb8d775823bb17",
    engine_volume: 1.0,
    horsepower: 95,
    fueltype: "683e166e5ebb8d775823bb20",
    fuel_consumption: 4.8,
    color: "Білий",
    price_per_day: 850,
    status: "683e166e5ebb8d775823bb2a",
    photo: "https://ik.imagekit.io/burunduk/vw_polo.jpeg"
  },
  {
    name: "Hyundai i20",
    bodytype: "683e166e5ebb8d775823bb0f",
    class: "683e166e5ebb8d775823bb17",
    engine_volume: 1.2,
    horsepower: 84,
    fueltype: "683e166e5ebb8d775823bb20",
    fuel_consumption: 5.0,
    color: "Синій",
    price_per_day: 800,
    status: "683e166e5ebb8d775823bb2a",
    photo: "https://ik.imagekit.io/burunduk/hyundai_i20.jpeg"
  }
];

const seedNewCars = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Insert new cars
    await Car.insertMany(newCarsData);
    console.log('New cars data seeded successfully');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedNewCars(); 