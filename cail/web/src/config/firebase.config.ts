/**
 * Configuración de Firebase para el cliente Web (Vite + React)
 * 
 * IMPORTANTE: Las credenciales se cargan desde variables de entorno
 * NO hardcodear API Keys en el código fuente
 * 
 * Crear archivo .env.local con:
 * VITE_FIREBASE_API_KEY=tu-api-key
 * VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
 * etc...
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Configuración de Firebase usando variables de entorno de Vite
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validar que las credenciales existan
if (!firebaseConfig.apiKey) {
    console.error('❌ Firebase API Key no configurada. Crea un archivo .env.local con las variables VITE_FIREBASE_*');
}

// Inicializar Firebase solo si no está inicializado
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Obtener instancia de Auth
const auth = getAuth(app);

export { app, auth };
export default app;

