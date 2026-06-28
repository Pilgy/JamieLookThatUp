"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeWithGemini = exports.searchSources = void 0;
const https_1 = require("firebase-functions/v2/https");
const genai_1 = require("@google/genai");
const logger = require("firebase-functions/logger");
// Re-export the searchSources function
var searchSources_1 = require("./searchSources");
Object.defineProperty(exports, "searchSources", { enumerable: true, get: function () { return searchSources_1.searchSources; } });
exports.analyzeWithGemini = (0, https_1.onCall)({ cors: true, secrets: ["GEMINI_API_KEY"] }, async (request) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        logger.error("GEMINI_API_KEY is not set in process.env");
        throw new https_1.HttpsError("internal", "API key not configured");
    }
    const { prompt, systemInstruction } = request.data;
    if (!prompt || typeof prompt !== "string") {
        throw new https_1.HttpsError("invalid-argument", "The function must be called with a 'prompt' argument.");
    }
    try {
        const ai = new genai_1.GoogleGenAI({ apiKey });
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
    }
    catch (error) {
        logger.error("Gemini API Error", error);
        throw new https_1.HttpsError("internal", "Failed to process request with Gemini", error);
    }
});
//# sourceMappingURL=index.js.map