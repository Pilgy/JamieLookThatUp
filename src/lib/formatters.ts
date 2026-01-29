// formatters.ts

/**
 * Formats analysis text with clickable links and styled sections
 * Note: SOURCES section removed - sources now come from Google Search API
 */
export function formatAnalysisWithLinks(text: string): string {
  if (!text) return '';

  // Regular expression to match URLs (kept for any inline URLs in analysis)
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Split the text into sections (SOURCES removed)
  const sections = text.split(/\n(?=KEYWORDS:|ANALYSIS:|INSIGHTS:)/);

  // Process each section
  const processedSections = sections.map((section) => {
    // Replace URLs with anchor tags
    const processedSection = section.replace(urlRegex, (url) => {
      // Clean up the URL if it ends with punctuation
      const cleanUrl = url.replace(/[.,;]$/, '');
      return `<a href="${cleanUrl}" 
        target="_blank" 
        rel="noopener noreferrer"
        class="text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline underline-offset-2 transition-colors"
      >${cleanUrl}</a>`;
    });

    // Helper function to create section HTML
    const createSection = (title: string, content: string) => `
      <div class="mb-5">
        <h3 class="text-base font-semibold uppercase tracking-wider text-surface-900 dark:text-surface-100 mb-2 border-b border-surface-200 dark:border-surface-700 pb-1 inline-block">${title}</h3>
        <div class="text-base leading-relaxed text-surface-700 dark:text-surface-300">${content.trim()}</div>
      </div>
    `;

    // Process different section types
    if (section.startsWith('KEYWORDS:')) {
      return createSection('Keywords', processedSection.replace('KEYWORDS:', ''));
    } else if (section.startsWith('ANALYSIS:')) {
      return createSection('Analysis', processedSection.replace('ANALYSIS:', ''));
    } else if (section.startsWith('INSIGHTS:')) {
      return createSection('Insights', processedSection.replace('INSIGHTS:', ''));
    }

    // Default case: just return processed text
    return processedSection;
  });

  return processedSections.join('\n');
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