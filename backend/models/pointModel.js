import pool from "../db.js";

export const createPointHistory = async (userId, type, label, amount) => {
    const [result] = await pool.execute(
        `INSERT INTO point_histories (user_id, type, label, amount)
         VALUES (?, ?, ?, ?)`,
        [userId, type, label, amount]
    );
    return result.insertId;
};

export const listPointHistoryByUser = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT id, user_id, type, label, amount, created_at
         FROM point_histories
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

export const getTodayEarnedPoints = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT COALESCE(SUM(amount), 0) AS total
         FROM point_histories
         WHERE user_id = ?
           AND amount > 0
           AND DATE(created_at) = CURDATE()`,
        [userId]
    );
    return Number(rows[0]?.total || 0);
};

export const listLeaderboard = async () => {
    const [rows] = await pool.execute(
        `SELECT id, name, points, streak
         FROM users
         ORDER BY points DESC, streak DESC
         LIMIT 20`
    );
    return rows;
};
