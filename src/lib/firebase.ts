import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getFunctions } from 'firebase/functions';
import { config } from './config';

// Initialize Firebase
const app = initializeApp(config.firebase);
const database = getDatabase(app);
export const functions = getFunctions(app);

// Update session data
export const updateSession = async (
  sessionCode: string,
  data: Partial<{
    transcriptions: any[],
    analysis: string,
    urlList: string[],
    currentUrl: string,
    isRecording: boolean,
    keywords: string[],
    summary: string
  }>
): Promise<void> => {
  const sessionRef = ref(database, `sessions/${sessionCode}`);

  // Get current data
  const snapshot = await get(sessionRef);
  if (!snapshot.exists()) {
    throw new Error('Session not found');
  }

  // Update only the provided fields
  const currentData = snapshot.val();
  const updatedData = { ...currentData, ...data };

  await set(sessionRef, updatedData);
};