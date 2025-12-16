"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
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
router.get("/", (req, res) => {
    res.status(200).json({ message: "Test endpoint is working" });
});
const cookieOptions = {
    httpOnly: true, //cookies cannot be accessed by js on the client
    secure: process.env.NODE_ENV === 'production', //it only sends cookies over https in production
    sameSite: 'strict', //it will prevent csrf attacks
    maxAge: 30 * 24 * 60 * 60 * 1000 //will expire in 30 days 
};
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
}; //it signes tokens with userid
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
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const user = yield db_1.default.query('SELECT * FROM users WHERE name = $1', [normalizedName]);
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
    res.status(200).json({ user: { id: userData.id, name: userData.name } });
}));
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
router.get('/me', auth_1.protect, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.user);
    res.json(req.user);
}));
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
    res.cookie('token', '', Object.assign(Object.assign({}, cookieOptions), { maxAge: 1 }));
    res.json({ message: 'Logged out successfully' });
});
exports.default = router;
