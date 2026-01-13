/**
 * Security Middleware - Helmet + Rate Limiting
 * 
 * @description Middleware de seguridad agregado por Erick Gaona (Test & Security)
 * @date 2026-01-13
 * @version 1.0.0
 * 
 * Implementa:
 * - helmet: Security headers (HSTS, CSP, X-Frame-Options, etc.)
 * - rate-limit: Protección contra fuerza bruta y DDoS
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Application } from 'express';

/**
 * Configuración de Rate Limiting
 */
export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP cada 15 minutos
    message: {
        status: 'error',
        message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Aplica todos los middlewares de seguridad a la aplicación Express
 * 
 * @param app - Instancia de Express
 */
export const applySecurityMiddleware = (app: Application): void => {
    // Helmet - Security Headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'", "https://firestore.googleapis.com", "https://*.firebaseio.com"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: false,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    }));

    // Rate Limiting general
    app.use(rateLimiter);

    console.log('🛡️  Security middleware aplicado (helmet + rate-limit)');
};

export default { applySecurityMiddleware, rateLimiter };

