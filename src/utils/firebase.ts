import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import { getStorage } from 'firebase/storage';

// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBkoCv2x9CWv-KIHcZgkYJZ8EJH4Le5cX4',
  authDomain: 'driving-app-18bec.firebaseapp.com',
  projectId: 'driving-app-18bec',
  storageBucket: 'driving-app-18bec.firebasestorage.app',
  messagingSenderId: '714484819192',
  appId: '1:714484819192:web:dd2cc195be8a7d12f4070d',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);
