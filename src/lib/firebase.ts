import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, off, get } from 'firebase/database';
import { getFunctions } from 'firebase/functions';
import { config } from './config';

// Initialize Firebase
const app = initializeApp(config.firebase);
const database = getDatabase(app);
export const functions = getFunctions(app);

// Generate a random 4-digit session code
export const generateSessionCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Create a new session
export const createSession = async (sessionCode: string, sessionName: string): Promise<void> => {
  const sessionRef = ref(database, `sessions/${sessionCode}`);

  // Check if session already exists
  const snapshot = await get(sessionRef);
  if (snapshot.exists()) {
    throw new Error('Session code already exists. Please try again.');
  }

  // Create new session
  await set(sessionRef, {
    name: sessionName,
    createdAt: new Date().toISOString(),
    transcriptions: [],
    analysis: '',
    urlList: [],
    currentUrl: '',
    isRecording: false,
    keywords: [],
    summary: ''
  });

  return;
};

// Join an existing session
export const joinSession = async (sessionCode: string): Promise<string> => {
  const sessionRef = ref(database, `sessions/${sessionCode}`);

  // Check if session exists
  const snapshot = await get(sessionRef);
  if (!snapshot.exists()) {
    throw new Error('Session not found. Please check the code and try again.');
  }

  return snapshot.val().name;
};

// Listen for session updates
export const subscribeToSession = (
  sessionCode: string,
  callback: (data: any) => void
): (() => void) => {
  const sessionRef = ref(database, `sessions/${sessionCode}`);

  onValue(sessionRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });

  // Return unsubscribe function
  return () => off(sessionRef);
};

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