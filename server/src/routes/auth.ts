import express, { CookieOptions, Request, Response } from "express";
import { prisma } from "../prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { protect } from "../middleware/auth";
import { protectApiKey } from "../middleware/api-keys";
import { authRateLimiter } from "../middleware/rateLimiter";
import vaultClient from "../config/vault";
import passport from 'passport';

const router = express.Router();

const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
};

const generateToken = (id: number): string => {
    const jwtSecret = vaultClient.getJwtSecret();
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: '30d',
    });
};

function validateEmail(email: string): string | null {
    const trimmed = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) return null;
    return trimmed;
}

function validatePassword(password: string): boolean {
    if (password.length < 12) {
        return false;
    }
    return /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

router.get("/health", protectApiKey, (req, res) => {
    res.json({ message: "API key is valid", user: req.user });
});

router.post("/register", authRateLimiter, async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body as {
            name?: unknown;
            email?: unknown;
            password?: unknown;
        };

        if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }

        const trimmedName = name.trim();
        const normalizedEmail = validateEmail(email);
        if (!trimmedName || !normalizedEmail) {
            return res.status(400).json({ message: "Invalid name or email" });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                message: "Invalid password. Password must be at least 12 characters long and contain at least one letter and one number.",
            });
        }

        const existingUser = await prisma.user.findFirst({
            where: { email: normalizedEmail },
            select: { id: true },
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                email: normalizedEmail,
                password: hashedPassword,
                profile: {
                    create: {
                        name: trimmedName,
                        bio: "",
                    },
                },
            },
            select: {
                id: true,
                email: true,
                profile: { select: { name: true } },
            },
        });

        const token = generateToken(newUser.id);
        res.cookie("token", token, cookieOptions);

        return res.status(201).json({
            user: {
                id: newUser.id,
                name: newUser.profile?.name ?? trimmedName,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error("Error in register:", process.env.NODE_ENV === "development" ? error : "Registration error");
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/login', authRateLimiter, async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body as { email?: unknown; password?: unknown };

        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Invalid input" });
        }

        const normalizedEmail = validateEmail(email);
        if (!normalizedEmail || !password) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const user = await prisma.user.findFirst({
            where: { email: normalizedEmail },
            select: {
                id: true,
                email: true,
                password: true,
                profile: { select: { name: true } },
            },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user.id);
        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            user: {
                id: user.id,
                name: user.profile?.name ?? null,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Error in login:", process.env.NODE_ENV === "development" ? error : "Login error");
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/me', protect, async (req: any, res: Response) => {
    res.json(req.user);
});

router.post('/logout', (req: Request, res: Response) => {
    res.cookie('token', '', { ...cookieOptions, maxAge: 1 });
    res.json({ message: 'Logged out successfully' });
});

router.get('/google', passport.authenticate("google", {
    scope: ['profile', 'email']
}));

router.get('/google/redirect', passport.authenticate('google', { session: false }), (req, res) => {
    const user = req.user as { id: number };
    const token = generateToken(user.id);
    res.cookie('token', token, cookieOptions);
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
});

router.get('/github', passport.authenticate("github", {
    scope: ['profile', 'email']
}));

router.get('/github/redirect', passport.authenticate('github', { session: false }), (req, res) => {
    const user = req.user as { id: number };
    const token = generateToken(user.id);
    res.cookie('token', token, cookieOptions);
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
});

export default router;
