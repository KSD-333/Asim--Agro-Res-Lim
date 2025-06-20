import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBclKxruluV_IjeLJ9RDki8p5UOE74Oxv0",
  authDomain: "asim-agro.firebaseapp.com",
  databaseURL: "https://asim-agro-default-rtdb.firebaseio.com",
  projectId: "asim-agro",
  storageBucket: "asim-agro.appspot.com",
  messagingSenderId: "277591272055",
  appId: "1:277591272055:web:282acf79136380c5caf472",
  measurementId: "G-K3P94QM7E2"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with the new recommended approach
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize Auth
const auth = getAuth(app);

// Initialize Storage
const storage = getStorage(app);

// Configure CORS for storage
const corsConfig = {
  origin: ["http://localhost:5174", "http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAgeSeconds: 3600
};

// Apply CORS configuration
if (process.env.NODE_ENV === 'development') {
  // In development, we can use the emulator
  connectStorageEmulator(storage, 'localhost', 9199);
}

export { db, auth, storage };