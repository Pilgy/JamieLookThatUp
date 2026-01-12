import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { getCached, setCache, hashInput } from './cache';

interface TranscriptionData {
  text: string;
  timestamp: string;
}

interface GeminiResponse {
  analysis: string;
  summary?: string;
}

// FactCheck interface - reserved for future fact-checking implementation
// interface FactCheck {
//   claim: string;
//   status: 'accurate' | 'inaccurate' | 'needs-context' | 'unclear';
//   correction?: string;
//   sources: string[];
//   confidence: 'high' | 'medium' | 'low';
// }

/**
 * Jamie's system instruction - establishes the expert facilitator persona
 */
const JAMIE_SYSTEM_INSTRUCTION = `You are Jamie, an expert conversation facilitator and research mediator.

CORE PRINCIPLES:
- Your goal is to deepen dialogue, not merely summarize
- Connect ideas across time and identify unspoken tensions
- Provide only authoritative, peer-reviewed, or institutional sources (.gov, .edu, established journals)
- Use a warm but intellectually rigorous tone

OUTPUT REQUIREMENTS:
- Always format responses with clear sections (KEYWORDS, ANALYSIS, INSIGHTS, SOURCES)
- URLs must be complete, valid, and directly relevant
- End conversation summaries with a Socratic question that advances understanding
`;



/**
 * Extract keywords from transcription
 */
async function extractKeywords(text: string): Promise<string> {
  const prompt = `Extract 5-7 high-leverage keywords that represent conceptual nodes for research and thematic bridging.

Prioritize:
- Terms that connect to broader intellectual frameworks
- Concepts with rich academic or policy discourse
- Keywords that invite deeper exploration

Format: KEYWORDS: word1, word2, ...

Text: "${text.trim()}"`;

  return await callGeminiAPI(prompt, 512, JAMIE_SYSTEM_INSTRUCTION);
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
async function handleDirectRequest(
  text: string,
  selectedKeywords: string[] = [],
  previousTranscriptions: TranscriptionData[] = []
): Promise<string> {
  const query = text.replace(/^hey jamie,?\s+/i, '');

  const conversationContext = previousTranscriptions.length > 0
    ? `CONVERSATION CONTEXT:\n${previousTranscriptions.map(t => `- ${t.text}`).join('\n')}\n\n`
    : '';

  const keywordContext = selectedKeywords.length > 0
    ? `SELECTED TOPICS: ${selectedKeywords.join(', ')}\n\n`
    : '';

  const prompt = `${conversationContext}${keywordContext}USER REQUEST: ${query}

Provide a response that:
- Connects to the conversation history
- Surfaces relevant academic or institutional sources
- Advances understanding with follow-up questions or insights

Format your response naturally, but include 2-3 authoritative URLs as citations.`;

  return await callGeminiAPI(prompt, 1024, JAMIE_SYSTEM_INSTRUCTION);
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

  const keywordFocus = selectedKeywords.length > 0
    ? `KEYWORD FOCUS: Pay special attention to how these concepts evolved: ${selectedKeywords.join(', ')}\n\n`
    : '';

  const prompt = `${keywordFocus}ROLE: You are Jamie, an expert conversation facilitator.
GOAL: Deepen the dialogue by connecting ideas and surfacing what's unspoken.

INSTRUCTIONS:
1. Identify distinct viewpoints or evolving themes in the transcript
2. Note any tensions, agreements, or complementary ideas the speakers haven't explicitly connected
3. Output a 2-3 sentence "bridge" that connects the current topic to previous topics
4. End with a single Socratic question designed to move the group toward higher understanding

${selectedKeywords.length > 0
      ? `Focus your bridge and question on the selected keywords: ${selectedKeywords.join(', ')}`
      : 'Look for thematic throughlines across the entire conversation'}

TRANSCRIPT:
${sorted.map(t => `- ${t.text}`).join('\n')}`;

  return await callGeminiAPI(prompt, 512, JAMIE_SYSTEM_INSTRUCTION);
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

  // STRICT KEYWORD FOCUS when keywords are selected
  if (selectedKeywords.length > 0) {
    const prompt = `${history}STRICT FOCUS: The user has selected these keywords: ${selectedKeywords.join(', ')}

Your task is to:
1. Define each keyword rigorously and explain their precise meanings in the conversation context
2. Identify the CONNECTIONS between these specific concepts
3. Surface any tensions, synergies, or unspoken relationships

Respond with exactly 4 sections:

KEYWORDS: Restate the selected keywords with brief definitional context
ANALYSIS: 2-3 sentences explaining how these specific concepts interconnect
INSIGHTS: 2 key insights about the relationship between ${selectedKeywords.join(' and ')}
SOURCES: 2-3 authoritative URLs specifically about the intersection of these topics (prioritize .gov, .edu, academic journals)

Text: "${text.trim()}"`;

    return await callGeminiAPI(prompt, 1024, JAMIE_SYSTEM_INSTRUCTION);
  }

  // THEMATIC EXPLORATION  (no keywords selected)
  const prompt = `${history}Analyze this transcription for thematic connect ions and unspoken tensions.

Respond with exactly 4 sections:

KEYWORDS: 5-7 relevant terms that could serve as research nodes
ANALYSIS: 2-3 sentence observation connecting main themes
INSIGHTS: 2 key insights with context (what's being explored? what's unstated?)
SOURCES: 2-3 authoritative URLs for deeper exploration (prioritize .gov, .edu, peer-reviewed sources)

Text: "${text.trim()}"`;

  return await callGeminiAPI(prompt, 1024, JAMIE_SYSTEM_INSTRUCTION);
}

/**
 * Calls the Gemini Cloud Function
 */
async function callGeminiAPI(
  prompt: string,
  maxTokens: number = 1024,
  systemInstruction?: string
): Promise<string> {
  try {
    const analyzeFn = httpsCallable<
      { prompt: string; maxOutputTokens: number; systemInstruction?: string },
      { text: string }
    >(functions, 'analyzeWithGemini');

    const result = await analyzeFn({
      prompt,
      maxOutputTokens: maxTokens,
      ...(systemInstruction && { systemInstruction })
    });

    return result.data.text;
  } catch (error) {
    console.error('Cloud Function call failed:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to analyze text: ${error.message}`);
    }
    throw new Error('Failed to analyze text via Cloud Function');
  }
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
      ? await handleDirectRequest(text, selectedKeywords, previousTranscriptions)
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