import { initializeApp } from "firebase/app";

import {
  getAuth
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDkd51m4q2kNQP1h4zf2mgBFJiBo-iICVs",
  authDomain: "floramatch-497314.firebaseapp.com",
  projectId: "floramatch-497314",
  storageBucket: "floramatch-497314.firebasestorage.app",
  messagingSenderId: "373656212335",
  appId: "1:373656212335:web:433ec7f500d1f3ffe48e9a",
  measurementId: "G-FRLZFYY95Y"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);