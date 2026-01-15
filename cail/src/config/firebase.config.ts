/**
 * Configuración de Firebase para el cliente (React Native / Expo)
 * 
 * IMPORTANTE: Las credenciales se cargan desde variables de entorno
 * NO hardcodear API Keys en el código fuente
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import Constants from 'expo-constants';

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
    apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: Constants.expoConfig?.extra?.firebaseProjectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: Constants.expoConfig?.extra?.firebaseAppId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId || process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validar que las credenciales existan
if (!firebaseConfig.apiKey) {
    console.error('❌ Firebase API Key no configurada. Verifica las variables de entorno.');
}

// Inicializar Firebase solo si no está inicializado
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Obtener instancia de Auth
const auth = getAuth(app);

export { app, auth };
export default app;

