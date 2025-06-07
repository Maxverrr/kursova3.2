const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const connectDB = require('./config/database');
const { User, BodyType, Class, FuelType, Status, Car, Review, Rental } = require('./models');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors({
  origin: ['https://car-rental-frontend-three.vercel.app', 'http://localhost:5173', 'https://kursova3-2.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Add headers for all responses
app.use((req, res, next) => {
  const allowedOrigins = ['https://car-rental-frontend-three.vercel.app', 'http://localhost:5173', 'https://kursova3-2.onrender.com'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).json({
      body: "OK"
    });
  }
  
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Connect to MongoDB
console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', port);

connectDB()
  .then(() => {
    console.log('Database connected successfully');
    
    // Base route for testing
    app.get('/', (req, res) => {
      res.json({ 
        message: 'API is working',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      });
    });

    // Test database connection route
    app.get('/api/health', async (req, res) => {
      try {
        const dbState = mongoose.connection.readyState;
        const dbStatus = {
          0: 'disconnected',
          1: 'connected',
          2: 'connecting',
          3: 'disconnecting'
        };
        
        res.json({
          status: 'ok',
          database: dbStatus[dbState],
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API routes
    const router = express.Router();

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
    router.get('/body-types', auth, async (req, res) => {
      try {
        const bodyTypes = await BodyType.find();
        res.json(bodyTypes);
      } catch (error) {
        console.error('Error fetching body types:', error);
        res.status(500).json({ error: 'Failed to fetch body types' });
      }
    });

    router.get('/classes', auth, async (req, res) => {
      try {
        const classes = await Class.find();
        res.json(classes);
      } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ error: 'Failed to fetch classes' });
      }
    });

    router.get('/fuel-types', auth, async (req, res) => {
      try {
        const fuelTypes = await FuelType.find();
        res.json(fuelTypes);
      } catch (error) {
        console.error('Error fetching fuel types:', error);
        res.status(500).json({ error: 'Failed to fetch fuel types' });
      }
    });

    router.get('/statuses', auth, async (req, res) => {
      try {
        const statuses = await Status.find();
        res.json(statuses);
      } catch (error) {
        console.error('Error fetching statuses:', error);
        res.status(500).json({ error: 'Failed to fetch statuses' });
      }
    });

    // Get cars endpoint
    router.get('/cars', auth, async (req, res) => {
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
    router.get('/cars/:id', auth, async (req, res) => {
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
    router.post('/cars', [auth, isAdmin], async (req, res) => {
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
    router.put('/cars/:id', [auth, isAdmin], async (req, res) => {
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
    router.delete('/cars/:id', [auth, isAdmin], async (req, res) => {
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
    router.get('/cars/:id/reviews', auth, async (req, res) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(400).json({ error: 'Invalid car ID format' });
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

    // Create review for a car
    router.post('/cars/:id/reviews', auth, async (req, res) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(400).json({ error: 'Invalid car ID format' });
        }

        const { comment } = req.body;
        if (!comment) {
          return res.status(400).json({ error: 'Comment is required' });
        }

        const car = await Car.findById(req.params.id);
        if (!car) {
          return res.status(404).json({ error: 'Car not found' });
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
    router.post('/cars/:id/check-availability', auth, async (req, res) => {
      try {
        const { startDate, endDate } = req.body;
        const carId = req.params.id;

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return res.status(400).json({ error: 'Invalid date format' });
        }

        if (start >= end) {
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
    router.post('/rentals', auth, async (req, res) => {
      try {
        const { car_id, start_date, end_date, total_price } = req.body;

        if (!car_id || !start_date || !end_date || total_price === undefined) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const start = new Date(start_date);
        const end = new Date(end_date);

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
          return res.status(400).json({ error: 'Invalid date range' });
        }

        const car = await Car.findById(car_id);
        if (!car) {
          return res.status(404).json({ error: 'Car not found' });
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
          return res.status(400).json({ error: 'Car is not available for these dates' });
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
    router.get('/rentals', auth, async (req, res) => {
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
    router.put('/rentals/:id', auth, async (req, res) => {
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
    router.delete('/rentals/:id', auth, async (req, res) => {
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
    router.get('/users', [auth, isAdmin], async (req, res) => {
      try {
        const users = await User.find().select('-password');
        res.json(users);
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
      }
    });

    router.get('/users/:id', [auth, isAdmin], async (req, res) => {
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

    router.put('/users/:id', [auth, isAdmin], async (req, res) => {
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

    router.delete('/users/:id', [auth, isAdmin], async (req, res) => {
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
    router.post('/signup', [
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

    router.post('/login', [
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
    router.get('/verify-token', auth, async (req, res) => {
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

    // Delete review endpoint
    router.delete('/reviews/:reviewId', auth, async (req, res) => {
      try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) {
          return res.status(404).json({ error: 'Review not found' });
        }

        // Only author or admin can delete
        if (review.client.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({ error: 'Access denied' });
        }

        await Review.findByIdAndDelete(req.params.reviewId);
        res.json({ message: 'Review deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete review' });
      }
    });

    // Mount all routes under /api
    app.use('/api', router);

    // 404 handler
    app.use((req, res) => {
      console.log('404 Not Found:', req.method, req.url);
      res.status(404).json({ 
        error: 'Not Found',
        path: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });

    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://kursova2-2.onrender.com'
        : `http://localhost:${port}`;
      console.log(`Test the API at: ${baseUrl}/api/health`);
    });
  })
  .catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
