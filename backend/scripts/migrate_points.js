import pool from '../db.js';

async function migrate() {
    try {
        await pool.execute("ALTER TABLE point_histories MODIFY COLUMN type ENUM('quiz', 'exam', 'streak', 'login', 'onboarding', 'study', 'redemption', 'quiz_correct', 'exam_bonus') NOT NULL");
        console.log("Updated point_histories type enum.");
    } catch(e) { console.error(e.message); }

    process.exit(0);
}

migrate();
