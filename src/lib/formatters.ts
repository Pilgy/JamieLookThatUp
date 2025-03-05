export function formatAnalysisWithLinks(text: string): string {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Split the text into sections
  const sections = text.split(/\n(?=KEYWORDS:|ANALYSIS:|INSIGHTS:|SOURCES:)/);
  
  // Process each section
  const processedSections = sections.map(section => {
    // Replace URLs with anchor tags
    const processedSection = section.replace(urlRegex, (url) => {
      // Clean up the URL if it ends with punctuation
      const cleanUrl = url.replace(/[.,;]$/, '');
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">${cleanUrl}</a>`;
    });

    // FIX #3: Optimize spacing in the model response
    if (section.startsWith('KEYWORDS:')) {
      return `<div class="mb-3">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">Keywords</h3>
        <div class="text-gray-700 dark:text-gray-300">${processedSection.replace('KEYWORDS:', '').trim()}</div>
      </div>`;
    } else if (section.startsWith('ANALYSIS:')) {
      return `<div class="mb-3">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">Analysis</h3>
        <div class="text-gray-700 dark:text-gray-300">${processedSection.replace('ANALYSIS:', '').trim()}</div>
      </div>`;
    } else if (section.startsWith('INSIGHTS:')) {
      return `<div class="mb-3">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">Insights</h3>
        <div class="text-gray-700 dark:text-gray-300">${processedSection.replace('INSIGHTS:', '').trim()}</div>
      </div>`;
    } else if (section.startsWith('SOURCES:')) {
      return `<div class="mb-3">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">Sources</h3>
        <div class="text-gray-700 dark:text-gray-300">${processedSection.replace('SOURCES:', '').trim()}</div>
      </div>`;
    }
    return processedSection;
  });

  return processedSections.join('\n');
}

export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];
  return matches.map(url => url.replace(/[.,;]$/, ''));
}

// New function to extract keywords from the analysis
export function extractKeywords(text: string): string[] {
  // Find the KEYWORDS section
  const keywordsMatch = text.match(/KEYWORDS:(.*?)(?=ANALYSIS:|$)/s);
  
  if (!keywordsMatch || !keywordsMatch[1]) {
    return [];
  }
  
  const keywordsText = keywordsMatch[1].trim();
  
  // Handle both bullet points and comma-separated formats
  if (keywordsText.includes('- ')) {
    // Bullet point format
    return keywordsText
      .split('\n')
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(keyword => keyword.length > 0);
  } else {
    // Comma-separated format
    return keywordsText
      .split(',')
      .map(keyword => keyword.trim())
      . filter(keyword => keyword.length > 0);
  }
}