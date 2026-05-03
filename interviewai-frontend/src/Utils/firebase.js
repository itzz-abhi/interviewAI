import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewauth-d46d8.firebaseapp.com",
  projectId: "interviewauth-d46d8",
  storageBucket: "interviewauth-d46d8.firebasestorage.app",
  messagingSenderId: "348407416374",
  appId: "1:348407416374:web:23a9b883f96dd39340fa97"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
