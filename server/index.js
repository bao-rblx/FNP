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

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_en TEXT,
      description TEXT,
      description_en TEXT,
      price INTEGER NOT NULL,
      category TEXT NOT NULL,
      image TEXT,
      unit TEXT,
      min_quantity INTEGER DEFAULT 1,
      pickup_only INTEGER DEFAULT 0,
      variants_json TEXT,
      is_promotion INTEGER DEFAULT 0,
      stock_limit INTEGER DEFAULT -1,
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
      delivery_date TEXT,
      delivery_time TEXT,
      received_points INTEGER DEFAULT 0,
      guest_name TEXT,
      guest_phone TEXT,
      cancel_reason TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      points_awarded INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS coupons (
      code TEXT PRIMARY KEY COLLATE NOCASE,
      discount_percent INTEGER NOT NULL,
      max_uses INTEGER DEFAULT -1,
      used_count INTEGER DEFAULT 0,
      expires_at TEXT,
      min_spent INTEGER DEFAULT 0,
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
  `);

  // Column Migrations for existing tables (in case table already existed)
  const uCols = db.prepare(`PRAGMA table_info(users)`).all().map(c => c.name);
  if (!uCols.includes('phone')) db.exec(`ALTER TABLE users ADD COLUMN phone TEXT`);
  if (!uCols.includes('points')) db.exec(`ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0`);
  if (!uCols.includes('rank')) db.exec(`ALTER TABLE users ADD COLUMN rank TEXT DEFAULT 'bronze'`);
  if (!uCols.includes('reset_token')) db.exec(`ALTER TABLE users ADD COLUMN reset_token TEXT`);
  if (!uCols.includes('reset_expires')) db.exec(`ALTER TABLE users ADD COLUMN reset_expires TEXT`);

  // Migration: Make email nullable
  const uInfo = db.prepare(`PRAGMA table_info(users)`).all();
  const emailColInfo = uInfo.find(c => c.name === 'email');
  if (emailColInfo && emailColInfo.notnull === 1) {
    console.log('[fnp-api] Migration: Making email nullable in users table...');
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
    `);
  }

  const oCols = db.prepare(`PRAGMA table_info(orders)`).all().map(c => c.name);
  if (!oCols.includes('delivery_date')) db.exec(`ALTER TABLE orders ADD COLUMN delivery_date TEXT`);
  if (!oCols.includes('delivery_time')) db.exec(`ALTER TABLE orders ADD COLUMN delivery_time TEXT`);
  if (!oCols.includes('received_points')) db.exec(`ALTER TABLE orders ADD COLUMN received_points INTEGER DEFAULT 0`);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(order_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_order ON order_notifications(order_id);
    CREATE INDEX IF NOT EXISTS idx_support_user ON support_messages(user_id);
  `);


  // Seed initial products if table is empty
  const prodCount = db.prepare(`SELECT COUNT(*) as c FROM products`).get().c;
  if (prodCount === 0) {
    const initialProducts = [
      ['print-a4', 'In A4', 'A4 print', 'In A4 tài liệu, tùy chọn đen trắng hoặc màu sắc', 'A4 printing, optional B&W or Color.', 500, 'printing', 'https://insggiare.com/wp-content/uploads/2022/09/bao-gia-in-tai-lieu-a4-in-tai-lieu-mau-gia-re-1.jpg', 'mỗi trang', 1, 0, JSON.stringify([{ id: 'bw', name: 'Đen Trắng', price: 500 }, { id: 'color', name: 'In Màu', price: 2000 }])],
      ['print-binding', 'Đóng Tài Liệu', 'Document binding', 'Đóng tài liệu chuyên nghiệp dạng lò xo hoặc nhiệt', 'Spiral or thermal binding.', 15000, 'printing', 'https://bizweb.dktcdn.net/thumb/1024x1024/100/044/539/products/in-tai-lieu-mau-01.jpg?v=1600677410183', 'mỗi cuốn', 1, 0, null],
      ['print-laminate', 'Ép Plastic', 'Lamination', 'Ép plastic A4 để bảo vệ tài liệu quan trọng', 'A4 lamination to protect documents.', 5000, 'printing', 'https://mucinthanhdat.net/wp-content/uploads/2021/04/giay-ep-plastic-5.jpg', 'mỗi trang', 1, 0, null],
      ['print-a3', 'In Khổ A3', 'A3 print', 'In A3 chất lượng cao, tùy chọn đen trắng hoặc màu', 'High-quality A3 printing.', 3000, 'printing', 'https://fact-depot.com/tmp/cache/images/_thumbs/720x720/media/product/14719/Giay-A3-Double-A-70-gsm.png', 'mỗi trang', 1, 0, JSON.stringify([{ id: 'bw', name: 'Đen Trắng', price: 3000 }, { id: 'color', name: 'In Màu', price: 8000 }])],
      ['print-a2', 'In Khổ A2', 'A2 print', 'In A2 cho bản vẽ hoặc dự án', 'A2 printing for drawings or projects.', 15000, 'printing', 'https://fact-depot.com/tmp/cache/images/_thumbs/720x720/media/product/14719/Giay-A3-Double-A-70-gsm.png', 'mỗi bản', 1, 0, JSON.stringify([{ id: 'bw', name: 'Đen Trắng', price: 15000 }, { id: 'color', name: 'In Màu', price: 30000 }])],
      ['print-a1', 'In Khổ Lớn A1', 'A1 print', 'In A1 kỹ thuật, bản đồ, poster', 'A1 large format printing.', 30000, 'printing', 'https://fact-depot.com/tmp/cache/images/_thumbs/720x720/media/product/14719/Giay-A3-Double-A-70-gsm.png', 'mỗi bản', 1, 0, JSON.stringify([{ id: 'bw', name: 'Đen Trắng', price: 30000 }, { id: 'color', name: 'In Màu', price: 60000 }])],
      ['print-a0', 'In Khổ Lớn A0', 'A0 print', 'In A0 khổ lớn chất lượng cao', 'A0 extra large format printing.', 50000, 'printing', 'https://fact-depot.com/tmp/cache/images/_thumbs/720x720/media/product/14719/Giay-A3-Double-A-70-gsm.png', 'mỗi bản', 1, 0, JSON.stringify([{ id: 'bw', name: 'Đen Trắng', price: 50000 }, { id: 'color', name: 'In Màu', price: 100000 }])],
      ['paper-a4', 'Giấy A4 (500 tờ)', 'A4 paper (500 sheets)', 'Giấy A4 chất lượng cao, 80gsm', 'Quality 80gsm A4 paper.', 70000, 'paper', 'https://muctim.vn/wp-content/uploads/2024/05/giay-in-a4-5.jpg', 'mỗi ram', 1, 0, null],
      ['paper-a3', 'Giấy A3 (500 tờ)', 'A3 paper (500 sheets)', 'Giấy A3 tiêu chuẩn 80gsm', 'Quality 80gsm A3 paper.', 140000, 'paper', 'https://fact-depot.com/tmp/cache/images/_thumbs/720x720/media/product/14719/Giay-A3-Double-A-70-gsm.png', 'mỗi ram', 1, 0, null],
      ['paper-a2', 'Giấy Khổ A2', 'A2 paper', 'Giấy A2 cho bản vẽ kỹ thuật', 'A2 paper for drafting.', 5000, 'paper', 'https://fact-depot.com/tmp/cache/images/_thumbs/720x720/media/product/14719/Giay-A3-Double-A-70-gsm.png', 'mỗi tờ', 1, 0, null],
      ['paper-a1', 'Giấy Khổ A1', 'A1 paper', 'Giấy A1 cỡ lớn', 'A1 large format paper.', 10000, 'paper', 'https://fact-depot.com/tmp/cache/images/_thumbs/720x720/media/product/14719/Giay-A3-Double-A-70-gsm.png', 'mỗi tờ', 1, 0, null],
      ['paper-a0', 'Giấy Khổ A0', 'A0 paper', 'Giấy A0 siêu lớn', 'A0 extra large format paper.', 20000, 'paper', 'https://fact-depot.com/tmp/cache/images/_thumbs/720x720/media/product/14719/Giay-A3-Double-A-70-gsm.png', 'mỗi tờ', 1, 0, null],
      ['paper-colored', 'Giấy In Ảnh', 'Photo paper', 'Giấy in ảnh bóng cao cấp A4', 'Premium glossy A4 photo paper.', 60000, 'paper', 'https://giayincholon.com/pub/media/NHAP/1MA4/giay-in-anh-1-mat-a4-1.jpg', 'mỗi xấp', 1, 0, null],
      ['paper-cardstock', 'Giấy Bìa Cứng', 'Cardstock', 'Giấy bìa dày cho bài thuyết trình và bìa tài liệu', 'Thick cover stock for reports.', 90000, 'paper', 'https://bizweb.dktcdn.net/100/236/638/products/giay-bia-cung-370cb57a-f148-488d-b564-d7b36258303c.jpg?v=1691405232363', 'mỗi bộ', 1, 0, null],
      ['supply-stapler', 'Bấm Kim Mini', 'Mini stapler', 'Bấm kim nhỏ gọn dễ mang theo', 'Compact multi-use stapler.', 25000, 'supplies', 'https://thfvnext.bing.com/th/id/OIP.S8aTImA848_DdlL9A_ZxHwHaHa?cb=thfvnext&w=600&h=600&rs=1&pid=ImgDetMain&o=7&rm=3', 'mỗi cái', 1, 0, null],
      ['supply-clips', 'Kẹp Giấy', 'Paper clips', 'Hộp kẹp giấy kim loại', 'Metal paper clips box.', 10000, 'supplies', 'https://down-vn.img.susercontent.com/file/vn-11134211-7qukw-lfxqek4kpg162f', 'mỗi hộp', 1, 0, null],
      ['supply-folders', 'Bìa Trong Suốt', 'Clear folders', 'Bìa lá nhựa trong suốt A4', 'A4 clear plastic folders.', 8000, 'supplies', 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-llnakcu2847j45', 'xấp 10 cái', 1, 0, null],
      ['supply-pen', 'Bộ Bút Bi', 'Ballpoint pens', 'Bút bi xanh và đen, bộ 12 cây', 'Blue & black, pack of 12.', 20000, 'supplies', 'https://down-my.img.susercontent.com/file/557d12217b8a3f528320d8f9ad74b171', 'mỗi bộ', 1, 0, null],
      ['supply-highlighter', 'Bộ Bút Dạ Quang', 'Highlighters', 'Bút dạ quang nhiều màu cho học tập', 'Multi-color highlighters.', 30000, 'supplies', 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lm2nff1oc2cf08', 'mỗi bộ', 1, 0, null],
      ['supply-ruler', 'Thước Kẻ Nhựa', 'Plastic ruler', '20cm clear plastic ruler.', 'Thước kẻ nhựa trong 20cm', 5000, 'supplies', 'https://lzd-img-global.slatic.net/g/p/2e7d4e14159ade467c038d1fb09e30dd.jpg_720x720q80.jpg', 'mỗi cái', 1, 0, null],
      ['supply-eraser', 'Tẩy / Gôm', 'Eraser', 'Gôm siêu sạch không vụn', 'Dust-free clean eraser.', 4000, 'supplies', 'https://cdn.tgdd.vn/Products/Images/10338/251770/bhx/gom-tay-thien-long-e-06-202111121138488980.jpeg', 'mỗi cục', 1, 0, null],
      ['supply-tape', 'Băng Keo Trong', 'Clear tape', 'Cuộn băng keo trong cỡ từ nhỏ đến vừa', 'Roll of clear adhesive tape.', 10000, 'supplies', 'https://thfvnext.bing.com/th/id/OIP.9zl4Sx1nmqFED_lnI4wY5AHaHa?cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3', 'cuộn', 1, 0, null],
      ['svc-scan', 'Scan Tài Liệu', 'Document scanning', 'Scan màu/đen trắng, xuất PDF hoặc JPG', 'Color or B&W scanning to PDF/JPG.', 2000, 'services', 'https://phongvu.vn/cong-nghe/wp-content/uploads/2021/11/cach-scan-tai-lieu-bang-dien-thoai.jpg', 'mỗi tập 10 trang', 1, 0, null],
      ['svc-photo-id', 'Chụp Ảnh Thẻ', 'ID photos', 'Chụp ảnh thẻ chuẩn khổ, in ngay tại quầy', 'Standard ID photo prints.', 45000, 'services', 'https://www.zumi.media/wp-content/uploads/2019/10/ggggggggggggg.jpg', 'mỗi bộ 6 ảnh', 1, 1, null],
      ['svc-design-simple', 'Hỗ Trợ Thiết Kế Đơn Giản', 'Simple layout help', 'Chỉnh file banner, poster cơ bản (Canva / PDF)', 'Basic layout fixes for banners/posters.', 50000, 'services', 'https://www.architecturelab.net/wp-content/uploads/2024/05/Photoshop-Should-you-buy-it-The-Architect-Verdict.jpg', 'mỗi file', 1, 0, null],
      ['svc-translate', 'Dịch Thuật Văn Bản', 'Document translation', 'Dịch thuật Anh - Việt cấp tốc cho tài liệu, báo cáo', 'Fast EN-VI translation for reports.', 150000, 'services', 'https://cdn-media.sforum.vn/storage/app/media/Van%20Pham/3/3g/cong-cu-dich-thuat-ai-5.jpg', 'mỗi trang', 1, 0, null],
      ['goods-standee', 'Standee Mô Hình', 'Cut-out standee', 'Standee formex / foam board cho sự kiện, CLB', 'Foam board standees for events & clubs.', 280000, 'goods', 'https://beaumontandco.ca/wp-content/uploads/2024/01/SIDEWALK-SIGN-9-1.jpg', 'mỗi cái (khổ A2)', 1, 0, null],
      ['goods-roll-up', 'Standee Cuốn (Roll-up)', 'Roll-up banner', 'Banner cuốn khung nhôm, in UV bền màu', 'Aluminum roll-up with UV print.', 650000, 'goods', 'https://i.pinimg.com/736x/74/a7/b1/74a7b109ed5a2588f9164a62228a666e.jpg', 'mỗi bộ 85x200cm', 1, 0, null],
      ['goods-billboard', 'In Pano / Billboard Khổ Lớn', 'Large billboard print', 'In bạt khổ lớn cho sân khấu, cổng trường', 'Large PVC mesh for outdoor display.', 120000, 'goods', 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg2IX8LJ49widNFlLSH8HUjAGBt-b7WvfAmTXIlNfbg80aNEYFg5KQNkLIOh2Zq_xiHS5dHX_D0tABWmWgbrfj_4SreWREyQ4j2sdfGbv9Tt3iXYPEd0rgJyKgvHca6CFZfq4PHpQP6Uuo/w640-h480/in+pano+ch%25E1%25BA%25A5t+l%25C6%25B0%25E1%25BB%25A3ng+cao.jpg', 'mỗi m²', 1, 0, null],
      ['goods-banner-pvc', 'Banner PVC / Hiflex', 'PVC / flex banner', 'Banner sự kiện, leo rank, cổng game', 'Event banners, stage backdrops.', 95000, 'goods', 'https://tienad.com/wp-content/uploads/Mau-in-banner-hiflex.webp', 'mỗi m²', 1, 0, null],
      ['goods-keychain', 'Móc Khóa In UV', 'UV-print keychains', 'Móc khóa mica in logo CLB, giveaway', 'Acrylic keychains with UV print.', 35000, 'goods', 'https://sanxuatbangten.com.vn/wp-content/uploads/2022/11/Moc-khoa-mica-25-1059x1200.jpg', 'mỗi cái (từ 10 cái)', 1, 0, null],
      ['goods-ticket', 'Vé Tay / Vé Sự Kiện', 'Event hand tickets', 'In vé giấy có số, tem xé cho concert, workshop', 'Numbered tear-off tickets.', 1500, 'goods', 'https://vietadv.vn/wp-content/uploads/2020/07/ve-moi-su-kien.jpg', 'mỗi tờ', 50, 0, null],
      ['goods-sticker-die', 'Sticker Cắt Hình (Die-cut)', 'Die-cut stickers', 'Sticker logo, hình mascot cắt theo viền', 'Custom-shaped vinyl stickers.', 80000, 'goods', 'https://vietadv.vn/wp-content/uploads/2020/07/ve-moi-su-kien.jpg', 'mỗi tờ A3', 1, 0, null],
      ['goods-sticker-sheet', 'Sticker Sheet A4', 'A4 sticker sheets', 'In sticker lên giấy hoặc nhựa trong, cắt A4', 'Full A4 sticker sheets.', 45000, 'goods', 'https://creatify.mx/wp-content/uploads/2024/01/Sticker-Sheets.png.webp', 'mỗi tờ', 1, 0, null],
      ['goods-foam-board', 'Bảng Foam / Formex', 'Foam board signs', 'Cắt khổ poster dày cho booth, hướng dẫn', 'Thick foam signs for booths.', 110000, 'goods', 'https://saomai234.com/upload/products/thumb_630x0/z3546142173645-e6863d4a8cf9f4b0ec9aaa95839f81c0-1672211487.jpg', 'mỗi tấm 60x90cm', 1, 0, null],
      ['goods-wristband', 'Vòng Tay Sự Kiện (Tyvek)', 'Tyvek wristbands', 'Vòng tay một lần cho concert, teambuilding', 'Single-use event wristbands.', 8000, 'goods', 'https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltq5knekqpsa50', 'mỗi cái (lô 100)', 100, 0, null],
    ];

    const stmt = db.prepare(`INSERT INTO products (id, name, name_en, description, description_en, price, category, image, unit, min_quantity, pickup_only, variants_json) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
    initialProducts.forEach(p => stmt.run(...p));
    console.log(`[fnp-api] Seeded ${initialProducts.length} initial products.`);
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

  // Seed initial coupons if empty or missing FREEVLU
  const freevluExists = db.prepare(`SELECT code FROM coupons WHERE code = 'FREEVLU'`).get();
  if (!freevluExists) {
    db.prepare(`INSERT INTO coupons (code, discount_percent, max_uses, min_spent) VALUES (?,?,?,?)`)
      .run('FREEVLU', 100, -1, 0);
    console.log(`[fnp-api] Seeded FREEVLU coupon (100% discount)`);
  }

  // Migration: vip -> platinum
  db.prepare(`UPDATE users SET rank = 'platinum' WHERE rank = 'vip'`).run();

  try {
    db.prepare(`UPDATE users SET role = 'user' WHERE email = 'huythepro2121@gmail.com'`).run();
    db.prepare(`UPDATE users SET role = 'user' WHERE email = 'basicallybao1401@vanlanguni.vn'`).run();
    console.log(`[fnp-api] Cleaned up admin roles for test accounts.`);
  } catch (e) {}

  return db;
}

const db = initDb();

const VANLANG = '@vanlanguni.vn';

function isValidEmail(email) {
  return typeof email === 'string' && email.includes('@') && email.length > 5;
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
    phone: row.phone || null,
    studentId: row.student_id,
    role: row.role,
    points: row.points || 0,
    rank: row.rank || 'bronze',
    lastLoginAt: row.last_login_at || null,
    createdAt: row.created_at || null,
    orderCount: stats?.orderCount ?? 0,
    totalSpent: stats?.totalSpent ?? 0,
  };
}

function statsForUser(userId) {
  const s = db
    .prepare(
      `SELECT COUNT(*) as c, COALESCE(SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END), 0) as spent
       FROM orders WHERE user_id = ?`,
    )
    .get(userId);
  
  // Rank calculation logic
  let rank = 'bronze';
  if (s.spent >= 2000000) rank = 'platinum';
  else if (s.spent >= 500000) rank = 'gold';
  else if (s.spent >= 200000) rank = 'silver';

  db.prepare(`UPDATE users SET rank = ? WHERE id = ?`).run(rank, userId);

  return { orderCount: s.c, totalSpent: s.spent };
}

app.use(authMiddleware);

app.post('/api/auth/register', authLimiter, (req, res) => {
  const { name, schoolEmail, phone, studentId, password } = req.body || {};
  if (!name?.trim() || (!schoolEmail?.trim() && !phone?.trim()) || !studentId || !password) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  
  const email = schoolEmail?.trim() ? schoolEmail.trim().toLowerCase() : null;
  if (email && !isValidEmail(email)) return res.status(400).json({ error: 'invalid_email' });
  if (!isDigitsOnly(studentId)) return res.status(400).json({ error: 'invalid_student_id' });
  if (password.length < 4) return res.status(400).json({ error: 'weak_password' });

  const phoneNum = phone ? String(phone).trim() : null;

  try {
    const hash = bcrypt.hashSync(password, 10);
    const info = db
      .prepare(
        `INSERT INTO users (email, phone, password_hash, name, student_id, role) VALUES (?,?,?,?,?, 'user')`,
      )
      .run(email, phoneNum, hash, name.trim(), studentId.trim());
    const user = db
      .prepare(`SELECT * FROM users WHERE id = ?`)
      .get(info.lastInsertRowid);
    db.prepare(`UPDATE users SET last_login_at = datetime('now') WHERE id = ?`).run(user.id);
    const refreshed = db
      .prepare(`SELECT * FROM users WHERE id = ?`)
      .get(user.id);
    const token = signToken(refreshed);
    const st = statsForUser(refreshed.id);
    return res.status(201).json({ token, user: userDto(refreshed, st) });
  } catch (e) {
    if (String(e).includes('UNIQUE')) {
      if (String(e).includes('phone')) return res.status(409).json({ error: 'phone_taken' });
      return res.status(409).json({ error: 'email_taken' });
    }
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
});

app.post('/api/auth/login', authLimiter, (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' });
  
  const identifier = email.trim().toLowerCase();
  const row = db
    .prepare(
      `SELECT id, email, phone, name, student_id, role, password_hash, last_login_at, created_at FROM users WHERE email = ? OR phone = ?`,
    )
    .get(identifier, identifier);
    
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  db.prepare(`UPDATE users SET last_login_at = datetime('now') WHERE id = ?`).run(row.id);
  const user = db
    .prepare(`SELECT id, email, phone, name, student_id, role, last_login_at, created_at FROM users WHERE id = ?`)
    .get(row.id);
  const token = signToken(user);
  const st = statsForUser(user.id);
  res.json({ token, user: userDto(user, st) });
});

app.post('/api/auth/forgot-password', authLimiter, (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'missing_email' });
  const user = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email.trim().toLowerCase());
  
  // We always return 200 for security, but actually process if user exists
  if (user) {
    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour
    db.prepare(`UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?`).run(token, expires, user.id);
    console.log(`[fnp-api] Password reset for ${email}: ${token}`);
    // In a real app, send email here
    return res.json({ ok: true, debug_token: token }); // debug_token for dev ease
  }
  res.json({ ok: true });
});

app.post('/api/auth/reset-password', authLimiter, (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword || newPassword.length < 4) return res.status(400).json({ error: 'invalid_request' });
  
  const user = db.prepare(`SELECT id, reset_expires FROM users WHERE reset_token = ?`).get(token);
  if (!user || new Date(user.reset_expires) < new Date()) {
    return res.status(400).json({ error: 'invalid_or_expired_token' });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare(`UPDATE users SET password_hash = ?, reset_token = null, reset_expires = null WHERE id = ?`).run(hash, user.id);
  res.json({ ok: true });
});

app.post('/api/auth/change-password', requireAuth, writeLimiter, (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if (!oldPassword || !newPassword || newPassword.length < 4) return res.status(400).json({ error: 'invalid_request' });

  const user = db.prepare(`SELECT password_hash FROM users WHERE id = ?`).get(req.user.id);
  if (!bcrypt.compareSync(oldPassword, user.password_hash)) {
    return res.status(401).json({ error: 'invalid_old_password' });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(hash, req.user.id);
  res.json({ ok: true });
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

app.post('/api/redeem-points', requireAuth, writeLimiter, (req, res) => {
  const { points } = req.body || {};
  if (!points || points < 100) return res.status(400).json({ error: 'minimum_100_points' });
  
  const user = db.prepare(`SELECT points FROM users WHERE id = ?`).get(req.user.id);
  if (!user || user.points < points) return res.status(400).json({ error: 'insufficient_points' });

  // 100 points = 1000VND discount (demo logic)
  const discountAmount = Math.floor(points / 100) * 1000;
  
  db.prepare(`UPDATE users SET points = points - ? WHERE id = ?`).run(points, req.user.id);
  
  res.json({ ok: true, discountAmount, remainingPoints: user.points - points });
});

/** Products */
app.get('/api/products', (req, res) => {
  const rows = db.prepare(`SELECT * FROM products ORDER BY category, created_at DESC`).all();
  res.json(rows.map(r => ({
    id: r.id,
    name: r.name,
    nameEn: r.name_en,
    description: r.description,
    descriptionEn: r.description_en,
    price: r.price,
    category: r.category,
    image: r.image,
    unit: r.unit,
    minQuantity: r.min_quantity,
    pickupOnly: !!r.pickup_only,
    variants: r.variants_json ? JSON.parse(r.variants_json) : undefined,
    isPromotion: !!r.is_promotion,
    stockLimit: r.stock_limit
  })));
});

/** Coupons */
app.post('/api/coupons/validate', writeLimiter, (req, res) => {
  const { code, totalSpent } = req.body || {};
  if (!code) return res.status(400).json({ error: 'missing_code' });
  
  const coupon = db.prepare(`SELECT * FROM coupons WHERE code = ?`).get(code.trim());
  if (!coupon) return res.status(404).json({ error: 'invalid_coupon' });
  
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return res.status(400).json({ error: 'expired_coupon' });
  }
  
  if (coupon.max_uses !== -1 && coupon.used_count >= coupon.max_uses) {
    return res.status(400).json({ error: 'coupon_usage_limit_reached' });
  }
  
  if (totalSpent < coupon.min_spent) {
    return res.status(400).json({ error: 'min_spent_not_reached', minSpent: coupon.min_spent });
  }
  
  res.json({
    code: coupon.code,
    discountPercent: coupon.discount_percent
  });
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
    guestName: row.guest_name || undefined,
    guestPhone: row.guest_phone || undefined,
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

app.post('/api/orders/guest', writeLimiter, (req, res) => {
  const { guestName, guestPhone, items, total, deliveryAddress, pickupLocation, paymentMethod, estimatedTime } =
    req.body || {};
  const name = String(guestName || '').trim();
  const phone = String(guestPhone || '').trim();
  if (!name || name.length < 2) return res.status(400).json({ error: 'guest_name_required' });
  if (!phone || phone.length < 8) return res.status(400).json({ error: 'guest_phone_required' });
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

  // Upsert a shared guest system user to satisfy the FK constraint
  let guestUser = db.prepare(`SELECT id FROM users WHERE email = 'guest@system.internal'`).get();
  if (!guestUser) {
    db.prepare(`INSERT INTO users (email, password_hash, name, student_id, role) VALUES ('guest@system.internal', 'x', 'Guest', '0', 'user')`).run();
    guestUser = db.prepare(`SELECT id FROM users WHERE email = 'guest@system.internal'`).get();
  }

  db.prepare(
    `INSERT INTO orders (id, user_id, status, total, delivery_address, pickup_location, payment_method, items_json, estimated_time, guest_name, guest_phone)
     VALUES (?,?, 'pending',?,?,?,?,?,?,?,?)`,
  ).run(
    id,
    guestUser.id,
    Math.round(t),
    deliveryAddress || null,
    pickupLocation || null,
    paymentMethod || null,
    itemsJson,
    estimatedTime || '15-30 mins',
    name,
    phone,
  );

  const row = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id);
  res.status(201).json(parseOrderRow(row, []));
});

app.get('/api/orders/guest/:id', (req, res) => {
  const row = db.prepare(`SELECT * FROM orders WHERE id = ? AND guest_name IS NOT NULL`).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not_found' });
  const notes = db
    .prepare(
      `SELECT id, message, created_at AS createdAt FROM order_notifications WHERE order_id = ? ORDER BY id ASC`,
    )
    .all(row.id);
  res.json(parseOrderRow(row, notes));
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

  // Award points if status changed to 'completed'
  if (status === 'completed' && row.status !== 'completed' && row.user_id) {
    console.log(`Order ${req.params.id} completed. Awarding points to user ${row.user_id}`);
    const freshOrder = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(req.params.id);
    if (freshOrder && (freshOrder.received_points || 0) === 0) {
      const points = Math.floor(freshOrder.total / 1000);
      console.log(`Calculated points: ${points} (Total: ${freshOrder.total})`);
      if (points > 0) {
        db.prepare(`UPDATE orders SET received_points = ? WHERE id = ?`).run(points, req.params.id);
        db.prepare(`UPDATE users SET points = points + ? WHERE id = ?`).run(points, row.user_id);
        console.log(`Successfully added ${points} points to user ${row.user_id}`);
      }
    } else {
      console.log(`Points already received or order not found: ${freshOrder?.received_points}`);
    }
    // Always refresh stats/rank even if 0 points (could be from previous spending)
    statsForUser(row.user_id);
  }
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

/** Admin: Product CRUD */
app.post('/api/admin/products', requireAuth, requireAdmin, writeLimiter, (req, res) => {
  const p = req.body;
  const id = p.id || `prod-${Date.now()}`;
  try {
    db.prepare(`
      INSERT INTO products (id, name, name_en, description, description_en, price, category, image, unit, min_quantity, pickup_only, variants_json, is_promotion, stock_limit)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(id, p.name, p.nameEn, p.description, p.descriptionEn, p.price, p.category, p.image, p.unit, p.minQuantity || 1, p.pickupOnly ? 1 : 0, p.variants ? JSON.stringify(p.variants) : null, p.isPromotion ? 1 : 0, p.stockLimit || -1);
    res.status(201).json({ id });
  } catch (e) {
    res.status(400).json({ error: 'failed_to_create_product' });
  }
});

app.patch('/api/admin/products/:id', requireAuth, requireAdmin, writeLimiter, (req, res) => {
  const p = req.body;
  const updates = [];
  const vals = [];
  
  const fields = {
    name: 'name', nameEn: 'name_en', description: 'description', descriptionEn: 'description_en',
    price: 'price', category: 'category', image: 'image', unit: 'unit',
    minQuantity: 'min_quantity', pickupOnly: 'pickup_only', variants: 'variants_json',
    isPromotion: 'is_promotion', stockLimit: 'stock_limit'
  };

  for (const [key, col] of Object.entries(fields)) {
    if (p[key] !== undefined) {
      updates.push(`${col} = ?`);
      let val = p[key];
      if (key === 'pickupOnly' || key === 'isPromotion') val = val ? 1 : 0;
      if (key === 'variants') val = val ? JSON.stringify(val) : null;
      vals.push(val);
    }
  }

  if (!updates.length) return res.status(400).json({ error: 'nothing_to_update' });
  vals.push(req.params.id);
  db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).run(...vals);
  res.json({ ok: true });
});

app.delete('/api/admin/products/:id', requireAuth, requireAdmin, writeLimiter, (req, res) => {
  db.prepare(`DELETE FROM products WHERE id = ?`).run(req.params.id);
  res.json({ ok: true });
});

/** Admin: Coupon CRUD */
app.post('/api/admin/coupons', requireAuth, requireAdmin, writeLimiter, (req, res) => {
  const { code, discountPercent, maxUses, expiresAt, minSpent } = req.body;
  try {
    db.prepare(`
      INSERT INTO coupons (code, discount_percent, max_uses, expires_at, min_spent)
      VALUES (?,?,?,?,?)
    `).run(code, discountPercent, maxUses || -1, expiresAt || null, minSpent || 0);
    res.status(201).json({ code });
  } catch (e) {
    res.status(400).json({ error: 'failed_to_create_coupon' });
  }
});

app.delete('/api/admin/coupons/:code', requireAuth, requireAdmin, writeLimiter, (req, res) => {
  db.prepare(`DELETE FROM coupons WHERE code = ?`).run(req.params.code);
  res.json({ ok: true });
});

app.get('/api/admin/coupons', requireAuth, requireAdmin, (req, res) => {
  const rows = db.prepare(`SELECT * FROM coupons ORDER BY created_at DESC`).all();
  res.json(rows);
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Serve built frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(rootDir, 'dist');
  app.use(express.static(distPath));
  app.use((_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const listenPort = process.env.NODE_ENV === 'production' ? 5000 : PORT;
app.listen(listenPort, () => {
  console.log('[fnp-api] http://localhost:' + listenPort + '  DB: ' + DB_PATH);
});