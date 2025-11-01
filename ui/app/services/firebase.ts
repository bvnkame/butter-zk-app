

// FIX: Corrected firebase imports to use scoped packages (@firebase/app, @firebase/auth) to resolve module export errors.
import { initializeApp } from '@firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  OAuthProvider
} from '@firebase/auth';

// IMPORTANT: Replace with your own Firebase configuration
// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');
const appleProvider = new OAuthProvider('apple.com');


export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    // Get user info
    const user = auth.currentUser;
    console.log("User signed in:", user);
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
};

export const signInWithMicrosoft = async () => {
  try {
    await signInWithPopup(auth, microsoftProvider);
  } catch (error) {
    console.error("Error signing in with Microsoft", error);
  }
};

export const signInWithApple = async () => {
  try {
    await signInWithPopup(auth, appleProvider);
  } catch (error) {
    console.error("Error signing in with Apple", error);
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};