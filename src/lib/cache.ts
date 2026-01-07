// Simple in-memory cache for Gemini API responses
const cache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCached(key: string): string | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

export function setCache(key: string, data: string): void {
    cache.set(key, { data, timestamp: Date.now() });
}

export function hashInput(text: string, keywords: string[]): string {
    // Simple hash using first 100 chars of text + keywords
    const input = text.slice(0, 100) + keywords.join(',');
    return btoa(encodeURIComponent(input));
}

export function clearCache(): void {
    cache.clear();
}
