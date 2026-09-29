// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCeUcMBhbjAoEoAy4wENMhBLgFFrcNJATw",
  authDomain: "lab8-614c7.firebaseapp.com",
  projectId: "lab8-614c7",
  storageBucket: "lab8-614c7.firebasestorage.app",
  messagingSenderId: "784899455843",
  appId: "1:784899455843:web:cf8a22381541f731183156",
  measurementId: "G-N553HHL9J5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db} 