import express, { CookieOptions, Request, Response } from "express";
import db from "../db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { protect } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimiter";
import vaultClient from "../config/vault";

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns a message indicating that the system is working
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Test endpoint is working
 */

//healthcheck endpoint
router.get("/", (req: Request, res: Response) => {
    res.status(200).json({message: "Test endpoint is working"});
});

const cookieOptions: CookieOptions = {
    httpOnly: true, // cookies cannot be accessed by js on the client
    secure: true, // siempre usar HTTPS (Nginx maneja la terminación TLS)
    sameSite: 'strict', // previene ataques CSRF
    maxAge: 30 * 24 * 60 * 60 * 1000, // expira en 30 días
    path: '/',
};

const generateToken = (id: number): string => {
    const jwtSecret = vaultClient.getJwtSecret();
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: '30d',
    });
};

/**
 * Valida y sanitiza el nombre de usuario
 */
function validateUsername(name: string): string | null {
    const trimmed = name.trim();
    // Validar longitud (3-20 caracteres)
    if (trimmed.length < 3 || trimmed.length > 20) {
        return null;
    }
    // Solo permitir caracteres alfanuméricos, guiones y guiones bajos
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
        return null;
    }
    return trimmed;
}

/**
 * Valida la contraseña
 */
function validatePassword(password: string): boolean {
    // Mínimo 8 caracteres, al menos una letra y un número
    if (password.length < 8) {
        return false;
    }
    // Validación básica de complejidad
    return /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

//login checkpoint
/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login
 *     description: Authenticates a user and sets a JWT in an HTTP-only cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: nemo
 *               password:
 *                 type: string
 *                 example: my_password
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only cookie containing the JWT
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: nemo
 *       400:
 *         description: Invalid input or invalid credentials
 */
router.post('/login', authRateLimiter, async (req: Request, res: Response) => {
    try {
        const { name, password } = req.body;

        // Validación de tipos
        if (typeof name !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }

        // Validar y sanitizar nombre de usuario
        const normalizedName = validateUsername(name);
        if (!normalizedName) {
            return res.status(400).json({ message: "Invalid username format" });
        }

        // Validar contraseña
        if (!password || password.length === 0) {
            return res.status(400).json({ message: "Password is required" });
        }

        // Buscar usuario usando prepared statement (ya está usando $1, correcto)
        const user = await db.query('SELECT id, name, password FROM users WHERE name = $1', [normalizedName]);
        
        if (user.rows.length === 0) {
            // Usar el mismo mensaje genérico para no revelar si el usuario existe
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const userData = user.rows[0];

        // Verificar contraseña usando bcrypt con comparación segura (constant-time)
        const isMatch = await bcrypt.compare(password, userData.password);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generar token JWT
        const token = generateToken(userData.id);

        // Establecer cookie segura
        res.cookie('token', token, cookieOptions);

        res.status(200).json({ 
            user: { 
                id: userData.id, 
                name: userData.name 
            } 
        });
    } catch (error) {
        console.error('Error en login:', process.env.NODE_ENV === 'development' ? error : 'Login error');
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});


//get data of logged in user
/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Returns the currently logged-in user based on the JWT cookie.
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: nemo
 *       401:
 *         description: Not authorized
 */
router.get('/me', protect, async (req: any, res: Response) => {
    
    console.log(req.user);
    res.json(req.user);

})

//logout endpoint
/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout
 *     description: Clears the authentication cookie.
 *     responses:
 *       200:
 *         description: Logged out
 *         headers:
 *           Set-Cookie:
 *             description: Clears the auth cookie
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 */
router.post('/logout', (req: Request, res: Response) => {
    res.cookie('token', '', {...cookieOptions, maxAge: 1});
    res.json({ message: 'Logged out successfully' });
});

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with hashed password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: newuser
 *               password:
 *                 type: string
 *                 example: SecurePass123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: newuser
 *       400:
 *         description: Invalid input or user already exists
 */
router.post('/register', authRateLimiter, async (req: Request, res: Response) => {
    try {
        const { name, password } = req.body;

        // Validación de tipos
        if (typeof name !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }

        // Validar y sanitizar nombre de usuario
        const normalizedName = validateUsername(name);
        if (!normalizedName) {
            return res.status(400).json({ 
                message: "Invalid username format. Username must be 3-20 characters and contain only letters, numbers, hyphens, and underscores." 
            });
        }

        // Validar contraseña
        if (!validatePassword(password)) {
            return res.status(400).json({ 
                message: "Invalid password. Password must be at least 8 characters long and contain at least one letter and one number." 
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await db.query('SELECT id FROM users WHERE name = $1', [normalizedName]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash de contraseña con bcrypt (cost factor 12)
        const hashedPassword = await bcrypt.hash(password, 12);

        // Crear usuario usando prepared statement
        const result = await db.query(
            'INSERT INTO users (name, password) VALUES ($1, $2) RETURNING id, name',
            [normalizedName, hashedPassword]
        );

        const newUser = result.rows[0];

        // Generar token JWT
        const token = generateToken(newUser.id);

        // Establecer cookie segura
        res.cookie('token', token, cookieOptions);

        res.status(201).json({
            user: {
                id: newUser.id,
                name: newUser.name,
            },
        });
    } catch (error) {
        console.error('Error en registro:', process.env.NODE_ENV === 'development' ? error : 'Registration error');
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

export default router;