import { create } from 'zustand';
import { updateSession, verifySession } from '../lib/firebase';
import { useTranscriptionStore, SearchResult } from './useTranscriptionStore';
import { useKeywordStore } from './useKeywordStore';
import { useSummaryStore } from './useSummaryStore';
import { toast } from 'react-hot-toast';

interface SessionState {
  isInSession: boolean;
  sessionCode: string;
  sessionCodeInput: string;
  showSessionInput: boolean;
  isSessionConnecting: boolean;
  setSessionCodeInput: (code: string) => void;
  setShowSessionInput: (show: boolean) => void;
  connectSession: (code: string) => Promise<void>;
  disconnectSession: () => void;
  syncSessionState: (analysis: string, newSources: SearchResult[]) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  isInSession: false,
  sessionCode: '',
  sessionCodeInput: '',
  showSessionInput: false,
  isSessionConnecting: false,

  setSessionCodeInput: (code) => set({ sessionCodeInput: code }),
  setShowSessionInput: (show) => set({ showSessionInput: show }),

  connectSession: async (code) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    set({ isSessionConnecting: true });
    try {
      const exists = await verifySession(trimmed);
      if (exists) {
        set({
          sessionCode: trimmed,
          isInSession: true,
          showSessionInput: false,
        });
        toast.success(`Connected to session: ${trimmed}`);
      } else {
        toast.error('Session not found. Please verify the code.');
      }
    } catch (err) {
      console.error('Session connection error:', err);
      toast.error('Failed to connect to session.');
    } finally {
      set({ isSessionConnecting: false });
    }
  },

  disconnectSession: () => {
    set({
      isInSession: false,
      sessionCode: '',
      sessionCodeInput: '',
    });
    toast.success('Disconnected from session');
  },

  syncSessionState: async (analysis, newSources) => {
    const { isInSession, sessionCode } = get();
    if (!isInSession || !sessionCode) return;

    const transcriptions = useTranscriptionStore.getState().transcriptions;
    const keywords = useKeywordStore.getState().allKeywords;
    const summary = useSummaryStore.getState().conversationSummary;

    try {
      await updateSession(sessionCode, {
        transcriptions,
        analysis,
        urlList: newSources.map((s) => s.link),
        keywords,
        summary,
      });
    } catch (err) {
      console.error('Failed to sync session state to Firebase:', err);
    }
  },
}));
