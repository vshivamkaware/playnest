import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "dummy_api_key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// @ts-ignore
import * as FirebaseAuth from 'firebase/auth';

const auth = FirebaseAuth.initializeAuth ? FirebaseAuth.initializeAuth(app, {
  persistence: (FirebaseAuth as any).getReactNativePersistence(AsyncStorage)
}) : getAuth(app);

// Use initializeFirestore with experimentalForceLongPolling to fix React Native WebChannel transport errors
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
const storage = getStorage(app);

export { app, auth, db, storage };

