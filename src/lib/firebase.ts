import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Solo si usas Analytics en el front

const firebaseConfig = {
  apiKey: "AIzaSyCiK_MxxRZUP_cZXJkiaMp9QuGL6uE-WEo",
  authDomain: "flowjuyu-70653-9d441.firebaseapp.com",
  projectId: "flowjuyu-70653-9d441",
  storageBucket: "flowjuyu-70653-9d441.firebasestorage.app",
  messagingSenderId: "7034898716",
  appId: "1:7034898716:web:a20b329db3a8410c1592d9",
  measurementId: "G-XLXGS53F2E"
};

// Previene reinicialización en hot-reload/desarrollo
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Exporta solo Auth
export const auth = getAuth(app);
// export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null; // Solo si usas Analytics
