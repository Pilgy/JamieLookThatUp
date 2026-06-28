import { onCall, HttpsError } from "firebase-functions/v2/https";
import { GoogleGenAI } from "@google/genai";
import * as logger from "firebase-functions/logger";

interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    displayLink: string;
}

interface SearchResponse {
    results: SearchResult[];
    error?: string;
}

/**
 * Searches the web for authoritative sources using Gemini Google Search Grounding
 * and returns structured JSON results.
 */
export const searchSources = onCall(
    {
        cors: true,
        secrets: ["GEMINI_API_KEY"]
    },
    async (request): Promise<SearchResponse> => {
        const { keywords, query } = request.data as { keywords?: string[]; query?: string };

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

        if (!GEMINI_API_KEY) {
            logger.error("GEMINI_API_KEY not configured");
            throw new HttpsError("internal", "API key not configured");
        }

        if (!keywords && !query) {
            throw new HttpsError("invalid-argument", "Keywords or query required");
        }

        const searchQuery = query || (keywords ? keywords.slice(0, 5).join(" ") : "");

        try {
            logger.info(`Searching the web via Gemini Grounding for: ${searchQuery}`);

            const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
            
            const prompt = `Perform a Google Search to find high-quality, reputable web sources and articles about the following topics: ${searchQuery}.`;

            const response = await ai.models.generateContent({
                model: modelName,
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }]
                }
            });

            const candidate = response.candidates?.[0];
            const groundingMetadata = candidate?.groundingMetadata;
            
            const sources: Array<{ title: string; link: string; snippet: string }> = [];
            
            // 1. Extract from groundingChunks (contains the web source URIs and titles)
            const chunks = groundingMetadata?.groundingChunks || [];
            for (const chunk of chunks) {
                if (chunk.web?.uri) {
                    sources.push({
                        title: chunk.web.title || "Web Source",
                        link: chunk.web.uri,
                        snippet: chunk.web.title ? `Cited from: ${chunk.web.title}` : `Source: ${chunk.web.uri}`
                    });
                }
            }
            
            // 2. Fallback to groundingSources if chunks are empty
            if (sources.length === 0) {
                const gSources = (groundingMetadata as any)?.groundingSources || [];
                for (const src of gSources) {
                    const web = src.web || src;
                    if (web.uri) {
                        sources.push({
                            title: web.title || "Web Source",
                            link: web.uri,
                            snippet: web.title ? `Cited from: ${web.title}` : `Source: ${web.uri}`
                        });
                    }
                }
            }
            
            // Deduplicate sources by URL
            const uniqueSources = Array.from(new Map(sources.map(s => [s.link, s])).values());

            const results: SearchResult[] = uniqueSources.map((item) => {
                let displayLink = "";
                try {
                    displayLink = item.link ? new URL(item.link).hostname : "";
                } catch (e) {
                    displayLink = item.link || "";
                }

                return {
                    title: item.title || "Web Source",
                    link: item.link || "",
                    snippet: item.snippet || "",
                    displayLink: displayLink
                };
            });

            logger.info(`Successfully retrieved ${results.length} grounded sources.`);

            return { results };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            logger.error("Gemini Search Grounding Error", error);

            return {
                results: [],
                error: `Google Search Grounding failed: ${errorMessage}`
            };
        }
    }
);
