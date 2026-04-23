import pool from '../db.js';

async function migrate() {
    try {
        await pool.execute("ALTER TABLE users MODIFY COLUMN plan ENUM('free', 'premium', 'weekly', 'monthly', 'yearly') NOT NULL DEFAULT 'free'");
        console.log("Updated plan enum.");
    } catch(e) { console.error(e.message); }

    try {
        await pool.execute("ALTER TABLE users ADD COLUMN plan_expiry_date DATETIME DEFAULT NULL");
        console.log("Added plan_expiry_date.");
    } catch(e) { console.error(e.message); }

    console.log("Migration completed.");
    process.exit(0);
}

migrate();
