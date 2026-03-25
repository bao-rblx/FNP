import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'server', 'data.sqlite');
console.log('Opening DB at', dbPath);
const db = new Database(dbPath, { timeout: 10000 });
db.exec("UPDATE users SET role = 'admin'");
console.log('All users upgraded to admin.');
