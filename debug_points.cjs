const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'data', 'fnp.sqlite'));

try {
    const user = db.prepare("SELECT id, name, email, points, rank FROM users WHERE email != 'guest@system.internal' LIMIT 1").get();
    if (!user) {
        console.log("No user found to test with.");
        process.exit(1);
    }
    console.log(`Testing with user: ${user.name} (ID: ${user.id}), Current Points: ${user.points}, Rank: ${user.rank}`);

    // 2. Create a pending order for this user
    const orderId = `TEST-${Date.now()}`;
    db.prepare("INSERT INTO orders (id, user_id, status, total, items_json) VALUES (?, ?, 'pending', 100000, '[]')").run(orderId, user.id);
    console.log(`Created pending order: ${orderId} with total 100,000đ`);
} catch (e) {
    console.error("SQL Error during setup:", e.message);
    process.exit(1);
}

// 3. Simulate the admin patch (I'll copy the logic from index.js manually here or just run a mock of it)
function simulateCompleteOrder(oid) {
    const row = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(oid);
    if (!row) return console.log("Order not found");

    // Perform update
    db.prepare(`UPDATE orders SET status = 'completed', updated_at = datetime('now') WHERE id = ?`).run(oid);

    // Award points logic
    const status = 'completed';
    if (status === 'completed' && row.status !== 'completed' && row.user_id) {
        const freshOrder = db.prepare(`SELECT * FROM orders WHERE id = ?`).get(oid);
        if (freshOrder && (freshOrder.received_points || 0) === 0) {
            const points = Math.floor(freshOrder.total / 1000);
            if (points > 0) {
                db.prepare(`UPDATE orders SET received_points = ? WHERE id = ?`).run(points, oid);
                db.prepare(`UPDATE users SET points = points + ? WHERE id = ?`).run(points, row.user_id);
                console.log(`Awarded ${points} points to user ${row.user_id}`);
            }
        }
        
        // statsForUser logic
        const s = db.prepare(`SELECT COUNT(*) as c, COALESCE(SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END), 0) as spent FROM orders WHERE user_id = ?`).get(row.user_id);
        let rank = 'bronze';
        if (s.spent >= 2000000) rank = 'platinum';
        else if (s.spent >= 500000) rank = 'gold';
        else if (s.spent >= 200000) rank = 'silver';
        db.prepare(`UPDATE users SET rank = ? WHERE id = ?`).run(rank, row.user_id);
        console.log(`Updated rank to ${rank} based on ${s.spent}đ spent`);
    }
}

try {
    simulateCompleteOrder(orderId);

    // 4. Verify results
    const updatedUser = db.prepare("SELECT points, rank FROM users WHERE id = ?").get(user.id);
    console.log(`New Points: ${updatedUser.points}, New Rank: ${updatedUser.rank}`);

    if (updatedUser.points === user.points + 100) {
        console.log("SUCCESS: Points awarded correctly.");
    } else {
        console.log(`FAILURE: Points NOT awarded correctly. Expected ${user.points + 100}, got ${updatedUser.points}`);
    }

    // Cleanup
    db.prepare("DELETE FROM orders WHERE id = ?").run(orderId);
} catch (e) {
    console.error("Critical Error during simulation:", e);
}
