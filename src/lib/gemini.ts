// gemini.ts
import { config } from './config';
import { getCached, setCache, hashInput } from './cache';

const GEMINI_API_KEY = config.gemini.apiKey;
const GEMINI_API_URL = `${config.gemini.apiUrl}/${config.gemini.model}:generateContent`;

interface TranscriptionData {
  text: string;
  timestamp: string;
}

interface GeminiResponse {
  analysis: string;
  summary?: string;
}

interface GeminiAPIResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

/**
 * Extract keywords from transcription
 */
async function extractKeywords(text: string): Promise<string> {
  const prompt = `Extract 5-7 keywords from this text. Format: KEYWORDS: word1, word2, ...

Text: "${text.trim()}"`;

  return await callGeminiAPI(prompt, 512);
}

/**
 * Determines if the text is a direct information request
 */
function isDirectRequest(text: string): boolean {
  return /^hey jamie,?\s+/i.test(text);
}

/**
 * Handles direct "Hey Jamie" requests
 */
async function handleDirectRequest(text: string, selectedKeywords: string[] = []): Promise<string> {
  const query = text.replace(/^hey jamie,?\s+/i, '');
  const context = selectedKeywords.length > 0
    ? `Context topics: ${selectedKeywords.join(', ')}. `
    : '';

  return await callGeminiAPI(context + query, 1024);
}

/**
 * Generate a conversation summary
 */
async function generateConversationSummary(
  transcriptions: TranscriptionData[],
  selectedKeywords: string[] = []
): Promise<string> {
  if (transcriptions.length === 0) return '';

  const sorted = transcriptions
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const topics = selectedKeywords.length > 0
    ? `Emphasize: ${selectedKeywords.join(', ')}\n\n`
    : '';

  const prompt = `${topics}Synthesize this conversation into 2-3 sentences. Focus on themes and connections, not quotes.

${sorted.map(t => `- ${t.text}`).join('\n')}`;

  return await callGeminiAPI(prompt, 512);
}

/**
 * Analyze transcribed text with structured output
 */
async function handleAnalysis(
  text: string,
  selectedKeywords: string[] = [],
  previousTranscriptions: TranscriptionData[] = []
): Promise<string> {
  const history = previousTranscriptions.length > 0
    ? `Previous context:\n${previousTranscriptions.map(t => `- ${t.text}`).join('\n')}\n\n`
    : '';

  const focus = selectedKeywords.length > 0
    ? `Focus on: ${selectedKeywords.join(', ')}\n\n`
    : '';

  const prompt = `${history}${focus}Respond with exactly 4 sections:

KEYWORDS: 5-7 relevant terms
ANALYSIS: 2-3 sentence summary connecting main points
INSIGHTS: 2 key insights with context
SOURCES: 2-3 authoritative URLs (no duplicates)

Text: "${text.trim()}"`;

  return await callGeminiAPI(prompt, 1024);
}

/**
 * Makes the actual API call to Gemini with exponential backoff
 */
async function callGeminiAPI(prompt: string, maxTokens: number = 1024): Promise<string> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: maxTokens,
          },
        }),
      });

      if (response.status === 429) {
        // Rate limited - wait and retry
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data: GeminiAPIResponse = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!rawText) {
        throw new Error('Invalid response format from Gemini API');
      }

      return rawText;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`Gemini API attempt ${attempt + 1} failed:`, lastError.message);

      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Failed to process with Gemini after ${maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Main entry point for Gemini integration
 */
export async function analyzeWithGemini(
  text: string,
  selectedKeywords: string[] = [],
  keywordsOnly: boolean = false,
  allTranscriptions: TranscriptionData[] = []
): Promise<GeminiResponse> {
  if (!text.trim()) {
    throw new Error('Empty text provided for analysis');
  }

  // Check cache for non-keyword requests
  if (!keywordsOnly) {
    const cacheKey = hashInput(text, selectedKeywords);
    const cached = getCached(cacheKey);
    if (cached) {
      console.log('Returning cached analysis');
      return JSON.parse(cached);
    }
  }

  try {
    if (keywordsOnly) {
      const analysis = await extractKeywords(text);
      return { analysis };
    }

    const previousTranscriptions = allTranscriptions.filter(t => t.text !== text);

    const analysis = isDirectRequest(text)
      ? await handleDirectRequest(text, selectedKeywords)
      : await handleAnalysis(text, selectedKeywords, previousTranscriptions);

    const summary = await generateConversationSummary(
      [...previousTranscriptions, { text, timestamp: new Date().toISOString() }],
      selectedKeywords
    );

    const result = { analysis, summary };

    // Cache the result
    const cacheKey = hashInput(text, selectedKeywords);
    setCache(cacheKey, JSON.stringify(result));

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
    throw new Error('Analysis failed: Unknown error');
  }
}