import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Solo si usas Analytics en el front

const firebaseConfig = {
  apiKey: "AIzaSyAR7cX6ON1ClGX4CFbjaEZ_BgraxKFHiCw",
  authDomain: "flowjuyu-70653.firebaseapp.com",
  projectId: "flowjuyu-70653",
  storageBucket: "flowjuyu-70653.appspot.com", // <--- corregido
  messagingSenderId: "44403093681",
  appId: "1:44403093681:web:5f55af8a0ccdbb2249b290",
  measurementId: "G-KRD1MR6M3B"
};

// Previene reinicialización en hot-reload/desarrollo
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Exporta solo Auth
export const auth = getAuth(app);
// export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null; // Solo si usas Analytics
