const mongoose = require('mongoose');
const Car = require('../../models/Car');
require('dotenv').config();

const carsData = [
  {
    name: 'BMW X5 F15 3.0',
    body_type_id: 5,
    class_id: 4,
    engine_volume: 3.0,
    horsepower: 306,
    fuel_type_id: 1,
    fuel_consumption: 10.5,
    color: 'Білий',
    price_per_day: 3500,
    status_id: 1,
    photo: 'https://ik.imagekit.io/burunduk/bmw_x5_f15.jpeg'
  },
  {
    name: 'AUDI RS6',
    body_type_id: 2,
    class_id: 3,
    engine_volume: 4.0,
    horsepower: 620,
    fuel_type_id: 1,
    fuel_consumption: 25.7,
    color: 'Чорний',
    price_per_day: 2700,
    status_id: 1,
    photo: 'https://ik.imagekit.io/burunduk/audi_rs6.jpeg'
  },
  {
    name: 'Skoda Fabia 2',
    body_type_id: 3,
    class_id: 1,
    engine_volume: 1.2,
    horsepower: 70,
    fuel_type_id: 1,
    fuel_consumption: 5.5,
    color: 'Синій',
    price_per_day: 800,
    status_id: 1,
    photo: 'https://ik.imagekit.io/burunduk/skoda_fabia.jpeg'
  },
  {
    name: 'VW Passat B8',
    body_type_id: 1,
    class_id: 2,
    engine_volume: 1.8,
    horsepower: 150,
    fuel_type_id: 3,
    fuel_consumption: 6.5,
    color: 'Сірий',
    price_per_day: 1100,
    status_id: 1,
    photo: 'https://ik.imagekit.io/burunduk/vw_passat_b8.jpeg'
  },
  {
    name: 'Nissan Leaf',
    body_type_id: 3,
    class_id: 1,
    engine_volume: 0,
    horsepower: 110,
    fuel_type_id: 5,
    fuel_consumption: 27.0,
    color: 'Блакитний',
    price_per_day: 1000,
    status_id: 1,
    photo: 'https://ik.imagekit.io/burunduk/nissan_leaf.jpeg'
  },
  {
    name: 'BMW M5 E60',
    body_type_id: 1,
    class_id: 3,
    engine_volume: 5.0,
    horsepower: 507,
    fuel_type_id: 1,
    fuel_consumption: 14.0,
    color: 'Чорний',
    price_per_day: 5500,
    status_id: 2,
    photo: 'https://ik.imagekit.io/burunduk/bmw_m5_e60.jpeg'
  },
  {
    name: 'Ford Focus',
    body_type_id: 1,
    class_id: 2,
    engine_volume: 1.6,
    horsepower: 105,
    fuel_type_id: 1,
    fuel_consumption: 6.8,
    color: 'Синій',
    price_per_day: 850,
    status_id: 1,
    photo: 'https://ik.imagekit.io/burunduk/ford_focus.jpeg'
  },
  {
    name: 'Mercedes CLS AMG',
    body_type_id: 1,
    class_id: 3,
    engine_volume: 5.5,
    horsepower: 585,
    fuel_type_id: 1,
    fuel_consumption: 20.0,
    color: 'Сріблястий',
    price_per_day: 6000,
    status_id: 1,
    photo: 'https://ik.imagekit.io/burunduk/mercedes_cls_amg.jpeg'
  },
  {
    name: 'Tesla Model Y',
    body_type_id: 5,
    class_id: 4,
    engine_volume: 0,
    horsepower: 384,
    fuel_type_id: 5,
    fuel_consumption: 23.0,
    color: 'Білий',
    price_per_day: 4500,
    status_id: 1,
    photo: 'https://ik.imagekit.io/burunduk/tesla_model_y.jpeg'
  },
  {
    name: 'Chevrolet Camaro',
    body_type_id: 4,
    class_id: 3,
    engine_volume: 6.2,
    horsepower: 453,
    fuel_type_id: 1,
    fuel_consumption: 17.0,
    color: 'Жовтий',
    price_per_day: 5500,
    status_id: 1,
    photo: 'https://ik.imagekit.io/burunduk/chevrolet_camaro.jpeg'
  },
  {
    name: 'Audi Q7',
    body_type_id: 5,
    class_id: 4,
    engine_volume: 3.0,
    horsepower: 340,
    fuel_type_id: 1,
    fuel_consumption: 11.5,
    color: 'Сірий',
    price_per_day: 4800,
    status_id: 1,
    photo: 'https://ik.imagekit.io/burunduk/audi_q7.jpeg'
  },
  {
    name: 'VW GOLF IV',
    body_type_id: 3,
    class_id: 1,
    engine_volume: 1.9,
    horsepower: 101,
    fuel_type_id: 3,
    fuel_consumption: 6.8,
    color: 'Сріблястий',
    price_per_day: 600,
    status_id: 1,
    photo: 'https://ik.imagekit.io/burunduk/vw_golf_iv.jpeg'
  },
  {
    name: 'BMW X3 G01',
    body_type_id: 5,
    class_id: 4,
    engine_volume: 2.0,
    horsepower: 252,
    fuel_type_id: 1,
    fuel_consumption: 13.0,
    color: 'Білий',
    price_per_day: 1500,
    status_id: 1,
    photo: 'https://ik.imagekit.io/burunduk/bmw_x3_g01.jpeg'
  }
];

const seedCars = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Delete existing cars
    await Car.deleteMany({});
    console.log('Cleared existing cars');

    // Insert new cars
    await Car.insertMany(carsData);
    console.log('Cars data seeded successfully');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seeder
seedCars(); 