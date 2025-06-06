const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../BurundukGarage.sqlite');

// Database schema configuration
const tableConfigs = {
    'Users': {
        sql: `CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        defaultData: async () => ([
            { username: 'admin', password: await bcrypt.hash('admin123', 10), role: 'admin' },
            { username: 'user', password: await bcrypt.hash('user123', 10), role: 'user' }
        ])
    },
    'Body_types': {
        sql: `CREATE TABLE IF NOT EXISTS Body_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type_name TEXT NOT NULL UNIQUE
        )`,
        defaultData: () => ['Седан', 'Універсал', 'Хетчбек', 'Купе', 'SUV'].map(type => ({ type_name: type }))
    },
    'Classes': {
        sql: `CREATE TABLE IF NOT EXISTS Classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_name TEXT NOT NULL UNIQUE
        )`,
        defaultData: () => ['Економ', 'Комфорт', 'Бізнес', 'Преміум', 'Спорт'].map(name => ({ class_name: name }))
    },
    'Fuel_types': {
        sql: `CREATE TABLE IF NOT EXISTS Fuel_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fuel_type TEXT NOT NULL UNIQUE
        )`,
        defaultData: () => ['Бензин', 'Дизель', 'Газ', 'Електро', 'Гібрид'].map(type => ({ fuel_type: type }))
    },
    'Statuses': {
        sql: `CREATE TABLE IF NOT EXISTS Statuses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            status BOOLEAN NOT NULL UNIQUE
        )`,
        defaultData: () => [{ status: 1 }, { status: 0 }]
    },
    'Cars': {
        sql: `CREATE TABLE IF NOT EXISTS Cars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            body_type_id INTEGER,
            class_id INTEGER,
            engine_volume REAL,
            horsepower INTEGER,
            fuel_type_id INTEGER,
            fuel_consumption REAL,
            color TEXT,
            price_per_day REAL NOT NULL,
            status_id INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (body_type_id) REFERENCES Body_types(id),
            FOREIGN KEY (class_id) REFERENCES Classes(id),
            FOREIGN KEY (fuel_type_id) REFERENCES Fuel_types(id),
            FOREIGN KEY (status_id) REFERENCES Statuses(id)
        )`
    }
};

async function initializeDatabase() {
    const db = new sqlite3.Database(dbPath);
    
    try {
        // Enable foreign keys
        await runQuery(db, 'PRAGMA foreign_keys = ON');

        // Initialize tables and their data
        for (const [tableName, config] of Object.entries(tableConfigs)) {
            console.log(`Initializing ${tableName}...`);
            
            // Create table
            await runQuery(db, config.sql);
            
            // Insert default data if provided
            if (config.defaultData) {
                const data = await config.defaultData();
                if (data.length > 0) {
                    const columns = Object.keys(data[0]).join(', ');
                    const placeholders = Object.keys(data[0]).map(() => '?').join(', ');
                    
                    for (const item of data) {
                        const values = Object.values(item);
                        const sql = `INSERT OR IGNORE INTO ${tableName} (${columns}) VALUES (${placeholders})`;
                        await runQuery(db, sql, values);
                    }
                }
            }
        }

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    } finally {
        db.close();
    }
}

function runQuery(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

// Run initialization if this file is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = {
    initializeDatabase,
    dbPath
}; 