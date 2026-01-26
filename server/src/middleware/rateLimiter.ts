import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiter para endpoints de autenticación
 * Protege contra ataques de fuerza bruta
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos por IP
    message: {
        error: 'Demasiados intentos de login. Por favor, intenta de nuevo en 15 minutos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Saltar rate limiting si la IP está en whitelist (útil para tests)
    skip: (req: Request) => {
        return process.env.NODE_ENV === 'test';
    },
    // Handler personalizado para logging
    handler: (req: Request, res: Response) => {
        console.warn(`Rate limit excedido para IP: ${req.ip} en ruta: ${req.path}`);
        res.status(429).json({
            error: 'Demasiados intentos de login. Por favor, intenta de nuevo en 15 minutos.',
        });
    },
});

/**
 * Rate limiter general para APIs
 */
export const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    message: {
        error: 'Demasiadas peticiones. Por favor, intenta de nuevo más tarde.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});



