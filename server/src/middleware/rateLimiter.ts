import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiter for auth endpoints.
 * Helps protect against brute-force attacks.
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // max 20 attempts per IP
    message: {
        error: 'Too many login attempts. Please try again in 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting in tests
    skip: (req: Request) => {
        return process.env.NODE_ENV === 'test';
    },
    // Custom handler for logging
    handler: (req: Request, res: Response) => {
        console.warn(`Rate limit exceeded for IP: ${req.ip} on path: ${req.path}`);
        res.status(429).json({
            error: 'Too many login attempts. Please try again in 15 minutes.',
        });
    },
});

/**
 * General rate limiter for APIs.
 */
export const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // max 500 requests per IP
    message: {
        error: 'Too many requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for Swagger docs.
 */
export const docsRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // max 30 requests per IP
    message: {
        error: 'Too many requests to API docs. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});


