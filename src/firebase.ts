import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_D5hSU2YTOctVoWho64gK-l0MqBgFdtc",
  authDomain: "recordatoriostecnicos.firebaseapp.com",
  projectId: "recordatoriostecnicos",
  storageBucket: "recordatoriostecnicos.firebasestorage.app",
  messagingSenderId: "690946125913",
  appId: "1:690946125913:web:fb7f0d12a4aba192d18148",
  measurementId: "G-M2MSKJ0QWV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
