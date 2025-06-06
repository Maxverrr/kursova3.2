const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { dbPath } = require('../db/init');
const sqlite3 = require('sqlite3').verbose();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Should be in env in production
const TOKEN_EXPIRY = '24h';

// Database helper
const getDb = () => new sqlite3.Database(dbPath);

// Query helper
const runQuery = (db, sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// Middleware for protected routes
const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Middleware for admin-only routes
const adminMiddleware = (req, res, next) => {
    if (req.user?.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

// Authentication service
class AuthService {
    static async login(username, password) {
        const db = getDb();
        try {
            const users = await runQuery(db, 'SELECT * FROM Users WHERE username = ?', [username]);
            const user = users[0];

            if (!user || !(await bcrypt.compare(password, user.password))) {
                throw new Error('Invalid credentials');
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: TOKEN_EXPIRY }
            );

            return { token, user: { id: user.id, username: user.username, role: user.role } };
        } finally {
            db.close();
        }
    }

    static async register(username, password, role = 'user') {
        const db = getDb();
        try {
            // Check if username exists
            const existing = await runQuery(db, 'SELECT 1 FROM Users WHERE username = ?', [username]);
            if (existing.length > 0) {
                throw new Error('Username already exists');
            }

            // Hash password and create user
            const hashedPassword = await bcrypt.hash(password, 10);
            await runQuery(
                db,
                'INSERT INTO Users (username, password, role) VALUES (?, ?, ?)',
                [username, hashedPassword, role]
            );

            // Get created user
            const users = await runQuery(
                db,
                'SELECT id, username, role FROM Users WHERE username = ?',
                [username]
            );
            const user = users[0];

            // Generate token
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: TOKEN_EXPIRY }
            );

            return { token, user };
        } finally {
            db.close();
        }
    }

    static async validateToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch {
            return null;
        }
    }
}

module.exports = {
    AuthService,
    authMiddleware,
    adminMiddleware,
    JWT_SECRET
}; 