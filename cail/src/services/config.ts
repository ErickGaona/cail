export const API_CONFIG = {
    // IMPORTANTE: 
    // - Para emulador Android usa 'http://10.0.2.2:8080'
    // - Para dispositivo físico usa tu IP local (ej: 'http://192.168.1.XX:8080')
    // - Para iOS Simulator/Web usa 'http://localhost:8080'
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080',
    TIMEOUT: 15000,
    ENDPOINTS: {
        LOGIN: '/api/v1/auth/login',
        REGISTER: '/api/v1/auth/register',
    },
};
