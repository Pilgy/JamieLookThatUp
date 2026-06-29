import { create } from 'zustand';
import { generateConversationSummary } from '../lib/gemini';
import { useTranscriptionStore } from './useTranscriptionStore';

interface SummaryState {
  conversationSummary: string;
  diveDeeper: string;
  isSummarizing: boolean;
  hasUnreadSummary: boolean;
  setHasUnreadSummary: (val: boolean) => void;
  setSummaryAndDiveDeeper: (summary: string, diveDeeper: string) => void;
  updateSummary: () => Promise<void>;
  queueSummaryUpdate: () => void;
  clearSummary: () => void;
}

let debounceTimeout: NodeJS.Timeout | null = null;

export const useSummaryStore = create<SummaryState>((set) => ({
  conversationSummary: '',
  diveDeeper: '',
  isSummarizing: false,
  hasUnreadSummary: false,

  setHasUnreadSummary: (val) => set({ hasUnreadSummary: val }),

  setSummaryAndDiveDeeper: (summary, diveDeeper) =>
    set({
      conversationSummary: summary,
      diveDeeper: diveDeeper,
      hasUnreadSummary: summary ? true : false,
    }),

  updateSummary: async () => {
    const transcriptions = useTranscriptionStore.getState().transcriptions;
    if (transcriptions.length === 0) return;

    set({ isSummarizing: true });
    try {
      const history = transcriptions.map((t) => ({
        text: t.text,
        timestamp: t.timestamp,
      }));

      const selectedKeywords = Array.from(
        new Set(transcriptions.flatMap((t) => t.selectedKeywords || []))
      );

      const result = await generateConversationSummary(history, selectedKeywords);
      set({
        conversationSummary: result.summary,
        diveDeeper: result.diveDeeper,
        hasUnreadSummary: result.summary ? true : false,
      });
    } catch (err) {
      console.error('Error generating conversation summary:', err);
    } finally {
      set({ isSummarizing: false });
    }
  },

  queueSummaryUpdate: () => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(() => {
      useSummaryStore.getState().updateSummary();
    }, 4000);
  },

  clearSummary: () =>
    set({
      conversationSummary: '',
      diveDeeper: '',
      isSummarizing: false,
      hasUnreadSummary: false,
    }),
}));
