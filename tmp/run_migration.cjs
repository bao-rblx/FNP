const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve('data', 'fnp.sqlite');
console.log('Running migration on:', dbPath);
const db = new Database(dbPath);

try {
  const uInfo = db.prepare(`PRAGMA table_info(users)`).all();
  const emailColInfo = uInfo.find(c => c.name === 'email');
  
  if (emailColInfo && emailColInfo.notnull === 1) {
    console.log('[fnp-api] Migration: Making email nullable in users table...');
    db.transaction(() => {
      db.exec(`
        CREATE TABLE users_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE COLLATE NOCASE,
          phone TEXT UNIQUE,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          student_id TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
          points INTEGER NOT NULL DEFAULT 0,
          rank TEXT NOT NULL DEFAULT 'bronze' CHECK (rank IN ('bronze', 'silver', 'gold', 'platinum')),
          reset_token TEXT,
          reset_expires TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          last_login_at TEXT
        );
        INSERT INTO users_new (id, email, phone, password_hash, name, student_id, role, points, rank, reset_token, reset_expires, created_at, last_login_at)
        SELECT id, email, phone, password_hash, name, student_id, role, points, rank, reset_token, reset_expires, created_at, last_login_at FROM users;
        DROP TABLE users;
        ALTER TABLE users_new RENAME TO users;
        CREATE INDEX idx_users_email ON users(email);
        CREATE UNIQUE INDEX idx_users_phone ON users(phone);
      `);
    })();
    console.log('[fnp-api] Migration complete.');
  } else {
    console.log('[fnp-api] Migration skipped (already nullable or not found).');
  }
} catch (e) {
  console.error('Migration failed:', e);
} finally {
  db.close();
}
