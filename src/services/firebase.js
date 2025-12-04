// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Web app Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8uv6s0t3yClW0oHJGedUpm-6aj3mWAAw",
  authDomain: "budgetbuddy-b3927.firebaseapp.com",
  projectId: "budgetbuddy-b3927",
  storageBucket: "budgetbuddy-b3927.firebasestorage.app",
  messagingSenderId: "67342257322",
  appId: "1:67342257322:web:5ceb40f1b864da14d954d3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
