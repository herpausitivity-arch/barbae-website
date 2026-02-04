
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAELrhh_stbzTD7B_MVpFy2IjFvmHDXegc",
  authDomain: "barbae-website.firebaseapp.com",
  projectId: "barbae-website",
  storageBucket: "barbae-website.firebasestorage.app",
  messagingSenderId: "720162140913",
  appId: "1:720162140913:web:73c189f3e5534e11b5ef50"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
