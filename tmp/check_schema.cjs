const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve('data', 'fnp.sqlite');
console.log('Checking DB at:', dbPath);
const db = new Database(dbPath);
const info = db.prepare('PRAGMA table_info(users)').all();
console.log('Users Schema:', info);
db.close();
