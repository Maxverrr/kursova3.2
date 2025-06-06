const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Log the database path
const dbPath = path.resolve(__dirname, 'BurundukGarage.sqlite');
console.log('Initializing database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
    console.error('Failed to open database:', err);
    process.exit(1);
  }
  });

// Helper function to run SQL safely
const runSQL = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
    if (err) {
        console.error('SQL Error:', err);
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

// Helper function to check if table exists
const tableExists = (tableName) => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName],
      (err, row) => {
        if (err) reject(err);
        resolve(!!row);
      }
    );
  });
};

// Helper function to check and fix table data
const checkAndFixTableData = async (tableName, defaultData, columnName) => {
  try {
    // Check if table exists
    const exists = await tableExists(tableName);
    if (!exists) {
      console.log(`Table ${tableName} doesn't exist, will be created`);
      return false;
    }

    // Get current data
    const rows = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    // Check for data issues
    let hasIssues = false;
    if (rows.length === 0) {
      hasIssues = true;
    } else {
      // Check for duplicate IDs or missing data
      const ids = rows.map(r => r.id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        hasIssues = true;
        console.log(`Found duplicate IDs in ${tableName}`);
      }
    }

    if (hasIssues) {
      // Drop and recreate table
      await runSQL(`DROP TABLE IF EXISTS ${tableName}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Error checking ${tableName}:`, err);
    return false;
  }
};

async function initializeDatabase() {
  try {
    // Enable foreign keys
    await runSQL('PRAGMA foreign_keys = ON');
    
    // First, check and fix any data issues
    const tables = ['Body_types', 'Classes', 'Fuel_types', 'Statuses'];
    for (const table of tables) {
      console.log(`Checking ${table} for data issues...`);
      const rows = await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });

      if (rows.length > 0) {
        // Check for duplicate IDs
        const ids = rows.map(r => r.id);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
          console.log(`Found duplicate IDs in ${table}, recreating table...`);
          await runSQL(`DROP TABLE IF EXISTS ${table}`);
        }
      }
    }
    
    // Now create/update tables
    const tableConfigs = {
      'Body_types': {
        sql: `CREATE TABLE IF NOT EXISTS Body_types (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type_name TEXT NOT NULL UNIQUE
        )`,
        data: ['Седан', 'Універсал', 'Хетчбек', 'Купе', 'SUV'],
        column: 'type_name'
      },
      'Classes': {
        sql: `CREATE TABLE IF NOT EXISTS Classes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          class_name TEXT NOT NULL UNIQUE
        )`,
        data: ['Економ', 'Комфорт', 'Бізнес', 'Преміум', 'Спорт'],
        column: 'class_name'
      },
      'Fuel_types': {
        sql: `CREATE TABLE IF NOT EXISTS Fuel_types (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fuel_type TEXT NOT NULL UNIQUE
        )`,
        data: ['Бензин', 'Дизель', 'Газ', 'Електро', 'Гібрид'],
        column: 'fuel_type'
      },
      'Statuses': {
        sql: `CREATE TABLE IF NOT EXISTS Statuses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          status BOOLEAN NOT NULL UNIQUE
        )`,
        data: null
      }
    };

    // Process each table
    for (const [tableName, config] of Object.entries(tableConfigs)) {
      console.log(`Processing ${tableName}...`);
      
      // Create table
      await runSQL(config.sql);
      console.log(`Ensured table ${tableName} exists`);

      // Check if table is empty
      const count = await new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) as count FROM ${tableName}`, [], (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
  });
});

      if (count === 0) {
        // Insert data if provided
        if (config.data) {
          for (const item of config.data) {
            await runSQL(`INSERT INTO ${tableName} (${config.column}) VALUES (?)`, [item]);
          }
          console.log(`Inserted default data into ${tableName}`);
        } else if (tableName === 'Statuses') {
          // Special case for Statuses table
          await runSQL('INSERT INTO Statuses (id, status) VALUES (1, 1), (2, 0)');
          console.log('Inserted default statuses');
        }
      } else {
        console.log(`Table ${tableName} already has ${count} rows`);
      }
    }

    // Create Cars table last (due to foreign keys)
    await runSQL(`
      CREATE TABLE IF NOT EXISTS Cars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        body_type_id INTEGER,
        class_id INTEGER,
        engine_volume REAL,
        horsepower INTEGER,
        fuel_type_id INTEGER,
        fuel_consumption REAL,
        color TEXT NOT NULL,
        price_per_day REAL NOT NULL,
        status_id INTEGER DEFAULT 1,
        photo BLOB,
        last_modified DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (body_type_id) REFERENCES Body_types(id),
        FOREIGN KEY (class_id) REFERENCES Classes(id),
        FOREIGN KEY (fuel_type_id) REFERENCES Fuel_types(id),
        FOREIGN KEY (status_id) REFERENCES Statuses(id)
      )
    `);

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

initializeDatabase(); 