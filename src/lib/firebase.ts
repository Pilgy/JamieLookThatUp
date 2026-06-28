import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { config } from './config';

// Initialize Firebase
const app = initializeApp(config.firebase);
const database = getDatabase(app);
export const functions = getFunctions(app);

// Connect to local Functions Emulator in development
if (import.meta.env.DEV) {
  console.log('[FIREBASE] Connecting to local Functions Emulator on port 5001...');
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}

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

// Verify if a session exists in the database
export const verifySession = async (sessionCode: string): Promise<boolean> => {
  const sessionRef = ref(database, `sessions/${sessionCode}`);
  const snapshot = await get(sessionRef);
  return snapshot.exists();
};