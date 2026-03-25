/**
 * FlashNPrint API — SQLite + JWT + rate limits + support chat
 */
import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });

const PORT = Number(process.env.PORT) || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-change-me';
const DB_PATH = process.env.SQLITE_PATH || path.join(rootDir, 'data', 'fnp.sqlite');

const MAX_CHAT_BODY = 2000;
const MAX_ORDER_ITEMS = 50;
const MAX_SUPPORT_POLL = 200;

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '512kb' }));

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_GLOBAL_PER_MIN) || 100,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH_PER_15M) || 25,
  standardHeaders: true,
  legacyHeaders: false,
});
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_WRITE_PER_MIN) || 40,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', globalLimiter);

function initDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      student_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','ready','completed','cancelled')),
      total INTEGER NOT NULL,
      delivery_address TEXT,
      pickup_location TEXT,
      payment_method TEXT,
      items_json TEXT NOT NULL,
      estimated_time TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS support_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      order_id TEXT,
      from_admin INTEGER NOT NULL CHECK (from_admin IN (0, 1)),
      body TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_order ON order_notifications(order_id);
    CREATE INDEX IF NOT EXISTS idx_support_user ON support_messages(user_id);
    CREATE INDEX IF NOT EXISTS idx_support_from ON support_messages(from_admin);
  `);

  const ucols = db.prepare(`PRAGMA table_info(users)`).all().map((c) => c.name);
  if (!ucols.includes('last_login_at')) {
    try {
      db.exec(`ALTER TABLE users ADD COLUMN last_login_at TEXT`);
    } catch (_) {}
  }

  const ocols = db.prepare(`PRAGMA table_info(orders)`).all().map((c) => c.name);
  if (!ocols.includes('cancel_reason')) {
    try {
      db.exec(`ALTER TABLE orders ADD COLUMN cancel_reason TEXT`);
    } catch (_) {}
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@vanlanguni.vn').trim().toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || 'admin';
  const hash = bcrypt.hashSync(adminPass, 10);
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (!exists) {
    db.prepare(
      `INSERT INTO users (email, password_hash, name, student_id, role) VALUES (?,?,?,?, 'admin')`,
    ).run(adminEmail, hash, 'Store Admin', '0');
    console.log(`[fnp-api] Seeded admin user: ${adminEmail} (set ADMIN_PASSWORD in .env)`);
  } else {
    db.prepare(`UPDATE users SET password_hash = ?, role = 'admin' WHERE email = ?`).run(hash, adminEmail);
    console.log(`[fnp-api] Enforced password and admin role for: ${adminEmail}`);
  }

  try {
    db.prepare(`UPDATE users SET role = 'user' WHERE email = 'huythepro2121@gmail.com'`).run();
    db.prepare(`UPDATE users SET role = 'user' WHERE email = 'basicallybao1401@vanlanguni.vn'`).run();
    console.log(`[fnp-api] Cleaned up admin roles for test accounts.`);
  } catch (e) {}

  return db;
}

const db = initDb();

const VANLANG = '@vanlanguni.vn';

function isVanLangEmail(email) {
  return typeof email === 'string' && email.trim().toLowerCase().endsWith(VANLANG);
}

function isDigitsOnly(s) {
  return typeof s === 'string' && /^\d+$/.test(s.trim());
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  const token = h?.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
    };
  } catch {
    req.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user?.id) return res.status(401).json({ error: 'unauthorized' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user?.id || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden' });
  }
  next();
}

function userDto(row, stats) {
  return {
    id: row.id,
    name: row.name,
    schoolEmail: row.email,
    studentId: row.student_id,
    role: row.role,
    lastLoginAt: row.last_login_at || null,
    createdAt: row.created_at || null,
    orderCount: stats?.orderCount ?? 0,
    totalSpent: stats?.totalSpent ?? 0,
  };
}

function statsForUser(userId) {
  const s = db
    .prepare(
      `SELECT COUNT(*) as c, COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END), 0) as spent
       FROM orders WHERE user_id = ?`,
    )
    .get(userId);
  return { orderCount: s.c, totalSpent: s.spent };
}

app.use(authMiddleware);

app.post('/api/auth/register', authLimiter, (req, res) => {
  const { name, schoolEmail, studentId, password } = req.body || {};
  if (!name?.trim() || !schoolEmail || !studentId || !password) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  const email = schoolEmail.trim().toLowerCase();
  if (!isVanLangEmail(email)) return res.status(400).json({ error: 'invalid_email_domain' });
  if (!isDigitsOnly(studentId)) return res.status(400).json({ error: 'invalid_student_id' });
  if (password.length < 4) return res.status(400).json({ error: 'weak_password' });

  try {
    const hash = bcrypt.hashSync(password, 10);
    const info = db
      .prepare(
        `INSERT INTO users (email, password_hash, name, student_id, role) VALUES (?,?,?,?, 'user')`,
      )
      .run(email, hash, name.trim(), studentId.trim());
    const user = db
      .prepare(`SELECT id, email, name, student_id, role, last_login_at, created_at FROM users WHERE id = ?`)
      .get(info.lastInsertRowid);
    db.prepare(`UPDATE users SET last_login_at = datetime('now') WHERE id = ?`).run(user.id);
    const refreshed = db
      .prepare(`SELECT id, email, name, student_id, role, last_login_at, created_at FROM users WHERE id = ?`)
      .get(user.id);
    const token = signToken(refreshed);
    const st = statsForUser(refreshed.id);
    return res.status(201).json({ token, user: userDto(refreshed, st) });
  } catch (e) {
    if (String(e).includes('UNIQUE')) return res.status(409).json({ error: 'email_taken' });
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

app.post('/api/auth/login', authLimiter, (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' });
  const row = db
    .prepare(
      `SELECT id, email, name, student_id, role, password_hash, last_login_at, created_at FROM users WHERE email = ?`,
    )
    .get(email.trim().toLowerCase());
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  db.prepare(`UPDATE users SET last_login_at = datetime('now') WHERE id = ?`).run(row.id);
  const user = db
    .prepare(`SELECT id, email, name, student_id, role, last_login_at, created_at FROM users WHERE id = ?`)
    .get(row.id);
  const token = signToken(user);
  const st = statsForUser(user.id);
  res.json({ token, user: userDto(user, st) });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const row = db
    .prepare(`SELECT id, email, name, student_id, role, last_login_at, created_at FROM users WHERE id = ?`)
    .get(req.user.id);
  if (!row) return res.status(401).json({ error: 'unauthorized' });
  const st = statsForUser(row.id);
  res.json(userDto(row, st));
});

app.patch('/api/auth/me', requireAuth, writeLimiter, (req, res) => {
  const { name, studentId } = req.body || {};
  const row = db.prepare(`SELECT id FROM users WHERE id = ?`).get(req.user.id);
  if (!row) return res.status(401).json({ error: 'unauthorized' });

  const updates = [];
  const vals = [];
  if (name !== undefined) {
    if (!String(name).trim()) return res.status(400).json({ error: 'invalid_name' });
    updates.push('name = ?');
    vals.push(String(name).trim());
  }
  if (studentId !== undefined) {
    if (!isDigitsOnly(studentId)) return res.status(400).json({ error: 'invalid_student_id' });
    updates.push('student_id = ?');
    vals.push(String(studentId).trim());
  }
  if (!updates.length) return res.status(400).json({ error: 'nothing_to_update' });
  vals.push(req.user.id);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...vals);
  const u = db
    .prepare(`SELECT id, email, name, student_id, role, last_login_at, created_at FROM users WHERE id = ?`)
    .get(req.user.id);
  const st = statsForUser(u.id);
  res.json(userDto(u, st));
});

/** Customer: lightweight fingerprint for UI sounds (poll every ~20s) */
app.get('/api/customer/alerts', requireAuth, (req, res) => {
  const uid = req.user.id;
  const n = db
    .prepare(
      `SELECT MAX(n.id) as m FROM order_notifications n
       JOIN orders o ON o.id = n.order_id WHERE o.user_id = ?`,
    )
    .get(uid);
  const s = db
    .prepare(`SELECT MAX(id) as m FROM support_messages WHERE user_id = ? AND from_admin = 1`)
    .get(uid);
  res.json({
    maxNotificationId: n?.m ?? 0,
    maxAdminSupportId: s?.m ?? 0,
  });
});

/** Admin: new orders / new user chat messages */
app.get('/api/admin/alerts', requireAuth, requireAdmin, (req, res) => {
  const o = db.prepare(`SELECT COUNT(*) as c, MAX(created_at) as t FROM orders`).get();
  const m = db.prepare(`SELECT MAX(id) as mid FROM support_messages WHERE from_admin = 0`).get();
  res.json({
    orderCount: o?.c ?? 0,
    latestOrderCreatedAt: o?.t ?? null,
    maxUserSupportId: m?.mid ?? 0,
  });
});

function parseOrderRow(row, notifications = []) {
  let items = [];
  try {
    items = JSON.parse(row.items_json || '[]');
  } catch {
    items = [];
  }
  return {
    id: row.id,
    userId: row.user_id,
    items,
    total: row.total,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    estimatedTime: row.estimated_time || undefined,
    deliveryAddress: row.delivery_address || undefined,
    pickupLocation: row.pickup_location || undefined,
    paymentMethod: row.payment_method || undefined,
    cancelReason: row.cancel_reason || undefined,
    notifications,
  };
}

app.post('/api/orders', requireAuth, writeLimiter, (req, res) => {
  const { items, total, deliveryAddress, pickupLocation, paymentMethod, estimatedTime } =
    req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'empty_cart' });
  }
  if (items.length > MAX_ORDER_ITEMS) {
    return res.status(400).json({ error: 'too_many_items' });
  }
  const t = Number(total);
  if (!Number.isFinite(t) || t < 0) return res.status(400).json({ error: 'invalid_total' });

  const id = `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const itemsJson = JSON.stringify(items);

  db.prepare(
    `INSERT INTO orders (id, user_id, status, total, delivery_address, pickup_location, payment_method, items_json, estimated_time)
     VALUES (?,?, 'pending',?,?,?,?,?,?)`,
  ).run(
    id,
    req.user.id,
    Math.round(t),
    deliveryAddress || null,
    pickupLocation || null,
    paymentMethod || null,
    itemsJson,
    estimatedTime || '15-30 mins',
  );

  const row = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id);
  res.status(201).json(parseOrderRow(row, []));
});

app.get('/api/orders', requireAuth, (req, res) => {
  const rows = db
    .prepare(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`)
    .all(req.user.id);
  res.json(rows.map((r) => parseOrderRow(r, [])));
});

app.get('/api/orders/:id', requireAuth, (req, res) => {
  const row = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not_found' });
  if (req.user.role !== 'admin' && row.user_id !== req.user.id) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const notes = db
    .prepare(
      `SELECT id, message, created_at AS createdAt FROM order_notifications WHERE order_id = ? ORDER BY id ASC`,
    )
    .all(row.id);
  res.json(parseOrderRow(row, notes));
});

app.post('/api/orders/:id/cancel', requireAuth, writeLimiter, (req, res) => {
  const row = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not_found' });
  if (row.user_id !== req.user.id) return res.status(403).json({ error: 'forbidden' });
  if (!['pending', 'processing'].includes(row.status)) {
    return res.status(400).json({ error: 'cannot_cancel' });
  }
  const reason = String(req.body?.reason || '').trim().slice(0, 500);
  db.prepare(
    `UPDATE orders SET status = 'cancelled', cancel_reason = ?, updated_at = datetime('now') WHERE id = ?`,
  ).run(reason || null, req.params.id);
  const updated = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(req.params.id);
  const notes = db
    .prepare(
      `SELECT id, message, created_at AS createdAt FROM order_notifications WHERE order_id = ? ORDER BY id ASC`,
    )
    .all(updated.id);
  res.json(parseOrderRow(updated, notes));
});

/** Customer support chat */
app.get('/api/support/messages', requireAuth, (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, MAX_SUPPORT_POLL);
  const rows = db
    .prepare(
      `SELECT id, order_id AS orderId, from_admin AS fromAdmin, body, created_at AS createdAt
       FROM support_messages WHERE user_id = ? ORDER BY id DESC LIMIT ?`,
    )
    .all(req.user.id, limit);
  res.json(rows.reverse());
});

app.post('/api/support/messages', requireAuth, writeLimiter, (req, res) => {
  let body = String(req.body?.body || '').trim();
  if (!body) return res.status(400).json({ error: 'empty_message' });
  if (body.length > MAX_CHAT_BODY) body = body.slice(0, MAX_CHAT_BODY);
  const orderId = req.body?.orderId ? String(req.body.orderId).slice(0, 80) : null;
  if (orderId) {
    const ord = db.prepare(`SELECT id FROM orders WHERE id = ? AND user_id = ?`).get(orderId, req.user.id);
    if (!ord) return res.status(400).json({ error: 'invalid_order' });
  }
  const info = db
    .prepare(
      `INSERT INTO support_messages (user_id, order_id, from_admin, body) VALUES (?,?,0,?)`,
    )
    .run(req.user.id, orderId, body);
  const msg = db
    .prepare(
      `SELECT id, order_id AS orderId, from_admin AS fromAdmin, body, created_at AS createdAt FROM support_messages WHERE id = ?`,
    )
    .get(info.lastInsertRowid);
  res.status(201).json(msg);
});

/** Admin orders */
app.get('/api/admin/orders', requireAuth, requireAdmin, (req, res) => {
  const rows = db
    .prepare(
      `SELECT o.*, u.email AS user_email, u.name AS user_name FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC`,
    )
    .all();
  res.json(
    rows.map((r) => {
      const { user_email, user_name, ...order } = r;
      const notes = db
        .prepare(
          `SELECT id, message, created_at AS createdAt FROM order_notifications WHERE order_id = ? ORDER BY id DESC`,
        )
        .all(order.id);
      return {
        ...parseOrderRow(order, notes),
        userEmail: user_email,
        userName: user_name,
      };
    }),
  );
});

app.patch('/api/admin/orders/:id', requireAuth, requireAdmin, writeLimiter, (req, res) => {
  const { status, estimatedTime, deliveryAddress, pickupLocation, paymentMethod } = req.body || {};
  const row = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not_found' });

  const allowed = ['pending', 'processing', 'ready', 'completed', 'cancelled'];
  const updates = [];
  const vals = [];
  if (status !== undefined) {
    if (!allowed.includes(status)) return res.status(400).json({ error: 'invalid_status' });
    updates.push('status = ?');
    vals.push(status);
    if (status === 'cancelled' && req.body?.cancelReason !== undefined) {
      updates.push('cancel_reason = ?');
      vals.push(String(req.body.cancelReason).slice(0, 500));
    }
  }
  if (estimatedTime !== undefined) {
    updates.push('estimated_time = ?');
    vals.push(String(estimatedTime).slice(0, 120));
  }
  if (deliveryAddress !== undefined) {
    updates.push('delivery_address = ?');
    const v = String(deliveryAddress).trim();
    vals.push(v ? v.slice(0, 500) : null);
  }
  if (pickupLocation !== undefined) {
    updates.push('pickup_location = ?');
    const v = String(pickupLocation).trim();
    vals.push(v ? v.slice(0, 200) : null);
  }
  if (paymentMethod !== undefined) {
    updates.push('payment_method = ?');
    const v = String(paymentMethod).trim();
    vals.push(v ? v.slice(0, 80) : null);
  }
  if (!updates.length) return res.status(400).json({ error: 'nothing_to_update' });
  updates.push(`updated_at = datetime('now')`);
  vals.push(req.params.id);
  db.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`).run(...vals);
  const updated = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(req.params.id);
  const notes = db
    .prepare(
      `SELECT id, message, created_at AS createdAt FROM order_notifications WHERE order_id = ? ORDER BY id ASC`,
    )
    .all(updated.id);
  res.json(parseOrderRow(updated, notes));
});

app.delete('/api/admin/orders/:id', requireAuth, requireAdmin, writeLimiter, (req, res) => {
  const r = db.prepare(`DELETE FROM orders WHERE id = ?`).run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'not_found' });
  res.json({ ok: true });
});

app.post('/api/admin/orders/:id/notifications', requireAuth, requireAdmin, writeLimiter, (req, res) => {
  const { message } = req.body || {};
  if (!message || !String(message).trim()) return res.status(400).json({ error: 'empty_message' });
  const row = db.prepare(`SELECT id FROM orders WHERE id = ?`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not_found' });
  const text = String(message).trim().slice(0, 2000);
  const info = db
    .prepare(`INSERT INTO order_notifications (order_id, message) VALUES (?,?)`)
    .run(req.params.id, text);
  const note = db
    .prepare(`SELECT id, message, created_at AS createdAt FROM order_notifications WHERE id = ?`)
    .get(info.lastInsertRowid);
  res.status(201).json(note);
});

app.delete(
  '/api/admin/orders/:orderId/notifications/:noteId',
  requireAuth,
  requireAdmin,
  writeLimiter,
  (req, res) => {
    const { orderId, noteId } = req.params;
    const nid = Number(noteId);
    if (!Number.isFinite(nid) || nid <= 0) return res.status(400).json({ error: 'invalid_id' });
    const row = db
      .prepare(`SELECT id FROM order_notifications WHERE id = ? AND order_id = ?`)
      .get(nid, orderId);
    if (!row) return res.status(404).json({ error: 'not_found' });
    db.prepare(`DELETE FROM order_notifications WHERE id = ?`).run(nid);
    res.json({ ok: true });
  },
);

/** Admin support threads */
app.get('/api/admin/support/threads', requireAuth, requireAdmin, (req, res) => {
  const rows = db
    .prepare(
      `SELECT sm.user_id AS userId, MAX(sm.id) AS lastId
       FROM support_messages sm
       GROUP BY sm.user_id
       ORDER BY lastId DESC
       LIMIT 80`,
    )
    .all();
  const out = [];
  for (const r of rows) {
    const u = db.prepare(`SELECT id, email, name FROM users WHERE id = ?`).get(r.userId);
    const last = db
      .prepare(
        `SELECT id, body, from_admin AS fromAdmin, created_at AS createdAt FROM support_messages WHERE id = ?`,
      )
      .get(r.lastId);
    out.push({
      userId: r.userId,
      userEmail: u?.email,
      userName: u?.name,
      lastMessage: last,
    });
  }
  res.json(out);
});

app.get('/api/admin/support/messages', requireAuth, requireAdmin, (req, res) => {
  const userId = Number(req.query.userId);
  if (!userId) return res.status(400).json({ error: 'missing_userId' });
  const limit = Math.min(Number(req.query.limit) || 200, MAX_SUPPORT_POLL);
  const rows = db
    .prepare(
      `SELECT id, order_id AS orderId, from_admin AS fromAdmin, body, created_at AS createdAt
       FROM support_messages WHERE user_id = ? ORDER BY id DESC LIMIT ?`,
    )
    .all(userId, limit);
  res.json(rows.reverse());
});

app.post('/api/admin/support/messages', requireAuth, requireAdmin, writeLimiter, (req, res) => {
  const userId = Number(req.body?.userId);
  let body = String(req.body?.body || '').trim();
  if (!userId || !body) return res.status(400).json({ error: 'missing_fields' });
  if (body.length > MAX_CHAT_BODY) body = body.slice(0, MAX_CHAT_BODY);
  const u = db.prepare(`SELECT id FROM users WHERE id = ?`).get(userId);
  if (!u) return res.status(404).json({ error: 'user_not_found' });
  const orderId = req.body?.orderId ? String(req.body.orderId).slice(0, 80) : null;
  if (orderId) {
    const ord = db.prepare(`SELECT id FROM orders WHERE id = ? AND user_id = ?`).get(orderId, userId);
    if (!ord) return res.status(400).json({ error: 'invalid_order' });
  }
  const info = db
    .prepare(`INSERT INTO support_messages (user_id, order_id, from_admin, body) VALUES (?,?,1,?)`)
    .run(userId, orderId, body);
  const msg = db
    .prepare(
      `SELECT id, order_id AS orderId, from_admin AS fromAdmin, body, created_at AS createdAt FROM support_messages WHERE id = ?`,
    )
    .get(info.lastInsertRowid);
  res.status(201).json(msg);
});

/** Admin user management */
app.get('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  const rows = db
    .prepare(
      `SELECT u.id, u.email, u.name, u.student_id, u.role, u.created_at, u.last_login_at,
        (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count,
        (SELECT COALESCE(SUM(o.total), 0) FROM orders o WHERE o.user_id = u.id AND o.status != 'cancelled') AS total_spent
       FROM users u ORDER BY u.id`,
    )
    .all();
  res.json(
    rows.map((r) => ({
      id: r.id,
      schoolEmail: r.email,
      name: r.name,
      studentId: r.student_id,
      role: r.role,
      createdAt: r.created_at,
      lastLoginAt: r.last_login_at,
      orderCount: r.order_count,
      totalSpent: r.total_spent,
    })),
  );
});

app.patch('/api/admin/users/:id', requireAuth, requireAdmin, writeLimiter, (req, res) => {
  const targetId = Number(req.params.id);
  const { name, studentId } = req.body || {};
  const target = db.prepare(`SELECT id, role FROM users WHERE id = ?`).get(targetId);
  if (!target) return res.status(404).json({ error: 'not_found' });

  const updates = [];
  const vals = [];
  if (name !== undefined) {
    if (!String(name).trim()) return res.status(400).json({ error: 'invalid_name' });
    updates.push('name = ?');
    vals.push(String(name).trim());
  }
  if (studentId !== undefined) {
    if (!isDigitsOnly(studentId)) return res.status(400).json({ error: 'invalid_student_id' });
    updates.push('student_id = ?');
    vals.push(String(studentId).trim());
  }

  if (!updates.length) return res.status(400).json({ error: 'nothing_to_update' });
  vals.push(targetId);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...vals);
  const row = db.prepare(`SELECT * FROM users WHERE id = ?`).get(targetId);
  res.json({
    id: row.id,
    schoolEmail: row.email,
    name: row.name,
    studentId: row.student_id,
    role: row.role,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    orderCount: db.prepare(`SELECT COUNT(*) as c FROM orders WHERE user_id = ?`).get(targetId).c,
    totalSpent: db
      .prepare(`SELECT COALESCE(SUM(total),0) as s FROM orders WHERE user_id = ? AND status != 'cancelled'`)
      .get(targetId).s,
  });
});

app.delete('/api/admin/users/:id', requireAuth, requireAdmin, writeLimiter, (req, res) => {
  const targetId = Number(req.params.id);
  if (targetId === req.user.id) return res.status(400).json({ error: 'cannot_delete_self' });
  const target = db.prepare(`SELECT role FROM users WHERE id = ?`).get(targetId);
  if (!target) return res.status(404).json({ error: 'not_found' });
  if (target.role === 'admin') {
    const ac = db.prepare(`SELECT COUNT(*) as c FROM users WHERE role = 'admin'`).get().c;
    if (ac <= 1) return res.status(400).json({ error: 'last_admin' });
  }
  db.prepare(`DELETE FROM users WHERE id = ?`).run(targetId);
  res.json({ ok: true });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[fnp-api] http://localhost:${PORT}  DB: ${DB_PATH}`);
});
