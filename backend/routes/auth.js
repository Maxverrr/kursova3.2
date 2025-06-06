const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Input validation middleware
const validateSignup = [
    body('email').isLength({ min: 3 }).trim().escape(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['user', 'admin'])
];

const validateLogin = [
    body('email').trim().escape(),
    body('password').exists()
];

module.exports = (db) => {
    // Signup endpoint
    router.post('/signup', validateSignup, async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password, role } = req.body;

            // Check if email already exists
            const existingUser = await new Promise((resolve, reject) => {
                db.get('SELECT id FROM Users WHERE email = ?', [email], (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                });
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Email already exists' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insert new user
            const result = await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO Users (username, password, role) VALUES (?, ?, ?)',
                    [username, hashedPassword, role],
                    function(err) {
                        if (err) reject(err);
                        resolve(this);
                    }
                );
            });

            // Generate token
            const token = jwt.sign(
                { id: result.lastID, email, role },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({ token });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Login endpoint
    router.post('/login', validateLogin, async (req, res) => {
        console.log('Login attempt:', req.body);
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('Validation errors:', errors.array());
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, password } = req.body;
            console.log('Attempting login for username:', username);

            // Get user
            const user = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM Users WHERE username = ?', [username], (err, row) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(err);
                    }
                    console.log('Found user:', row);
                    resolve(row);
                });
            });

            if (!user) {
                console.log('User not found');
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            console.log('Password match:', isMatch);
            
            if (!isMatch) {
                console.log('Invalid password');
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Generate token
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log('Login successful, token generated');
            res.json({ token });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    });

    return router;
}; 