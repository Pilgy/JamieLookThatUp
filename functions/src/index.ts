import { onCall, HttpsError } from "firebase-functions/v2/https";
import { GoogleGenAI } from "@google/genai";
import * as logger from "firebase-functions/logger";

// Re-export the searchSources function
export { searchSources } from "./searchSources";

export const analyzeWithGemini = onCall({ cors: true, secrets: ["GEMINI_API_KEY"] }, async (request) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        logger.error("GEMINI_API_KEY is not set in process.env");
        throw new HttpsError("internal", "API key not configured");
    }

    const { prompt, systemInstruction } = request.data;

    if (!prompt || typeof prompt !== "string") {
        throw new HttpsError("invalid-argument", "The function must be called with a 'prompt' argument.");
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

        logger.info(`Calling Gemini model: ${modelName}`);
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction || undefined
            }
        });

        return { text: response.text || "" };
    } catch (error) {
        logger.error("Gemini API Error", error);
        throw new HttpsError("internal", "Failed to process request with Gemini", error);
    }
});
