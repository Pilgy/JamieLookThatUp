import { onCall, HttpsError } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as logger from "firebase-functions/logger";

// Initialize Gemini
// Note: In production, we'll set the API Key via:
// firebase functions:secrets:set GEMINI_API_KEY
// and access it via process.env.GEMINI_API_KEY or define it in code if using functions:config
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

export const analyzeWithGemini = onCall({ cors: true, secrets: ["GEMINI_API_KEY"] }, async (request) => {
    if (!GEMINI_API_KEY) {
        logger.error("GEMINI_API_KEY is not set");
        throw new HttpsError("internal", "API key not configured");
    }

    const { prompt } = request.data;

    if (!prompt || typeof prompt !== "string") {
        throw new HttpsError("invalid-argument", "The function must be called with a 'prompt' argument.");
    }

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return { text };
    } catch (error) {
        logger.error("Gemini API Error", error);
        throw new HttpsError("internal", "Failed to process request with Gemini", error);
    }
});
