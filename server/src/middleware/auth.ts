import jwt from "jsonwebtoken";
import db from "../db";

import type { NextFunction, Request, Response } from "express";

type AuthedRequest = Request & {
    user?: {
        id: number;
        name: string;
    };
};

const getCookieToken = (req: Request): string | null => {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(";").map((c) => c.trim());
    for (const cookie of cookies) {
        const eqIndex = cookie.indexOf("=");
        if (eqIndex === -1) continue;

        const key = cookie.slice(0, eqIndex);
        const value = cookie.slice(eqIndex + 1);
        if (key === "token") return decodeURIComponent(value);
    }

    return null;
};

const getTokenId = (token: string): number | null => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        if (typeof decoded === "string") return null;

        const id = (decoded as any).id;
        return typeof id === "number" ? id : null;
    } catch {
        return null;
    }
};

export const protect = async (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
        const token = getCookieToken(req);

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const userId = getTokenId(token);
        if (!userId) {
            return res.status(401).json({ message: "Not authorized, token failed" });
        }

        const user = await db.query(
            "SELECT id, name FROM users WHERE id = $1",
            [userId]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }

        req.user = user.rows[0];
        next();
    } catch (err) {
        //console.error(err);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

export default { protect };