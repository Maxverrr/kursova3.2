const mongoose = require('mongoose');
const { Schema } = mongoose;

const carSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  bodytype: {
    type: Schema.Types.ObjectId,
    ref: 'BodyType',
    required: true
  },
  class: {
    type: Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  engine_volume: {
    type: Number,
    required: true
  },
  horsepower: {
    type: Number,
    required: true
  },
  fueltype: {
    type: Schema.Types.ObjectId,
    ref: 'FuelType',
    required: true
  },
  fuel_consumption: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  price_per_day: {
    type: Number,
    required: true
  },
  status: {
    type: Schema.Types.ObjectId,
    ref: 'Status',
    required: true
  },
  photo: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Car', carSchema); 