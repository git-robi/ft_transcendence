import express, { CookieOptions, Request, Response } from "express";
import db from "../db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {protect } from "../middleware/auth";

const router = express.Router();


const cookieOptions : CookieOptions = {
    httpOnly: true, //cookies cannot be accessed by js on the client
    secure: process.env.NODE_ENV === 'production', //it only sends cookies over https in production
    sameSite: 'strict', //it will prevent csrf attacks
    maxAge: 30 * 24 * 60 * 60 * 1000 //will expire in 30 days 
}

const generateToken = (id : number) => {
    return jwt.sign({id}, process.env.JWT_SECRET as string, {
        expiresIn: '30d'
    });
} //it signes tokens with userid

//Register endpoint
/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register
 *     description: Creates a new user and sets a JWT in an HTTP-only cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: nemo
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nemo@example.com
 *               password:
 *                 type: string
 *                 minLength: 12
 *                 example: my_password_123
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                     email:
 *                       type: string
 *                       example: nemo@example.com
 *       400:
 *         description: Invalid input or user already exists
 */
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await db.query ('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
    }

    //password requirements
    if (password.length() < 12) {
        return res.status(400).json({ message: 'Password must be at least 12 characters'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.query ('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email', [name, email, hashedPassword]);

    const token = generateToken(newUser.rows[0].id);

    res.cookie('token', token, cookieOptions);

    return res.status(201).json({ user: newUser.rows[0] });

});

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
router.post('/login', async (req: Request, res: Response) => {

    console.log('Login request received:', req.body);

    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
        return res.status(400).json({ message: "Invalid input" });
    }

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }
    //check username 
     const user = await db.query ('SELECT * FROM users WHERE name = $1', [normalizedEmail]);
    if (user.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const userData = user.rows[0];

    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch){
        return res.status(400).json({ message: 'Invalid credentials' });
    } 
    
    const token = generateToken(userData.id);

    res.cookie('token', token, cookieOptions);

    res.status(200).json({ user: { id: userData.id, name: userData.name, email: userData.email }});
})


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
router.post('/logout', (req, res) => {
    res.cookie('token', '', {...cookieOptions, maxAge: 1});
    res.json({ message: 'Logged out successfully' });
})

export default router;