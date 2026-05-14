import { initializeApp } from "firebase/app";

//web app's firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAgwUa9GxPgNHKRfnsD_wSknU9X6P-Xycg",
  authDomain: "ai-resume-tailor-1c70c.firebaseapp.com",
  projectId: "ai-resume-tailor-1c70c",
  storageBucket: "ai-resume-tailor-1c70c.firebasestorage.app",
  messagingSenderId: "948574295344",
  appId: "1:948574295344:web:989e0389845bcea66ce4f5"
};

export const app = initializeApp(firebaseConfig);