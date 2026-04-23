import { toAiHttpError } from "../lib/ai.js";
import { openRouterChatCompletion } from "../lib/openrouter.js";
import { findDocumentById } from "../models/documentModel.js";
import { getRelevantContext } from "../lib/rag.js";
import {
    createMessage,
    createSession,
    findSessionById,
    listMessagesBySession,
    listSessionsByUser,
    deleteSession,
    updateSessionDocument
} from "../models/sessionModel.js";

export const updateStudySessionDocument = async (req, res) => {
    const { session_id, document_url } = req.body;
    if (!session_id || !document_url) {
        return res.status(400).json({ message: "session_id and document_url are required" });
    }

    try {
        const updated = await updateSessionDocument(session_id, req.user.id, document_url);
        if (!updated) {
            return res.status(404).json({ message: "Session not found or unauthorized" });
        }
        return res.status(200).json({ message: "Session document updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteStudySession = async (req, res) => {
    const { session_id } = req.body;
    if (!session_id) {
        return res.status(400).json({ message: "session_id is required" });
    }

    try {
        const deleted = await deleteSession(session_id, req.user.id);
        if (!deleted) {
            return res.status(404).json({ message: "Session not found or unauthorized" });
        }
        return res.status(200).json({ message: "Session deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const createStudySession = async (req, res) => {
    const { title, subject, document_url } = req.body;
    if (!title || !subject) {
        return res.status(400).json({ message: "title and subject are required" });
    }

    try {
        const sessionId = await createSession(req.user.id, title, subject, document_url ?? null);
        return res.status(201).json({
            message: "Session created successfully",
            session_id: sessionId
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const listStudySessions = async (req, res) => {
    try {
        const sessions = await listSessionsByUser(req.user.id);
        return res.status(200).json({ sessions });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const listSessionMessages = async (req, res) => {
    const { session_id } = req.body;
    if (!session_id) {
        return res.status(400).json({ message: "session_id is required" });
    }

    try {
        const session = await findSessionById(session_id, req.user.id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        const messages = await listMessagesBySession(session_id);
        return res.status(200).json({ messages });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const sendSessionMessage = async (req, res) => {
    const { session_id, content } = req.body;
    if (!session_id || !content) {
        return res.status(400).json({ message: "session_id and content are required" });
    }

    try {
        const session = await findSessionById(session_id, req.user.id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Save user message first
        await createMessage(session_id, 'user', content);

        // Fetch history
        const history = await listMessagesBySession(session_id);
        const messages = [];
        
        if (session.document_url && typeof session.document_url === "string" && session.document_url.startsWith("doc:")) {
            const docId = Number(session.document_url.slice(4));
            console.log(`[AI] Session ${session_id} has document ${docId}`);
            
            if (Number.isFinite(docId)) {
                const doc = await findDocumentById(docId, req.user.id);
                if (doc?.text_content) {
                    const relevantContext = getRelevantContext(doc.text_content, content, 3);
                    console.log(`[AI] Context size: ${doc.text_content.length} chars, RAG size: ${relevantContext.length} chars`);
                    messages.push({
                        role: "system",
                        content:
                            "You are an expert educational tutor. The user has provided a document (PDF) for study. " +
                            "Use the RELEVANT DOCUMENT EXCERPTS provided below to answer all questions. " +
                            "If the answer isn't in the excerpts, tell the user you can only find information in the provided material, but try to help them understand related concepts.\n\n" +
                            `FILENAME: ${doc.filename || "Study Material"}\n\n` +
                            `RELEVANT DOCUMENT EXCERPTS:\n${relevantContext}`,
                    });
                } else {
                    console.warn(`[AI] Document ${docId} not found or has no text`);
                    messages.push({
                        role: "system",
                        content: "You are an educational tutor. The user tried to provide a document but it couldn't be read. Help them normally but mention the document issue if relevant.",
                    });
                }
            }
        } else {
            console.log(`[AI] Session ${session_id} has no document attached`);
            messages.push({
                role: "system",
                content:
                    "You are an educational tutor. Answer clearly and concisely. " +
                    "If the user refers to a PDF or document that isn't there, politely ask them to upload it using the paperclip icon.",
            });
        }

        // Map history (excluding the one we just saved since it's already there)
        for (const msg of history) {
            if (msg.content) {
                messages.push({
                    role: msg.role === "user" ? "user" : "assistant",
                    content: msg.content,
                });
            }
        }
        
        // Add the current message again if it wasn't captured in history above due to timing, 
        // but `listMessagesBySession` usually includes it since we awaited `createMessage`. 
        // We'll rely on history to have the latest message.

        const response = await openRouterChatCompletion({ messages });

        const aiReply = response.content || "I'm sorry, I couldn't process that.";
        await createMessage(session_id, 'ai', aiReply);

        return res.status(200).json({
            message: "Message sent successfully",
            ai_reply: aiReply
        });
    } catch (error) {
        const httpErr = toAiHttpError(error);
        console.error("AI processing error:", httpErr.detail, error);
        return res.status(httpErr.status).json({
            message: httpErr.message,
            detail: httpErr.detail
        });
    }
};
