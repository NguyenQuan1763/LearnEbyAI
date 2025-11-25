
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFxeAnSQgt9SFnjS7DIfuPXROYxvGz81E",
  authDomain: "learnenglish-c19d1.firebaseapp.com",
  projectId: "learnenglish-c19d1",
  storageBucket: "learnenglish-c19d1.firebasestorage.app",
  messagingSenderId: "383230463534",
  appId: "1:383230463534:web:006f96e48f65c8053119bf",
  measurementId: "G-9FFLYFWDLN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
