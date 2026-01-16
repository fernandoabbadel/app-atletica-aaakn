import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 1. Singleton do App (Evita erro de "App already exists" no Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. Autenticação
const auth = getAuth(app);

// 3. Banco de Dados (Configuração Tática Anti-Bloqueio) 🦈🛡️
// Usamos initializeFirestore em vez de getFirestore para passar configurações personalizadas.
const db = initializeFirestore(app, {
  // Força o uso de Long Polling em vez de WebSockets.
  // Essencial para rodar em Wi-Fi de faculdade/empresas que bloqueiam portas não-padrão.
  experimentalForceLongPolling: true,
  
  // (Opcional) Evita erros chatos se você tentar salvar algo como undefined
  ignoreUndefinedProperties: true, 
});

// 4. Storage (Imagens)
const storage = getStorage(app);

// 5. Provedor Google
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };