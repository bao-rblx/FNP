const db = require('better-sqlite3')('data.sqlite');
const users = db.prepare('SELECT id, email, role FROM users').all();
console.log(users);
db.prepare('UPDATE users SET role = ? WHERE email != ?').run('admin', 'admin@vanlanguni.vn');
console.log('Updated all non-root users to admin to restore access.');
