import pool from "../db.js";

export const createDocument = async (userId, filename, mimeType, textContent) => {
  const [result] = await pool.execute(
    `INSERT INTO documents (user_id, filename, mime_type, text_content)
     VALUES (?, ?, ?, ?)`,
    [userId, filename, mimeType, textContent]
  );
  return result.insertId;
};

export const findDocumentById = async (id, userId) => {
  const [rows] = await pool.execute(
    `SELECT id, user_id, filename, mime_type, text_content, created_at
     FROM documents
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [id, userId]
  );
  return rows[0] || null;
};

