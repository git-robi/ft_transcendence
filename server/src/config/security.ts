import helmet from 'helmet';
import { Express } from 'express';

/**
 * Configuración de seguridad para Express usando Helmet
 * Equivalente a Helmet con configuración personalizada
 */
export function configureSecurityHeaders(app: Express): void {
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "wss:", "https:"],
                    fontSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"],
                },
            },
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true,
            },
            frameguard: {
                action: 'sameorigin',
            },
            noSniff: true,
            xssFilter: true,
            referrerPolicy: {
                policy: 'strict-origin-when-cross-origin',
            },
            // Ocultar información del servidor
            hidePoweredBy: true,
        })
    );
}

/**
 * Middleware para manejo seguro de errores
 * Evita exponer stack traces e información sensible
 */
export function errorHandler(err: any, req: any, res: any, next: any): void {
    // Log del error completo en el servidor (no exponer al cliente)
    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
    });

    // Respuesta genérica al cliente
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Error interno del servidor' 
        : err.message;

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}



