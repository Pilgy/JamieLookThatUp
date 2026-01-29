import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    displayLink: string;
}

interface SearchResponse {
    results: SearchResult[];
}

/**
 * Searches for authoritative sources based on keywords
 * Uses Google Custom Search API via Cloud Function
 */
export async function searchSources(keywords: string[]): Promise<SearchResult[]> {
    if (!keywords || keywords.length === 0) {
        return [];
    }

    try {
        const searchFn = httpsCallable<
            { keywords: string[] },
            SearchResponse
        >(functions, 'searchSources');

        const result = await searchFn({ keywords });
        return result.data.results;
    } catch (error) {
        console.error('Failed to search sources:', error);
        // Return empty array on error to avoid breaking the UI
        return [];
    }
}
