// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHz1j4frT5sdp3Uuh_CZ251az-cloe2vc",
  authDomain: "truerumourss.firebaseapp.com",
  projectId: "truerumourss",
  storageBucket: "truerumourss.appspot.com",
  messagingSenderId: "810705148177",
  appId: "1:810705148177:web:dbee4ee1009956343e54b0",
  measurementId: "G-ZLFTW4H2KV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);

export default db;
