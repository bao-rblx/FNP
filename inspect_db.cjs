const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'data', 'fnp.sqlite'));

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Tables:", tables.map(t => t.name).join(', '));

const userSchema = db.prepare("SELECT sql FROM sqlite_master WHERE name='users'").get();
console.log("\nUsers Schema:\n", userSchema.sql);

const orderSchema = db.prepare("SELECT sql FROM sqlite_master WHERE name='orders'").get();
console.log("\nOrders Schema:\n", orderSchema.sql);

const firstUser = db.prepare("SELECT id, name, email, points, rank FROM users LIMIT 1").get();
console.log("\nFirst User:", firstUser);
