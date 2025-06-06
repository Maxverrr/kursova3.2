const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../BurundukGarage.sqlite');
const db = new sqlite3.Database(dbPath);

async function listTables() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT name FROM sqlite_master WHERE type='table'`, [], (err, rows) => {
      if (err) {
        console.error('Error getting tables:', err);
        reject(err);
      } else {
        console.log('\nExisting tables:');
        rows.forEach(row => console.log(`  ${row.name}`));
        resolve(rows.map(r => r.name));
      }
    });
  });
}

async function checkTableStructure(tableName) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName})`, [], (err, rows) => {
      if (err) {
        console.error(`Error getting structure for ${tableName}:`, err);
        reject(err);
      } else {
        console.log(`\nTable: ${tableName}`);
        console.log('Columns:');
        rows.forEach(row => {
          console.log(`  ${row.name} (${row.type})${row.notnull ? ' NOT NULL' : ''}`);
        });
        resolve(rows);
      }
    });
  });
}

async function main() {
  try {
    const tables = await listTables();
    
    for (const table of ['Clients', 'Rentals', 'Reviews']) {
      if (tables.includes(table)) {
        await checkTableStructure(table);
      } else {
        console.log(`\nTable ${table} does not exist in the database`);
      }
    }
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 