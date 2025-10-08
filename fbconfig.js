// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import Constants from 'expo-constants';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCNg9o8YZy1lHPb5DfXgrgBl4VTOA0O8uo",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "huggle-goofy-aah.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "huggle-goofy-aah",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "huggle-goofy-aah.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "502979598357",
  appId: process.env.FIREBASE_APP_ID || "1:502979598357:web:569f85f29b0c2850be161c",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-5V30G07X2Y",
};

// Initialize Firebase
export const firebase = initializeApp(firebaseConfig);

// Initialize Firebase Storage
export const storage = getStorage(firebase);
