import express, { CookieOptions, Request, Response } from "express";
import db from "../db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {protect } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /api/v1/test:
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

//login checkpoint
router.post('/login', async (req: Request, res: Response) => {

    console.log('Login request received:', req.body);

    const { name, password } = req.body;

    if (typeof name !== "string" || typeof password !== "string") {
        return res.status(400).json({ message: "Invalid input" });
    }

    const normalizedName = name.trim();

    if (!normalizedName || !password) {
        return res.status(400).json({ message: "Please provide all required fields" });
    }
    //check username 
     const user = await db.query ('SELECT * FROM users WHERE name = $1', [normalizedName]);
    if (user.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const userData = user.rows[0];

    //const isMatch = await bcrypt.compare(password, userData.password);

    //if (!isMatch){
      //  return res.status(400).json({ message: 'Invalid credentials' });
    //} 
    
    const token = generateToken(userData.id);

    res.cookie('token', token, cookieOptions);

    res.status(200).json({ user: { id: userData.id, name: userData.name }});
})


//get data of logged in user

router.get('/me', protect, async (req: any, res: Response) => {
    
    console.log(req.user);
    res.json(req.user);

})

//logout endpoint
router.post('/logout', (req, res) => {
    res.cookie('token', '', {...cookieOptions, maxAge: 1});
    res.json({ message: 'Logged out successfully' });
})

export default router;