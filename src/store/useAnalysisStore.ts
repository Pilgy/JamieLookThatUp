import { create } from 'zustand';
import { analyzeWithGemini } from '../lib/gemini';
import { extractKeywords } from '../lib/formatters';
import { useTranscriptionStore } from './useTranscriptionStore';
import { useKeywordStore } from './useKeywordStore';
import { useSourceStore } from './useSourceStore';
import { useSummaryStore } from './useSummaryStore';
import { useSessionStore } from './useSessionStore';

interface AnalysisState {
  isAnalyzing: boolean;
  error: string | null;
  analyzeSegment: (transcriptionId: string) => Promise<void>;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  isAnalyzing: false,
  error: null,

  analyzeSegment: async (transcriptionId) => {
    const transcriptionStore = useTranscriptionStore.getState();
    const transcription = transcriptionStore.transcriptions.find(t => t.id === transcriptionId);
    if (!transcription) return;

    set({ isAnalyzing: true, error: null });

    try {
      const keywordsForAnalysis = transcription.selectedKeywords || [];
      const history = transcriptionStore.transcriptions
        .filter(t => t.id !== transcriptionId)
        .map(t => ({ text: t.text, timestamp: t.timestamp }));

      const { analysis, searchQuery } = await analyzeWithGemini(
        transcription.text,
        keywordsForAnalysis,
        false,
        history,
        true // skipSummary: true to decouple summary generation
      );

      if (!analysis) {
        throw new Error('Failed to generate analysis');
      }

      const newKeywords = extractKeywords(analysis);

      // Update the transcription in the store
      transcriptionStore.updateTranscription(transcriptionId, {
        isAnalyzed: true,
        keywords: newKeywords,
        analysis
      });

      // Add to global keyword bank
      useKeywordStore.getState().addKeywords(newKeywords);

      // Determine search terms and trigger sources search
      let searchTerms: string[] = [];
      if (keywordsForAnalysis.length > 0) {
        searchTerms = keywordsForAnalysis;
      } else if (searchQuery) {
        searchTerms = [searchQuery];
      } else {
        searchTerms = newKeywords;
      }

      // Trigger web search asynchronously
      await useSourceStore.getState().searchSourcesForSegment(transcriptionId, searchTerms);

      const updatedTranscription = useTranscriptionStore.getState().transcriptions.find(t => t.id === transcriptionId);
      const newSources = updatedTranscription?.sources || [];

      // Sync session state to Firebase asynchronously
      await useSessionStore.getState().syncSessionState(analysis, newSources);

      // Queue summary update asynchronously (debounced)
      useSummaryStore.getState().queueSummaryUpdate();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error analyzing segment:', errorMessage);
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ isAnalyzing: false });
    }
  }
}));
