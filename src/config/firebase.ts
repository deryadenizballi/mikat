import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBaSKN3ryYgO0ek_sTTtHN5VYnz47IoiN0",
    authDomain: "mikat-2d60d.firebaseapp.com",
    projectId: "mikat-2d60d",
    storageBucket: "mikat-2d60d.firebasestorage.app",
    messagingSenderId: "210907525382",
    appId: "1:210907525382:web:1bbf5bb780578feb5d2e87",
    measurementId: "G-XVVY60P5TB"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Firestore instance
export const db = getFirestore(app);

export default app;
