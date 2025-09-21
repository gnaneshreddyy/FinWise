// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Make sure to import GoogleAuthProvider

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7EZjf_DyrSq9nIWvaVnB41zlkjdCFkO0",
  authDomain: "finwise-ed870.firebaseapp.com",
  projectId: "finwise-ed870",
  storageBucket: "finwise-ed870.firebasestorage.app",
  messagingSenderId: "63887456427",
  appId: "1:63887456427:web:56d1cca05ec7930243dfee",
  measurementId: "G-72L5RDCDTJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();