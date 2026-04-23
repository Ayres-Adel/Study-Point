import pool from "../db.js";

export const createQuiz = async (userId, sessionId, quizData, score = 0, totalQuestions = 0) => {
    const [result] = await pool.execute(
        `INSERT INTO quizzes (user_id, session_id, quiz_data, score, total_questions)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, sessionId ?? null, JSON.stringify(quizData), score, totalQuestions]
    );
    return result.insertId;
};

export const listQuizzesByUser = async (userId) => {
    const [rows] = await pool.execute(
        `SELECT id, user_id, session_id, score, total_questions, created_at
         FROM quizzes
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [userId]
    );
    return rows;
};

export const findQuizById = async (quizId, userId) => {
    const [rows] = await pool.execute(
        `SELECT id, user_id, session_id, quiz_data, score, total_questions, created_at
         FROM quizzes
         WHERE id = ? AND user_id = ?
         LIMIT 1`,
        [quizId, userId]
    );
    return rows[0] || null;
};

export const updateQuizScore = async (quizId, score, totalQuestions) => {
    const [result] = await pool.execute(
        `UPDATE quizzes
         SET score = ?, total_questions = ?
         WHERE id = ?`,
        [score, totalQuestions, quizId]
    );
    return result.affectedRows > 0;
};


export const createExam = async (userId, sessionId, examData, score = 0, totalQuestions = 0) => {
    const [result] = await pool.execute(
        `INSERT INTO exams (user_id, session_id, exam_data, score, total_questions)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, sessionId ?? null, JSON.stringify(examData), score, totalQuestions]
    );
    return result.insertId;
};
