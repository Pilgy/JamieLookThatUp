"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeWithGemini = exports.searchSources = void 0;
const https_1 = require("firebase-functions/v2/https");
const generative_ai_1 = require("@google/generative-ai");
const logger = require("firebase-functions/logger");
// Re-export the searchSources function
var searchSources_1 = require("./searchSources");
Object.defineProperty(exports, "searchSources", { enumerable: true, get: function () { return searchSources_1.searchSources; } });
// Initialize Gemini
// Note: In production, we'll set the API Key via:
// firebase functions:secrets:set GEMINI_API_KEY
// and access it via process.env.GEMINI_API_KEY or define it in code if using functions:config
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY || "");
exports.analyzeWithGemini = (0, https_1.onCall)({ cors: true, secrets: ["GEMINI_API_KEY"] }, async (request) => {
    if (!GEMINI_API_KEY) {
        logger.error("GEMINI_API_KEY is not set");
        throw new https_1.HttpsError("internal", "API key not configured");
    }
    const { prompt, systemInstruction } = request.data;
    if (!prompt || typeof prompt !== "string") {
        throw new https_1.HttpsError("invalid-argument", "The function must be called with a 'prompt' argument.");
    }
    try {
        // Create model configuration
        const modelConfig = { model: "gemini-2.0-flash-lite" };
        // Add system instruction if provided
        if (systemInstruction && typeof systemInstruction === "string") {
            modelConfig.systemInstruction = systemInstruction;
        }
        // Initialize model with configuration
        const model = genAI.getGenerativeModel(modelConfig);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return { text };
    }
    catch (error) {
        logger.error("Gemini API Error", error);
        throw new https_1.HttpsError("internal", "Failed to process request with Gemini", error);
    }
});
//# sourceMappingURL=index.js.map