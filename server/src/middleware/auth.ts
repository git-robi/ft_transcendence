import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";

export const protect = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        const user = await prisma.user.findFirst({
            where: { id: (decoded as any).id },
            select: {
                id: true,
                email: true,
                googleId: true,
                githubId: true,
                createdAt: true,
                apiKeys: true,
                profile: { select: { name: true, bio: true, avatarUrl: true } },
            }
        });

        if (!user) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }

        req.user = user
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

