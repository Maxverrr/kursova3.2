const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const connectDB = require('./config/database');
const { User, BodyType, Class, FuelType, Status, Car, Review, Rental } = require('./models');
const mongoose = require('mongoose');
const { uploadImageFromUrl } = require('./utils/imageKit');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'https://burundukgarage.vercel.app',
    'https://kursova3-2.onrender.com',
    'http://localhost:5173', // For local development
    'http://localhost:3000'  // For local development
  ],
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
    return res.status(401).json({ error: 'Токен не надано' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'BurundukGarage');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Недійсний токен' });
  }
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Потрібні права адміністратора' });
  }
  next();
};

// Public reference data endpoints
app.get('/api/body-types', async (req, res) => {
  try {
    const bodyTypes = await BodyType.find();
    res.json(bodyTypes);
  } catch (error) {
    console.error('Помилка отримання типів кузова:', error);
    res.status(500).json({ error: 'Не вдалося отримати типи кузова' });
  }
});

app.get('/api/classes', async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    console.error('Помилка отримання класів:', error);
    res.status(500).json({ error: 'Не вдалося отримати класи' });
  }
});

app.get('/api/fuel-types', async (req, res) => {
  try {
    const fuelTypes = await FuelType.find();
    res.json(fuelTypes);
  } catch (error) {
    console.error('Помилка отримання типів палива:', error);
    res.status(500).json({ error: 'Не вдалося отримати типи палива' });
  }
});

app.get('/api/statuses', async (req, res) => {
  try {
    const statuses = await Status.find();
    res.json(statuses);
  } catch (error) {
    console.error('Помилка отримання статусів:', error);
    res.status(500).json({ error: 'Не вдалося отримати статуси' });
  }
});

// Public cars endpoints
app.get('/api/cars', async (req, res) => {
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

// Public car details endpoint
app.get('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate('body_type')
      .populate('class')
      .populate('fuel_type')
      .populate('status');

    if (!car) {
      return res.status(404).json({ error: 'Автомобіль не знайдено' });
    }

    res.json(car);
  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ error: 'Failed to fetch car' });
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

    // Upload image to ImageKit
    let imagekitUrl;
    try {
      const fileName = `${name.replace(/\s+/g, '-')}-${Date.now()}`;
      imagekitUrl = await uploadImageFromUrl(photo, fileName);
    } catch (error) {
      console.error('Помилка завантаження в ImageKit:', error);
      return res.status(500).json({ error: 'Не вдалося завантажити зображення в ImageKit' });
    }

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
      photo: imagekitUrl
    });

    const populatedCar = await Car.findById(car._id)
      .populate('body_type')
      .populate('class')
      .populate('fuel_type')
      .populate('status');

    res.status(201).json(populatedCar);
  } catch (error) {
    console.error('Помилка створення автомобіля:', error);
    res.status(500).json({ error: 'Не вдалося створити автомобіль' });
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

    // Upload image to ImageKit if photo URL has changed
    let imagekitUrl = photo;
    const existingCar = await Car.findById(req.params.id);
    if (existingCar && existingCar.photo !== photo) {
      try {
        const fileName = `${name.replace(/\s+/g, '-')}-${Date.now()}`;
        imagekitUrl = await uploadImageFromUrl(photo, fileName);
      } catch (error) {
        console.error('Помилка завантаження в ImageKit:', error);
        return res.status(500).json({ error: 'Не вдалося завантажити зображення в ImageKit' });
      }
    }

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
        photo: imagekitUrl,
        last_modified: Date.now()
      },
      { new: true }
    )
    .populate('body_type')
    .populate('class')
    .populate('fuel_type')
    .populate('status');

    if (!car) {
      return res.status(404).json({ error: 'Автомобіль не знайдено' });
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
      return res.status(404).json({ error: 'Автомобіль не знайдено' });
    }

    res.json({ message: 'Автомобіль успішно видалено' });
  } catch (error) {
    console.error('Помилка видалення автомобіля:', error);
    res.status(500).json({ error: 'Не вдалося видалити автомобіль' });
  }
});

// Get reviews for a car
app.get('/api/cars/:id/reviews', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Неправильний формат ID автомобіля' });
    }

    const reviews = await Review.find({ car: req.params.id })
      .populate({
        path: 'client',
        select: 'first_name last_name middle_name'
      })
      .sort({ review_date: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create review for a car (requires authentication)
app.post('/api/cars/:id/reviews', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Неправильний формат ID автомобіля' });
    }

    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({ error: 'Коментар є обов\'язковим' });
    }

    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: 'Автомобіль не знайдено' });
    }

    const review = await Review.create({
      client: req.user.id,
      car: req.params.id,
      car_name: car.name,
      comment,
      review_date: new Date()
    });

    const populatedReview = await Review.findById(review._id)
      .populate({
        path: 'client',
        select: 'first_name last_name middle_name'
      });

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Check car availability
app.post('/api/cars/:id/check-availability', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const carId = req.params.id;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Неправильний формат дати' });
    }

    if (start >= end) {
      return res.status(400).json({ error: 'Дата закінчення має бути пізніше дати початку' });
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

    if (overlappingRentals.length > 0) {
      // Get the dates that overlap
      const overlappingDates = overlappingRentals.map(rental => ({
        start: rental.start_date,
        end: rental.end_date
      }));

      return res.status(400).json({
        available: false,
        overlappingDates
      });
    }

    res.json({ available: true });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to check car availability' });
  }
});

// Create rental
app.post('/api/rentals', auth, async (req, res) => {
  try {
    const { car_id, start_date, end_date, total_price } = req.body;

    if (!car_id || !start_date || !end_date || total_price === undefined) {
      return res.status(400).json({ error: 'Відсутні обов\'язкові поля' });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return res.status(400).json({ error: 'Неправильний діапазон дат' });
    }

    const car = await Car.findById(car_id);
    if (!car) {
      return res.status(404).json({ error: 'Автомобіль не знайдено' });
    }

    const overlappingRentals = await Rental.find({
      car_id,
      $or: [
        {
          start_date: { $lte: end },
          end_date: { $gte: start }
        }
      ]
    });

    if (overlappingRentals.length > 0) {
      return res.status(400).json({ error: 'Автомобіль недоступний на ці дати' });
    }

    const rental = await Rental.create({
      client_id: req.user.id,
      car_id,
      start_date: start,
      end_date: end,
      total_price: Number(total_price)
    });

    const populatedRental = await Rental.findById(rental._id)
      .populate('car_id')
      .populate('client_id');

    res.status(201).json(populatedRental);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create rental' });
  }
});

// Get rentals
app.get('/api/rentals', auth, async (req, res) => {
  try {
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
    
    res.json(rentals);
  } catch (error) {
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
      return res.status(404).json({ error: 'Оренду не знайдено' });
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
      return res.status(404).json({ error: 'Оренду не знайдено' });
    }

    res.json({ message: 'Оренду успішно видалено' });
  } catch (error) {
    console.error('Помилка видалення оренди:', error);
    res.status(500).json({ error: 'Не вдалося видалити оренду' });
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
      return res.status(404).json({ error: 'Користувача не знайдено' });
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
      return res.status(404).json({ error: 'Користувача не знайдено' });
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
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    res.json({ message: 'Користувача успішно видалено' });
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
    .withMessage('Email must be a valid email address'),
  body('password').isLength({ min: 6 }),
  body('first_name').notEmpty(),
  body('last_name').notEmpty(),
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
      return res.status(400).json({ error: 'Користувач з такою електронною поштою вже існує' });
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
      return res.status(400).json({ error: 'Неправильні облікові дані' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Неправильні облікові дані' });
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
    res.status(500).json({ error: 'Server error' });
  }
});

// Token verification endpoint
app.get('/api/verify-token', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Користувача не знайдено' });
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

// Delete review endpoint
app.delete('/api/reviews/:reviewId', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Відгук не знайдено' });
    }

    // Only author or admin can delete
    if (review.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ заборонено' });
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    res.json({ message: 'Відгук успішно видалено' });
  } catch (error) {
    res.status(500).json({ error: 'Не вдалося видалити відгук' });
  }
});

app.get('/', (req, res) => {
    res.send('API BurundukGarage працює!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
