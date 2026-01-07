export const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_GEMINI_API_KEY',
] as const;

function getEnvVar(key: string): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  firebase: {
    apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
    authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
    databaseURL: getEnvVar('VITE_FIREBASE_DATABASE_URL'),
    projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  },
  gemini: {
    apiKey: getEnvVar('VITE_GEMINI_API_KEY'),
    model: 'gemini-2.0-flash-lite',
    apiUrl: 'https://generativelanguage.googleapis.com/v1/models',
  },
} as const;
