// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNg9o8YZy1lHPb5DfXgrgBl4VTOA0O8uo",
  authDomain: "huggle-goofy-aah.firebaseapp.com",
  projectId: "huggle-goofy-aah",
  storageBucket: "huggle-goofy-aah.firebasestorage.app",
  messagingSenderId: "502979598357",
  appId: "1:502979598357:web:569f85f29b0c2850be161c",
  measurementId: "G-5V30G07X2Y",
};

// Initialize Firebase
export const firebase = initializeApp(firebaseConfig);
