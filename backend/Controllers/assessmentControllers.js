import { 
    createExam, 
    createQuiz, 
    listQuizzesByUser, 
    findQuizById, 
    updateQuizScore 
} from "../models/assessmentModel.js";
import { addUserPoints, findUserById, updateUserStreak } from "../models/userModel.js";
import { createPointHistory } from "../models/pointModel.js";
import { getAiClient, getGeminiModel, withAiRetry } from "../lib/ai.js";

// ── Streak milestone definitions ────────────────────────────
const STREAK_MILESTONES = [
    { days: 7,   badge: "7 Day Streak",    points: 15  },
    { days: 14,  badge: "2 Week Streak",   points: 30  },
    { days: 30,  badge: "1 Month Streak",  points: 75  },
    { days: 100, badge: "Legend",          points: 200 },
];

/**
 * Run streak update logic every time a user answers a quiz/exam question.
 * Returns { newStreak, longestStreak, milestone } — milestone is null if none hit.
 */
export const processStreakOnActivity = async (userId) => {
    const user = await findUserById(userId);
    if (!user) return { newStreak: 0, longestStreak: 0, milestone: null };

    const today = new Date().toISOString().slice(0, 10);
    // Handle both old column name (streak) and new name (current_streak) gracefully
    const currentStreak = user.current_streak ?? user.streak ?? 0;
    const longestStreak = user.longest_streak ?? 0;
    const lastActivity = user.last_activity_date
        ? new Date(user.last_activity_date).toISOString().slice(0, 10)
        : null;

    // Already counted for today — no change
    if (lastActivity === today) {
        return { newStreak: currentStreak, longestStreak, milestone: null };
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let newStreak;
    if (lastActivity === yesterday) {
        newStreak = currentStreak + 1;  // Consecutive day
    } else {
        newStreak = 1;                  // Missed day(s) — reset
    }

    const newLongest = Math.max(longestStreak, newStreak);
    await updateUserStreak(userId, newStreak, newLongest, today);

    // Check if a milestone was just crossed (previous streak < milestone, new streak >= milestone)
    let milestone = null;
    for (const m of STREAK_MILESTONES) {
        if (currentStreak < m.days && newStreak >= m.days) {
            // Award milestone bonus
            await addUserPoints(userId, m.points);
            await createPointHistory(userId, "streak_bonus", `Streak Bonus: ${m.badge}`, m.points);
            milestone = { badge: m.badge, points: m.points };
            break; // Only one milestone per submission
        }
    }

    return { newStreak, longestStreak: newLongest, milestone };
};

export const generateAssessmentsFromPDF = async (fileUri, userId) => {
    const ai = getAiClient();
    const model = getGeminiModel();
    
    // Prompt to generate a JSON response containing quiz and exam
    const prompt = `You are an expert educator. Based ONLY on the provided document, generate a quiz and an exam to test the student's knowledge.
Output exactly valid JSON in this structure:
{
  "quiz": [
    { "question": "...", "options": ["...", "...", "...", "..."], "correct": 0, "explanation": "..." }
  ],
  "exam": [
    { "question": "...", "options": ["...", "...", "...", "..."], "correct": 0, "explanation": "..." }
  ]
}
Include exactly 5 questions for the quiz and 10 questions for the exam. Ensure that the 'correct' field is an integer index (0-3) of the correct option.
Do not include markdown blocks or any other text before or after the JSON.`;

    try {
        const response = await withAiRetry(() =>
            ai.models.generateContent({
                model,
                contents: [
                    { role: 'user', parts: [ { fileData: { fileUri, mimeType: 'application/pdf' } }, { text: prompt } ] }
                ],
                config: {
                    responseMimeType: "application/json"
                }
            })
        );

        const rawJson = response.text();
        const data = JSON.parse(rawJson);

        const quizData = data.quiz;
        const examData = data.exam;

        // Save into DB
        const quizId = await createQuiz(userId, null, quizData, 0, quizData.length);
        const examId = await createExam(userId, null, examData, 0, examData.length);

        return { quiz_id: quizId, exam_id: examId };
    } catch (e) {
        console.error("Failed to generate assessments:", e);
        throw e;
    }
};

const DEFAULT_QUIZ = [
  {
    question: "What is the primary function of mitochondria in a cell?",
    options: ["Protein synthesis", "Energy production", "Cell division", "DNA replication"],
    correct: 1,
    explanation: "Mitochondria are known as the 'powerhouse of the cell' because they generate most of the cell's supply of ATP."
  },
  {
    question: "Which law of thermodynamics states that energy cannot be created or destroyed?",
    options: ["Zeroth law", "First law", "Second law", "Third law"],
    correct: 1,
    explanation: "The First Law states that energy can neither be created nor destroyed, only transformed."
  },
  {
    question: "What is the speed of light in vacuum?",
    options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"],
    correct: 1,
    explanation: "The speed of light in vacuum is approximately 3×10⁸ meters per second."
  }
];


const QUIZ_POINTS_MULTIPLIER = Number(process.env.QUIZ_POINTS_MULTIPLIER ?? 1);
const EXAM_POINTS_MULTIPLIER = Number(process.env.EXAM_POINTS_MULTIPLIER ?? 2);

import { openRouterChatCompletion } from "../lib/openrouter.js";
import pool from "../db.js";

export const generateQuiz = async (req, res) => {
    let { session_id, topic, quiz_data } = req.body;
    
    if (!Array.isArray(quiz_data) || quiz_data.length === 0) {
        try {
            let documentContext = "";
            if (session_id) {
                const [rows] = await pool.execute(
                    `SELECT d.text_content 
                     FROM sessions s 
                     JOIN documents d ON CONCAT('doc:', d.id) = s.document_url 
                     WHERE s.id = ? AND s.user_id = ?`,
                     [session_id, req.user.id]
                );
                if (rows.length > 0) {
                    const fullText = rows[0].text_content;
                    documentContext = "\n\nDOCUMENT:\n" + (fullText.length > 8000 ? fullText.slice(0, 8000) + "\n...[TRUNCATED]" : fullText);
                }
            }

            const promptTopic = topic || "general knowledge, history, or science";
            let prompt = `Generate a quiz about ${promptTopic} with exactly 5 multiple-choice questions. 
Return ONLY valid JSON in this structure:
{ "quiz": [ { "question": "...", "options": ["...", "...", "...", "..."], "correct": 0, "explanation": "..." } ] }
Ensure that 'correct' is an integer index (0-3). Output only the JSON.`;

            if (documentContext) {
                prompt = `Based ONLY on the document below, generate a quiz with exactly 5 multiple-choice questions.
Return ONLY valid JSON in this structure:
{ "quiz": [ { "question": "...", "options": ["...", "...", "...", "..."], "correct": 0, "explanation": "..." } ] }
Ensure that 'correct' is an integer index (0-3). Output only the JSON.${documentContext}`;
            }

            const completion = await openRouterChatCompletion({
                messages: [
                    { role: "system", content: "You output only strict JSON, no markdown." },
                    { role: "user", content: prompt },
                ],
                maxTokens: 1200,
            });

            let rawContent = completion.content.trim();
            if (rawContent.startsWith("```json")) rawContent = rawContent.replace(/```json\n?/g, "");
            if (rawContent.startsWith("```")) rawContent = rawContent.replace(/```\n?/g, "");
            if (rawContent.endsWith("```")) rawContent = rawContent.slice(0, -3).trim();

            const parsedJson = JSON.parse(rawContent);
            quiz_data = parsedJson?.quiz || DEFAULT_QUIZ;
        } catch (error) {
            console.error("AI quiz generation failed, falling back to default:", error);
            quiz_data = DEFAULT_QUIZ;
        }
    }

    try {
        const quizId = await createQuiz(req.user.id, session_id ?? null, quiz_data, 0, quiz_data.length);
        return res.status(201).json({ quiz_id: quizId, quiz_data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const submitQuiz = async (req, res) => {
    const { quiz_id, score, total_questions } = req.body;
    if (!quiz_id || typeof score !== "number" || typeof total_questions !== "number") {
        return res.status(400).json({ message: "quiz_id, score and total_questions are required" });
    }

    try {
        await updateQuizScore(quiz_id, score, total_questions);
        
        const user = await findUserById(req.user.id);
        const isPremium = user && user.plan !== 'free';
        const pointsPerCorrect = isPremium ? 4 : 2;
        const pointsToAward = score * pointsPerCorrect; // score is number of correct answers

        if (pointsToAward > 0) {
            await addUserPoints(req.user.id, pointsToAward);
            await createPointHistory(req.user.id, "quiz_correct", "quiz_correct", pointsToAward);
        }

        // Process streak — triggers on every quiz submission
        const { newStreak, longestStreak, milestone } = await processStreakOnActivity(req.user.id);

        return res.status(200).json({
            message: "Quiz submitted successfully",
            quiz_id: quiz_id,
            awarded_points: pointsToAward,
            streak: newStreak,
            longest_streak: longestStreak,
            streak_milestone: milestone
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const listQuizzes = async (req, res) => {
    try {
        const quizzes = await listQuizzesByUser(req.user.id);
        return res.status(200).json({ quizzes });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getQuiz = async (req, res) => {
    const { id } = req.params;
    try {
        const quiz = await findQuizById(id, req.user.id);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        return res.status(200).json({ quiz });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const generateExam = async (req, res) => {
    let { session_id, topic, exam_data } = req.body;
    
    if (!Array.isArray(exam_data) || exam_data.length === 0) {
        try {
            let documentContext = "";
            if (session_id) {
                const [rows] = await pool.execute(
                    `SELECT d.text_content 
                     FROM sessions s 
                     JOIN documents d ON CONCAT('doc:', d.id) = s.document_url 
                     WHERE s.id = ? AND s.user_id = ?`,
                     [session_id, req.user.id]
                );
                if (rows.length > 0) {
                    const fullText = rows[0].text_content;
                    // Keep context short for exam to avoid proxy timeouts
                    documentContext = "\n\nDOCUMENT:\n" + (fullText.length > 4000 ? fullText.slice(0, 4000) + "\n...[TRUNCATED]" : fullText);
                }
            }

            const promptTopic = topic || "general knowledge, history, or science";
            let prompt = `Generate an exam about ${promptTopic} with exactly 10 multiple-choice questions. 
Return ONLY valid JSON in this structure:
{ "exam": [ { "question": "...", "options": ["...", "...", "...", "..."], "correct": 0, "explanation": "..." } ] }
Ensure that 'correct' is an integer index (0-3). Output only the JSON.`;

            if (documentContext) {
                prompt = `Based ONLY on the document below, generate an exam with exactly 10 multiple-choice questions.
Return ONLY valid JSON in this structure:
{ "exam": [ { "question": "...", "options": ["...", "...", "...", "..."], "correct": 0, "explanation": "..." } ] }
Ensure that 'correct' is an integer index (0-3). Output only the JSON.${documentContext}`;
            }

            const completion = await openRouterChatCompletion({
                messages: [
                    { role: "system", content: "You output only strict JSON, no markdown." },
                    { role: "user", content: prompt },
                ],
                maxTokens: 1600,
                timeoutMs: 40000,
            });

            let rawContent = completion.content.trim();
            if (rawContent.startsWith("```json")) rawContent = rawContent.replace(/```json\n?/g, "");
            if (rawContent.startsWith("```")) rawContent = rawContent.replace(/```\n?/g, "");
            if (rawContent.endsWith("```")) rawContent = rawContent.slice(0, -3).trim();

            const parsedJson = JSON.parse(rawContent);
            exam_data = parsedJson?.exam || DEFAULT_QUIZ;
        } catch (error) {
            console.error("AI exam generation failed, falling back to default:", error);
            exam_data = DEFAULT_QUIZ;
        }
    }

    try {
        const examId = await createExam(req.user.id, session_id ?? null, exam_data, 0, exam_data.length);
        return res.status(201).json({ exam_id: examId, exam_data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const submitExam = async (req, res) => {
    const { session_id, exam_data, score, total_questions } = req.body;
    if (!Array.isArray(exam_data) || typeof score !== "number" || typeof total_questions !== "number") {
        return res.status(400).json({ message: "exam_data, score and total_questions are required" });
    }

    try {
        const examId = await createExam(req.user.id, session_id ?? null, exam_data, score, total_questions);
        
        // The frontend sends the percentage as `score`.
        const percentageScore = typeof score === 'number' ? score : 0;
        let pointsToAward = 0;
        
        if (percentageScore >= 70) {
            pointsToAward = 20;
        }

        if (pointsToAward > 0) {
            await addUserPoints(req.user.id, pointsToAward);
            await createPointHistory(req.user.id, "exam_bonus", "exam_bonus", pointsToAward);
        }

        // Process streak — triggers on every exam submission
        const { newStreak, longestStreak, milestone } = await processStreakOnActivity(req.user.id);

        return res.status(201).json({
            message: "Exam submitted successfully",
            exam_id: examId,
            awarded_points: pointsToAward,
            streak: newStreak,
            longest_streak: longestStreak,
            streak_milestone: milestone
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
