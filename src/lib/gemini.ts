// gemini.ts

const GEMINI_API_KEY = 'AIzaSyD0uXfwvkRXM8-tVD6XN6zw29WVIUSS-Q0';
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent';

/**
 * Calls the Gemini model (gemini-2.0-flash-lite) to analyze text and return
 * a structured response with four sections:
 * 
 * 1. KEYWORDS
 * 2. ANALYSIS
 * 3. INSIGHTS
 * 4. SOURCES
 */
export async function analyzeWithGemini(text: string): Promise<string> {
  if (!text.trim()) {
    throw new Error('Empty text provided for analysis');
  }

  const userPrompt = `
You are a factual assistant. Provide a concise response with the following sections only:

KEYWORDS:
- A short bullet or comma-separated list of relevant keywords or main topics from the transcription.

ANALYSIS:
- A brief summary of the main points and how they connect.

INSIGHTS:
- Provide 2-3 key insights that:
  - Explain relationships between the keywords
  - Add important context or background information
  - Correct any misconceptions if present
  - Highlight interesting connections or implications
  - Focus on lesser-known but relevant facts

SOURCES:
- A bullet or numbered list of valid, high-quality URLs from well-known domains
- Prioritize academic sources, research papers, and authoritative news sources
- Include Wikipedia only if highly relevant
- Never separate URLs with "[". ONLY LIST EACH URL ONCE
- Focus on sources that support the insights provided

No disclaimers or extra text beyond these sections. No casual greetings or disclaimers.

Transcription: "${text.trim()}"
`.trim();

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
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,   // slightly increased for more insightful connections
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
      }),
    });

    // Handle any non-2xx response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Gemini API returned non-OK status. Code: ${response.status}, Response: ${errorText}`
      );
      throw new Error(
        `API request failed with status ${response.status}: ${errorText}`
      );
    }

    // Parse the JSON response from the Gemini API
    const data = await response.json();

    // Extract the raw text from the first candidate
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!rawText) {
      console.error('Gemini response missing expected fields:', data);
      throw new Error('Invalid or empty response from Gemini API');
    }

    // Return the raw text (all sections)
    return rawText;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error calling Gemini API:', error.message);
      throw new Error(`Failed to analyze text with Gemini: ${error.message}`);
    }
    console.error('Unknown error calling Gemini API:', error);
    throw new Error('Failed to analyze text with Gemini: Unknown error');
  }
}