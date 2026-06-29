import { create } from 'zustand';
import { searchSources } from '../lib/searchSources';
import { useTranscriptionStore } from './useTranscriptionStore';

interface SourceState {
  isSearching: boolean;
  searchSourcesForSegment: (transcriptionId: string, searchTerms: string[]) => Promise<void>;
}

export const useSourceStore = create<SourceState>((set) => ({
  isSearching: false,

  searchSourcesForSegment: async (transcriptionId, searchTerms) => {
    if (searchTerms.length === 0) return;

    set({ isSearching: true });
    try {
      const sources = await searchSources(searchTerms);
      useTranscriptionStore.getState().updateTranscription(transcriptionId, {
        sources
      });
    } catch (err) {
      console.error('Error searching sources:', err);
    } finally {
      set({ isSearching: false });
    }
  }
}));
