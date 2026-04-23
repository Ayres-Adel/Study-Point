import pool from "../db.js";

export const createUser = async (name, phone, email, password) => {
    try {
        const [result] = await pool.execute(
            "INSERT INTO users (name, phone, email, password) VALUES (?, ?, ?, ?)",
            [name, phone, email, password]
        );

       
        return {
            id: result.insertId,
            name,
            phone,
            email
        };
    } catch (error) {
        throw new Error('Error creating user: ' + error.message);
    }
}

export const findUser = async (email, phone) => {
    try {
        // Build the query dynamically, only including non-null fields
        const conditions = [];
        const params = [];

        if (email) {
            conditions.push('email = ?');
            params.push(email);
        }
        if (phone) {
            conditions.push('phone = ?');
            params.push(phone);
        }

        // If both are null, return null
        if (conditions.length === 0) {
            return null;
        }

        const query = `SELECT * FROM users WHERE ${conditions.join(' OR ')} LIMIT 1`;
        const [rows] = await pool.execute(query, params);

        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw new Error('Error fetching user: ' + error.message);
    }
}


export const findUserById = async (id) => {
    try {
        if (id === undefined || id === null) {
            return null;
        }
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        throw new Error('Error fetching user by ID: ' + error.message);
    }
}

export const updateUserOnboarding = async (userId, level, goal, dailyTimeCommitment) => {
    try {
        const [result] = await pool.execute(
            `UPDATE users
             SET level = ?, goal = ?, daily_time_commitment = ?
             WHERE id = ?`,
            [level, goal, dailyTimeCommitment, userId]
        );
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error('Error updating onboarding data: ' + error.message);
    }
}

export const updateUserPlan = async (userId, plan, expiryDate = null) => {
    try {
        const [result] = await pool.execute(
            'UPDATE users SET plan = ?, plan_expiry_date = ? WHERE id = ?',
            [plan, expiryDate, userId]
        );
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error('Error updating user plan: ' + error.message);
    }
}

export const addUserPoints = async (userId, amount) => {
    try {
        const [result] = await pool.execute(
            'UPDATE users SET points = points + ? WHERE id = ?',
            [amount, userId]
        );
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error('Error updating user points: ' + error.message);
    }
}

/**
 * Update streak fields. Uses new column names: current_streak, longest_streak, last_activity_date.
 */
export const updateUserStreak = async (userId, currentStreak, longestStreak, lastActivityDate) => {
    try {
        const [result] = await pool.execute(
            'UPDATE users SET current_streak = ?, longest_streak = ?, last_activity_date = ? WHERE id = ?',
            [currentStreak, longestStreak, lastActivityDate, userId]
        );
        return result.affectedRows > 0;
    } catch (error) {
        throw new Error('Error updating user streak: ' + error.message);
    }
}

/**
 * Legacy alias kept for any old callers — maps to new column names.
 * streak → current_streak, lastLoginDate → last_activity_date, longest stays same.
 */
export const setUserStreakAndLoginDate = async (userId, streak, lastLoginDate) => {
    return updateUserStreak(userId, streak, streak, lastLoginDate);
}