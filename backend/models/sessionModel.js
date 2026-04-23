import pool from "../db.js";

export const createSession = async (userId, title, subject, documentUrl = null) => {
    const [result] = await pool.execute(
        `INSERT INTO sessions (user_id, title, subject, document_url)
         VALUES (?, ?, ?, ?)`,
        [userId, title, subject, documentUrl]
    );
    return result.insertId;
};

export const listSessionsByUser = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT id, title, subject, document_url, created_at, updated_at
         FROM sessions
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

export const findSessionById = async (sessionId, userId) => {
    const [rows] = await pool.execute(
        `SELECT id, user_id, title, subject, document_url, created_at, updated_at
         FROM sessions
         WHERE id = ? AND user_id = ?
         LIMIT 1`,
        [sessionId, userId]
    );
    return rows[0] || null;
};

export const createMessage = async (sessionId, role, content) => {
    const [result] = await pool.execute(
        `INSERT INTO messages (session_id, role, content)
         VALUES (?, ?, ?)`,
        [sessionId, role, content]
    );
    return result.insertId;
};

export const listMessagesBySession = async (sessionId) => {
    const [rows] = await pool.execute(
        `SELECT id, session_id, role, content, created_at
         FROM messages
         WHERE session_id = ?
         ORDER BY created_at ASC`,
        [sessionId]
    );
    return rows;
};
export const deleteSession = async (sessionId, userId) => {
    const [result] = await pool.execute(
        `DELETE FROM sessions
         WHERE id = ? AND user_id = ?`,
        [sessionId, userId]
    );
    return result.affectedRows > 0;
};

export const updateSessionDocument = async (sessionId, userId, documentUrl) => {
    const [result] = await pool.execute(
        `UPDATE sessions
         SET document_url = ?
         WHERE id = ? AND user_id = ?`,
        [documentUrl, sessionId, userId]
    );
    return result.affectedRows > 0;
};
