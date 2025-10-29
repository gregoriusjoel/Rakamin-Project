import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDl84amycRU5v9YAFjBLaL3RDnosclqTSw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "hiring-management-930b3.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "hiring-management-930b3",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "hiring-management-930b3.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "3101425743",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:3101425743:web:2c3fb62417e5f8dfeeea3a",
};

const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "AIzaSyDl84amycRU5v9YAFjBLaL3RDnosclqTSw";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const isConfigured = isFirebaseConfigured;

export default app;