import { create } from 'zustand';
import { useTranscriptionStore } from './useTranscriptionStore';

interface KeywordState {
  allKeywords: string[];
  addKeywords: (keywords: string[]) => void;
  toggleKeyword: (transcriptionId: string, keyword: string) => void;
  clearKeywords: () => void;
}

export const useKeywordStore = create<KeywordState>((set) => ({
  allKeywords: [],

  addKeywords: (keywords) =>
    set((state) => ({
      allKeywords: [...new Set([...state.allKeywords, ...keywords])].sort(),
    })),

  toggleKeyword: (transcriptionId, keyword) => {
    const transcriptionStore = useTranscriptionStore.getState();
    const transcription = transcriptionStore.transcriptions.find(
      (t) => t.id === transcriptionId
    );

    if (!transcription) return;

    const isSelected = transcription.selectedKeywords?.includes(keyword);
    const updatedKeywords = isSelected
      ? transcription.selectedKeywords?.filter((k) => k !== keyword) || []
      : [...(transcription.selectedKeywords || []), keyword];

    transcriptionStore.updateTranscription(transcriptionId, {
      selectedKeywords: updatedKeywords,
    });
  },

  clearKeywords: () => set({ allKeywords: [] }),
}));
