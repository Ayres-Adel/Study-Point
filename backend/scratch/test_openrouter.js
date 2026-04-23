import dotenv from "dotenv";
dotenv.config({ path: '../.env' });

import { openRouterChatCompletion } from "../lib/openrouter.js";

async function test() {
    // create a huge text
    const textContent = "The secret code is 42. ".repeat(5000); // 115,000 chars

    const messages = [
        {
            role: "system",
            content: "Use the following document to answer questions:\n\n" + textContent
        },
        {
            role: "user",
            content: "What is the secret code?"
        }
    ];

    try {
        const response = await openRouterChatCompletion({
            messages,
            model: "meta-llama/llama-3.1-8b-instruct"
        });
        console.log("Response:", response.content);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
