// formatters.ts

/**
 * Formats analysis text with clickable links and styled sections
 */
export function formatAnalysisWithLinks(text: string): string {
  if (!text) return '';

  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Split the text into sections
  const sections = text.split(/\n(?=KEYWORDS:|ANALYSIS:|INSIGHTS:|SOURCES:)/);

  // Process each section
  const processedSections = sections.map((section) => {
    // Replace URLs with anchor tags
    const processedSection = section.replace(urlRegex, (url) => {
      // Clean up the URL if it ends with punctuation
      const cleanUrl = url.replace(/[.,;]$/, '');
      return `<a href="${cleanUrl}" 
        target="_blank" 
        rel="noopener noreferrer"
        class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
      >${cleanUrl}</a>`;
    });

    // Helper function to create section HTML
    const createSection = (title: string, content: string) => `
      <div class="mb-3">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">${title}</h3>
        <div class="text-gray-700 dark:text-gray-300">${content.trim()}</div>
      </div>
    `;

    // Process different section types
    if (section.startsWith('KEYWORDS:')) {
      return createSection('Keywords', processedSection.replace('KEYWORDS:', ''));
    } else if (section.startsWith('ANALYSIS:')) {
      return createSection('Analysis', processedSection.replace('ANALYSIS:', ''));
    } else if (section.startsWith('INSIGHTS:')) {
      return createSection('Insights', processedSection.replace('INSIGHTS:', ''));
    } else if (section.startsWith('SOURCES:')) {
      return createSection('Sources', processedSection.replace('SOURCES:', ''));
    }

    // Default case: just return processed text
    return processedSection;
  });

  return processedSections.join('\n');
}

/**
 * Extracts URLs from text content
 */
export function extractUrls(text: string): string[] {
  if (!text) return [];

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];
  
  return matches
    .map((url) => url.replace(/[.,;]$/, '')) // Remove trailing punctuation
    .filter((url, index, self) => self.indexOf(url) === index); // Remove duplicates
}

/**
 * Extracts keywords from the KEYWORDS section of the analysis
 */
export function extractKeywords(text: string): string[] {
  if (!text) return [];

  const keywordsMatch = text.match(/KEYWORDS:(.*?)(?=ANALYSIS:|$)/s);
  if (!keywordsMatch || !keywordsMatch[1]) {
    return [];
  }

  const keywordsText = keywordsMatch[1].trim();

  // Process keywords based on format (bullet points or comma-separated)
  const keywords = keywordsText.includes('- ')
    ? keywordsText
        .split('\n')
        .map((line) => line.replace(/^-\s*/, '').trim())
    : keywordsText
        .split(',')
        .map((keyword) => keyword.trim());

  // Filter out empty keywords and remove duplicates
  return [...new Set(keywords.filter((keyword) => keyword.length > 0))];
}