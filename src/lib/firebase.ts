/**
 * Firebase client SDK initialisation.
 *
 * Used exclusively for real-time Firestore `onSnapshot` listeners so the user
 * app can receive order-status updates the instant admin changes them —
 * without any polling or timer hacks.
 *
 * Auth flow:
 *  1. User logs in via our custom JWT backend.
 *  2. Frontend requests a Firebase custom token from `GET /auth/firebase-token`.
 *  3. `signInWithCustomToken(firebaseAuth, customToken)` signs the user into the
 *     Firebase client SDK — their Firebase UID equals our backend userId.
 *  4. Firestore security rules use `request.auth.uid == resource.data.userId`
 *     so only the order owner can read their own document.
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth }      from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:        import.meta.env.VITE_FIREBASE_API_KEY        as string,
  authDomain:    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN    as string,
  projectId:     import.meta.env.VITE_FIREBASE_PROJECT_ID     as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
};

// Guard against double-initialisation in React StrictMode / HMR
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const firestore    = getFirestore(app);
