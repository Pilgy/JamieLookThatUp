"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSources = void 0;
const https_1 = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
/**
 * Searches Google Custom Search API for authoritative sources
 * based on provided keywords
 */
exports.searchSources = (0, https_1.onCall)({
    cors: true,
    secrets: ["GOOGLE_SEARCH_API_KEY", "GOOGLE_SEARCH_ENGINE_ID"]
}, async (request) => {
    var _a, _b;
    const { keywords, query } = request.data;
    const GOOGLE_SEARCH_API_KEY = (_a = process.env.GOOGLE_SEARCH_API_KEY) === null || _a === void 0 ? void 0 : _a.trim();
    const SEARCH_ENGINE_ID = (_b = process.env.GOOGLE_SEARCH_ENGINE_ID) === null || _b === void 0 ? void 0 : _b.trim();
    if (!GOOGLE_SEARCH_API_KEY || !SEARCH_ENGINE_ID) {
        logger.error("Google Search API credentials not configured");
        throw new https_1.HttpsError("internal", "Search API not configured");
    }
    if (!keywords && !query) {
        throw new https_1.HttpsError("invalid-argument", "Keywords or query required");
    }
    // Build search query from keywords (limit to top 5 for relevance)
    const searchQuery = query || (keywords ? keywords.slice(0, 5).join(" ") : "");
    // Note: Site filtering is handled by the Programmable Search Engine configuration
    // No additional filters applied here to allow broader results
    try {
        const url = new URL("https://www.googleapis.com/customsearch/v1");
        url.searchParams.set("key", GOOGLE_SEARCH_API_KEY);
        url.searchParams.set("cx", SEARCH_ENGINE_ID);
        url.searchParams.set("q", searchQuery);
        url.searchParams.set("num", "5"); // Return top 5 results
        logger.info(`Searching Google for: ${searchQuery}`);
        const response = await fetch(url.toString());
        if (!response.ok) {
            const errorText = await response.text();
            logger.error(`Google API error: ${response.status} - ${errorText}`);
            throw new Error(`Google API returned ${response.status}`);
        }
        const data = await response.json();
        const results = (data.items || []).map((item) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            displayLink: item.displayLink
        }));
        logger.info(`Found ${results.length} sources for query: ${searchQuery}`);
        return { results };
    }
    catch (error) {
        logger.error("Google Search API Error", error);
        // Return empty results rather than failing completely
        // This allows the app to continue working even if search fails
        return { results: [] };
    }
});
//# sourceMappingURL=searchSources.js.map