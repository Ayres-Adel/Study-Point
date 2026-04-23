import dotenv from "dotenv";
dotenv.config();

import { getAiClient, getGeminiModel } from "../lib/ai.js";

async function test() {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: getGeminiModel(),
        contents: [
            { role: "user", parts: [{ text: "Hello, who are you?" }] },
            { role: "model", parts: [{ text: "I am a helpful assistant." }] },
            { role: "user", parts: [{ text: "What did I just say?" }] }
        ],
        config: {
            systemInstruction: "You are a witty AI."
        }
    });

    console.log(response.text);
}

test().catch(console.error);
