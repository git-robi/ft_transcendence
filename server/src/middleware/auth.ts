import jwt from "jsonwebtoken";
import db from "../db";
import { Request, Response, NextFunction } from "express";

export const protect = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        const user = await db.query(
            "SELECT id, name FROM users WHERE id = $1",
            [(decoded as any).id]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }

        req.user = user.rows[0];
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

