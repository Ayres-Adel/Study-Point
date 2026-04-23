import fs from "fs";
import pdf from "pdf-parse";
import { toAiHttpError } from "../lib/ai.js";
import { openRouterChatCompletion } from "../lib/openrouter.js";
import { createDocument } from "../models/documentModel.js";
import { createQuiz } from "../models/assessmentModel.js";

export const uploadDocument = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const fileBuffer = fs.readFileSync(req.file.path);
        let textContent = "";
        try {
            const parsed = await pdf(fileBuffer);
            textContent = (parsed.text || "").trim();
        } catch (e) {
            return res.status(400).json({ message: "Invalid or unreadable PDF" });
        }
        if (!textContent) {
            return res.status(400).json({ message: "Could not extract text from PDF" });
        }

        // Clean up locally stored file to save space
        fs.unlinkSync(req.file.path);

        const documentId = await createDocument(
            req.user.id,
            req.file.originalname || null,
            req.file.mimetype || null,
            textContent
        );

        let quizData = null;
        let quizId = null;
        try {
            // Generate quiz JSON using OpenRouter
            // Truncate text for quiz generation to prevent context overflow
            const truncatedText = textContent.length > 8000 ? textContent.slice(0, 8000) + "\n\n...[TRUNCATED]" : textContent;
            
            const prompt =
                "Based ONLY on the document below, generate a quiz with exactly 5 multiple-choice questions. " +
                "Return ONLY valid JSON in this structure:\n" +
                '{ "quiz": [ { "question": "...", "options": ["...", "...", "...", "..."], "correct": 0, "explanation": "..." } ] }\n\n' +
                `DOCUMENT:\n${truncatedText}`;

            const completion = await openRouterChatCompletion({
                messages: [
                    { role: "system", content: "You output only strict JSON, no markdown." },
                    { role: "user", content: prompt },
                ],
                maxTokens: 1200,
            });

            let rawContent = completion.content.trim();
            if (rawContent.startsWith("```json")) {
                rawContent = rawContent.replace(/```json\n?/g, "");
            }
            if (rawContent.startsWith("```")) {
                rawContent = rawContent.replace(/```\n?/g, "");
            }
            if (rawContent.endsWith("```")) {
                rawContent = rawContent.slice(0, -3).trim();
            }

            const parsedJson = JSON.parse(rawContent);
            quizData = parsedJson?.quiz;
            
            if (Array.isArray(quizData) && quizData.length > 0) {
                quizId = await createQuiz(req.user.id, null, quizData, 0, quizData.length);
            }
        } catch (quizError) {
            console.error("Quiz generation failed during upload, but continuing upload:", quizError.message || quizError);
            quizData = null;
        }

        return res.status(200).json({
            message: "Document registered and processed successfully",
            document_url: `doc:${documentId}`,
            quiz_id: quizId,
            quiz_data: Array.isArray(quizData) ? quizData : undefined
        });
    } catch (error) {
        const httpErr = toAiHttpError(error);
        console.error("AI upload processing error:", httpErr.detail, error);
        return res.status(httpErr.status).json({
            message: httpErr.message,
            detail: httpErr.detail
        });
    }
};
