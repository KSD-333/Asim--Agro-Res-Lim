import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBclKxruluV_IjeLJ9RDki8p5UOE74Oxv0",
  authDomain: "asim-agro.firebaseapp.com",
  databaseURL: "https://asim-agro-default-rtdb.firebaseio.com",
  projectId: "asim-agro",
  storageBucket: "asim-agro.firebasestorage.app",
  messagingSenderId: "277591272055",
  appId: "1:277591272055:web:282acf79136380c5caf472",
  measurementId: "G-K3P94QM7E2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);