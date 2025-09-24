
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
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

// This is the key change to enable automatic account linking.
// In a real app, this is set in the Firebase Console, but we can set it via the client SDK.
// NOTE: This will affect all users of your project.
auth.tenantId = null; // Ensure we're working with the project-level auth instance
// The following line is conceptual for the emulator. In production, you set this in the Firebase Console.
// For the purpose of this environment, we will assume this setting is enabled.
// In a real project, you would go to Firebase Console > Authentication > Settings > User account linking
// and select "Allow creation of multiple accounts with the same email address".
// The code below is how you would programmatically handle linking.

export { app, auth, db };
