import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCclb8Euq3Gwz7NdxVSMB5CuJZUZ6GX4dE",
  authDomain: "webtoolocean-builder.firebaseapp.com",
  projectId: "webtoolocean-builder",
  storageBucket: "webtoolocean-builder.firebasestorage.app",
  messagingSenderId: "1017816701985",
  appId: "1:1017816701985:web:599ce414aa2519ff609760",
  measurementId: "G-1TYF2G2XK6"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;