import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Official Firebase configuration for E-Cell (e-cell-4c7ec)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDmDhHx4glM83yT65se1X01UWM1Us8-CG8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "e-cell-4c7ec.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://e-cell-4c7ec-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "e-cell-4c7ec",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "e-cell-4c7ec.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "69024680981",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:69024680981:web:172748eedefb82ee3d521c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-0W133SY53P"
};

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
