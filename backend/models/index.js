const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, match: /^[\w-\.]+@gmail\.com$/ },
  password: { type: String, required: true },
  phone_number: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  middle_name: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'user'] },
  created_at: { type: Date, default: Date.now }
});

// Body Type Schema
const bodyTypeSchema = new mongoose.Schema({
  type_name: { type: String, required: true, unique: true }
});

// Class Schema
const classSchema = new mongoose.Schema({
  class_name: { type: String, required: true, unique: true }
});

// Fuel Type Schema
const fuelTypeSchema = new mongoose.Schema({
  fuel_type: { type: String, required: true, unique: true }
});

// Status Schema
const statusSchema = new mongoose.Schema({
  status: { type: Boolean, required: true, unique: true }
});

// Rental Schema
const rentalSchema = new mongoose.Schema({
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  car_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  total_price: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  car_name: { type: String },
  comment: { type: String },
  review_date: { type: Date }
});

// Car Schema
const carSchema = new mongoose.Schema({
  name: { type: String, required: true },
  body_type: { type: mongoose.Schema.Types.ObjectId, ref: 'BodyType' },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  engine_volume: { type: Number },
  horsepower: { type: Number },
  fuel_type: { type: mongoose.Schema.Types.ObjectId, ref: 'FuelType' },
  fuel_consumption: { type: String },
  color: { type: String, required: true },
  price_per_day: { type: Number, required: true },
  status: { type: mongoose.Schema.Types.ObjectId, ref: 'Status', default: null },
  photo: { type: String },
  last_modified: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const BodyType = mongoose.model('BodyType', bodyTypeSchema);
const Class = mongoose.model('Class', classSchema);
const FuelType = mongoose.model('FuelType', fuelTypeSchema);
const Status = mongoose.model('Status', statusSchema);
const Car = mongoose.model('Car', carSchema);
const Rental = mongoose.model('Rental', rentalSchema);
const Review = mongoose.model('Review', reviewSchema);

module.exports = {
  User,
  BodyType,
  Class,
  FuelType,
  Status,
  Car,
  Rental,
  Review
}; 