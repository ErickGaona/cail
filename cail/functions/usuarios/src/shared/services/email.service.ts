import { Resend } from 'resend';
import { config } from '../../config/env.config';

/**
 * Servicio de envío de emails usando Resend
 * En desarrollo, si no hay API key, solo loggea los emails
 */
class EmailService {
    private resend: Resend | null = null;
    private isDevelopment: boolean;

    constructor() {
        this.isDevelopment = config.nodeEnv === 'development';

        // Solo inicializar Resend si hay una API key válida
        if (config.email.apiKey && config.email.apiKey.startsWith('re_')) {
            this.resend = new Resend(config.email.apiKey);
        } else {
            console.warn('⚠️ Resend API key not configured. Emails will be logged to console.');
        }
    }

    /**
     * Envía email con contraseña temporal a empleadores
     */
    async sendTemporaryPassword(email: string, password: string, name: string): Promise<void> {
        const emailData = {
            from: 'CAIL <onboarding@resend.dev>',
            to: email,
            subject: 'Tu contraseña temporal de CAIL',
            html: `
                <h1>Hola ${name},</h1>
                <p>Te damos la bienvenida a CAIL. Tu cuenta de empleador ha sido creada satisfatoriamente.</p>
                <p>Tu contraseña temporal es: <strong>${password}</strong></p>
                <p>Por favor, cámbiala después de iniciar sesión por primera vez.</p>
            `,
        };

        if (this.resend) {
            await this.resend.emails.send(emailData);
        } else {
            console.log('📧 [DEV] Email would be sent:', {
                to: email,
                subject: emailData.subject,
                password: password // Solo en dev para debugging
            });
        }
    }

    /**
     * Envía email de bienvenida a nuevos usuarios
     */
    async sendWelcomeEmail(email: string, name: string): Promise<void> {
        const emailData = {
            from: 'CAIL <onboarding@resend.dev>',
            to: email,
            subject: 'Bienvenido a CAIL',
            html: `
                <h1>¡Bienvenido ${name}!</h1>
                <p>Tu cuenta en CAIL ha sido creada exitosamente.</p>
                <p>Ya puedes comenzar a explorar oportunidades laborales.</p>
            `,
        };

        if (this.resend) {
            await this.resend.emails.send(emailData);
        } else {
            console.log('📧 [DEV] Welcome email would be sent:', {
                to: email,
                subject: emailData.subject
            });
        }
    }
}

export const emailService = new EmailService();
