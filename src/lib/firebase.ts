
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-3506933831-b6a66",
  "appId": "1:1002380268474:web:41bd0c9054cdff64e2c383",
  "apiKey": "AIzaSyBlA5MnB1blVRWNg54WDfd8f1eil5-PS3Q",
  "authDomain": "studio-3506933831-b6a66.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1002380268474"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
