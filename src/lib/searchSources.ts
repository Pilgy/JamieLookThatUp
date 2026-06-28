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
    error?: string;
}

/**
 * Searches for authoritative sources based on keywords
 * Uses Google Custom Search API via Cloud Function
 */
export async function searchSources(keywords: string[]): Promise<SearchResult[]> {
    console.log('[SEARCH API DEBUG] searchSources called with keywords:', keywords);

    if (!keywords || keywords.length === 0) {
        console.log('[SEARCH API DEBUG] Empty keywords - returning []');
        return [];
    }

    try {
        console.log('[SEARCH API DEBUG] Calling Cloud Function searchSources...');
        const searchFn = httpsCallable<
            { keywords: string[] },
            SearchResponse
        >(functions, 'searchSources');

        const result = await searchFn({ keywords });
        console.log('[SEARCH API DEBUG] Cloud Function returned:', result.data);
        
        if (result.data.error) {
            console.error('[SEARCH API DEBUG] Backend returned search error:', result.data.error);
        }
        
        return result.data.results;
    } catch (error) {
        console.error('[SEARCH API DEBUG] Cloud Function FAILED:', error);
        // Log more details if available
        if (error instanceof Error) {
            console.error('[SEARCH API DEBUG] Error name:', error.name);
            console.error('[SEARCH API DEBUG] Error message:', error.message);
        }
        // Return empty array on error to avoid breaking the UI
        return [];
    }
}
