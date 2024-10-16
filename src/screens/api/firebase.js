// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore'
import {getStorage} from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYyXmEi-u1W7_pk6V-O8Bax98Y-fSh8ng",
  authDomain: "app-c3108.firebaseapp.com",
  projectId: "app-c3108",
  storageBucket: "app-c3108.appspot.com",
  messagingSenderId: "173415285072",
  appId: "1:173415285072:web:cb8596cc1ed063859e6c55"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);