const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const connectDB = require('./config/database');
const { User, BodyType, Class, FuelType, Status, Car, Review, Rental } = require('./models');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Authentication middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'BurundukGarage');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Reference data endpoints
app.get('/api/body-types', auth, async (req, res) => {
  try {
    const bodyTypes = await BodyType.find();
    res.json(bodyTypes);
  } catch (error) {
    console.error('Error fetching body types:', error);
    res.status(500).json({ error: 'Failed to fetch body types' });
  }
});

app.get('/api/classes', auth, async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

app.get('/api/fuel-types', auth, async (req, res) => {
  try {
    const fuelTypes = await FuelType.find();
    res.json(fuelTypes);
  } catch (error) {
    console.error('Error fetching fuel types:', error);
    res.status(500).json({ error: 'Failed to fetch fuel types' });
  }
});

app.get('/api/statuses', auth, async (req, res) => {
  try {
    const statuses = await Status.find();
    res.json(statuses);
  } catch (error) {
    console.error('Error fetching statuses:', error);
    res.status(500).json({ error: 'Failed to fetch statuses' });
  }
});

// Get cars endpoint
app.get('/api/cars', auth, async (req, res) => {
  try {
    let {
      sortBy = 'name',
      order = 'ASC',
      filter = '',
      page = 1,
      limit = 6,
      minPrice,
      maxPrice,
      minEngineVolume,
      maxEngineVolume,
      minHorsepower,
      maxHorsepower,
      bodyType,
      class: carClass,
      fuelType,
      color,
      available
    } = req.query;
    
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 6;
  if (page < 1) page = 1;
  if (limit < 1 || limit > 100) limit = 6;

    const skip = (page - 1) * limit;
    
    const sortOptions = {};
    sortOptions[sortBy] = order.toLowerCase() === 'desc' ? -1 : 1;

    // Build filter query
    const query = {
      name: { $regex: filter, $options: 'i' }
    };

    // Add price range filter
    if (minPrice || maxPrice) {
      query.price_per_day = {};
      if (minPrice) query.price_per_day.$gte = parseFloat(minPrice);
      if (maxPrice) query.price_per_day.$lte = parseFloat(maxPrice);
    }

    // Add engine volume range filter
    if (minEngineVolume || maxEngineVolume) {
      query.engine_volume = {};
      if (minEngineVolume) query.engine_volume.$gte = parseFloat(minEngineVolume);
      if (maxEngineVolume) query.engine_volume.$lte = parseFloat(maxEngineVolume);
    }

    // Add horsepower range filter
    if (minHorsepower || maxHorsepower) {
      query.horsepower = {};
      if (minHorsepower) query.horsepower.$gte = parseInt(minHorsepower);
      if (maxHorsepower) query.horsepower.$lte = parseInt(maxHorsepower);
    }

    // Add reference data filters
    if (bodyType) query.body_type = bodyType;
    if (carClass) query.class = carClass;
    if (fuelType) query.fuel_type = fuelType;

    // Add color filter
    if (color) {
      query.color = { $regex: color, $options: 'i' };
    }

    // Add availability filter
    if (available !== undefined) {
      const status = await Status.findOne({ status: available === 'true' });
      if (status) {
        query.status = status._id;
      }
    }

    const cars = await Car.find(query)
      .populate('body_type')
      .populate('class')
      .populate('fuel_type')
      .populate('status')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});

// Get car by ID endpoint
app.get('/api/cars/:id', auth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('body_type')
      .populate('class')
      .populate('fuel_type')
      .populate('status');

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ error: 'Failed to fetch car details' });
  }
});

// Add car endpoint
app.post('/api/cars', [auth, isAdmin], async (req, res) => {
  try {
    const {
      name,
      body_type_id,
      class_id,
      engine_volume,
      horsepower,
      fuel_type_id,
      fuel_consumption,
      color,
      price_per_day,
      status_id,
      photo
    } = req.body;

    const car = await Car.create({
      name,
      body_type: body_type_id,
      class: class_id,
      engine_volume,
      horsepower,
      fuel_type: fuel_type_id,
      fuel_consumption,
      color,
      price_per_day,
      status: status_id,
      photo
    });

    const populatedCar = await Car.findById(car._id)
      .populate('body_type')
      .populate('class')
      .populate('fuel_type')
      .populate('status');

    res.status(201).json(populatedCar);
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ error: 'Failed to create car' });
  }
});

// Update car endpoint
app.put('/api/cars/:id', [auth, isAdmin], async (req, res) => {
  try {
    const {
      name,
      body_type_id,
      class_id,
      engine_volume,
      horsepower,
      fuel_type_id,
      fuel_consumption,
      color,
      price_per_day,
      status_id,
      photo
    } = req.body;

    const car = await Car.findByIdAndUpdate(
      req.params.id,
      {
        name,
        body_type: body_type_id,
        class: class_id,
        engine_volume,
        horsepower,
        fuel_type: fuel_type_id,
        fuel_consumption,
        color,
        price_per_day,
        status: status_id,
        photo,
        last_modified: Date.now()
      },
      { new: true }
    )
    .populate('body_type')
    .populate('class')
    .populate('fuel_type')
    .populate('status');

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ error: 'Failed to update car' });
  }
});

// Delete car endpoint
app.delete('/api/cars/:id', [auth, isAdmin], async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ error: 'Failed to delete car' });
  }
});

// Get reviews for a car
app.get('/api/cars/:id/reviews', auth, async (req, res) => {
  try {
    console.log('Fetching reviews for car ID:', req.params.id);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error('Invalid MongoDB ObjectId:', req.params.id);
      return res.status(400).json({ error: 'Invalid car ID format' });
    }

    const reviews = await Review.find({ car: req.params.id })
      .populate({
        path: 'client',
        select: 'first_name last_name middle_name'
      })
      .sort({ review_date: -1 });

    console.log('Found reviews:', JSON.stringify(reviews, null, 2));
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Check car availability
app.post('/api/cars/:id/check-availability', auth, async (req, res) => {
  try {
    console.log('Checking availability for car:', req.params.id);
    console.log('Request body:', req.body);
    
    const { startDate, endDate } = req.body;
    const carId = req.params.id;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    console.log('Parsed dates:', { start, end });

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error('Invalid date format received');
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (start >= end) {
      console.error('End date is not after start date');
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Find overlapping rentals
    const overlappingRentals = await Rental.find({
      car_id: carId,
      $or: [
        {
          start_date: { $lte: end },
          end_date: { $gte: start }
        }
      ]
    });

    console.log('Found overlapping rentals:', overlappingRentals);

    if (overlappingRentals.length > 0) {
      // Get the dates that overlap
      const overlappingDates = overlappingRentals.map(rental => ({
        start: rental.start_date,
        end: rental.end_date
      }));

      console.log('Overlapping dates:', overlappingDates);

      return res.status(400).json({
        available: false,
        overlappingDates
      });
    }

    res.json({ available: true });
  } catch (error) {
    console.error('Error checking car availability:', error);
    res.status(500).json({ error: error.message || 'Failed to check car availability' });
  }
});

// Create rental
app.post('/api/rentals', auth, async (req, res) => {
  try {
    console.log('Creating rental with data:', req.body);
    console.log('User from auth:', req.user);

    const { car_id, start_date, end_date, total_price } = req.body;

    // Validate required fields
    if (!car_id || !start_date || !end_date || total_price === undefined) {
      console.error('Missing required fields:', { car_id, start_date, end_date, total_price });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate dates
    const start = new Date(start_date);
    const end = new Date(end_date);

    console.log('Parsed dates:', { start, end });

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error('Invalid date format received');
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (start >= end) {
      console.error('End date is not after start date');
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Validate car exists
    const car = await Car.findById(car_id);
    if (!car) {
      console.error('Car not found:', car_id);
      return res.status(404).json({ error: 'Car not found' });
    }

    console.log('Found car:', car);

    // Check if car is available
    const overlappingRentals = await Rental.find({
      car_id,
      $or: [
        {
          start_date: { $lte: end },
          end_date: { $gte: start }
        }
      ]
    });

    console.log('Found overlapping rentals:', overlappingRentals);

    if (overlappingRentals.length > 0) {
      return res.status(400).json({ error: 'Car is not available for these dates' });
    }

    // Create rental using authenticated user's ID
    const rentalData = {
      client_id: req.user.id, // Use ID from auth token
      car_id,
      start_date: start,
      end_date: end,
      total_price: Number(total_price)
    };

    console.log('Creating rental with data:', rentalData);

    const rental = await Rental.create(rentalData);
    console.log('Created rental:', rental);

    const populatedRental = await Rental.findById(rental._id)
      .populate('car_id')
      .populate('client_id');

    console.log('Populated rental:', populatedRental);

    res.status(201).json(populatedRental);
  } catch (error) {
    console.error('Error creating rental:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Failed to create rental' });
  }
});

// Get rentals
app.get('/api/rentals', auth, async (req, res) => {
  try {
    console.log('Fetching rentals...');
    const rentals = await Rental.find()
      .populate({
        path: 'car_id',
        select: 'name price_per_day'
      })
      .populate({
        path: 'client_id',
        select: 'email first_name last_name'
      })
      .sort({ created_at: -1 });
    
    console.log('Found rentals:', JSON.stringify(rentals, null, 2));
    res.json(rentals);
  } catch (error) {
    console.error('Error fetching rentals:', error);
    res.status(500).json({ error: 'Failed to fetch rentals' });
  }
});

// Update rental
app.put('/api/rentals/:id', auth, async (req, res) => {
  try {
    const rental = await Rental.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    .populate('car_id')
    .populate('client_id');

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    res.json(rental);
  } catch (error) {
    console.error('Error updating rental:', error);
    res.status(500).json({ error: 'Failed to update rental' });
  }
});

// Delete rental
app.delete('/api/rentals/:id', auth, async (req, res) => {
  try {
    const rental = await Rental.findByIdAndDelete(req.params.id);
    
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    res.json({ message: 'Rental deleted successfully' });
  } catch (error) {
    console.error('Error deleting rental:', error);
    res.status(500).json({ error: 'Failed to delete rental' });
  }
});

// Users endpoints
app.get('/api/users', [auth, isAdmin], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/users/:id', [auth, isAdmin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

app.put('/api/users/:id', [auth, isAdmin], async (req, res) => {
  try {
    const { email, first_name, last_name, middle_name, phone_number, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { email, first_name, last_name, middle_name, phone_number, role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', [auth, isAdmin], async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Auth routes
app.post('/api/signup', [
  body('email')
    .trim()
    .isEmail()
    .matches(/^[\w-\.]+@gmail\.com$/)
    .withMessage('Email must be a valid Gmail address'),
  body('password').isLength({ min: 6 }),
  body('phone_number').notEmpty().withMessage('Phone number is required'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('middle_name').notEmpty().withMessage('Middle name is required'),
  body('role').isIn(['admin', 'user'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, phone_number, first_name, last_name, middle_name, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      phone_number,
      first_name,
      last_name,
      middle_name,
      role
    });

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        middle_name: user.middle_name,
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return full user information (excluding password)
    const userResponse = {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      middle_name: user.middle_name,
      role: user.role
    };

    res.status(201).json({ token, user: userResponse });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', [
  body('email').trim().notEmpty(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        middle_name: user.middle_name,
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return full user information (excluding password)
    const userResponse = {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      middle_name: user.middle_name,
      role: user.role
    };

    res.json({ token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Token verification endpoint
app.get('/api/verify-token', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    res.json({ 
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        middle_name: user.middle_name,
        role: user.role
      } 
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
