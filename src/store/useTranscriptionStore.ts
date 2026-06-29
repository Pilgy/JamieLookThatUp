import { create } from 'zustand';

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

export interface Transcription {
  id: string;
  text: string;
  timestamp: string;
  isAnalyzed: boolean;
  keywords?: string[];
  selectedKeywords?: string[];
  analysis?: string;
  sources?: SearchResult[];
  summary?: string;
}

interface TranscriptionState {
  transcriptions: Transcription[];
  liveTranscription: string;
  selectedTranscriptionId: string | null;
  setLiveTranscription: (text: string) => void;
  addTranscription: (text: string) => string;
  updateTranscription: (id: string, updates: Partial<Transcription>) => void;
  setSelectedTranscriptionId: (id: string | null) => void;
  clearTranscriptions: () => void;
}

export const useTranscriptionStore = create<TranscriptionState>((set) => ({
  transcriptions: [],
  liveTranscription: '',
  selectedTranscriptionId: null,

  setLiveTranscription: (text) => set({ liveTranscription: text }),

  addTranscription: (text) => {
    const id = Date.now().toString();
    const transcription: Transcription = {
      id,
      text,
      timestamp: new Date().toISOString(),
      isAnalyzed: false,
      keywords: [],
      selectedKeywords: [],
      analysis: '',
      sources: [],
      summary: ''
    };
    set((state) => ({
      transcriptions: [transcription, ...state.transcriptions],
      selectedTranscriptionId: state.selectedTranscriptionId || id,
    }));
    return id;
  },

  updateTranscription: (id, updates) =>
    set((state) => ({
      transcriptions: state.transcriptions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  setSelectedTranscriptionId: (id) => set({ selectedTranscriptionId: id }),

  clearTranscriptions: () =>
    set({ transcriptions: [], selectedTranscriptionId: null, liveTranscription: '' }),
}));
