import { Request, Response, NextFunction } from "express";
import {createHash} from "node:crypto"
import {prisma} from "../prisma/client";

export const protectApiKey = async (req: any, res: Response, next: NextFunction) => {

    try {

        const authHeader = req.headers.authorization;
        if (!authHeader){
            return res.status(401).json({message : "Not Authorized: missing API key header "});
        }

        const [scheme, credentials] = authHeader.split(" ");
        if (scheme !== "Bearer" || !credentials) {
            return res.status(401).json({ message: "Not Authorized: invalid Authorization header format" });
        }

        const apiKey = credentials.trim();

        if (!apiKey) {
            return res.status(401).json({message : "Not Authorized: missing API key"});
        }

        //check if hashed key is in database
        const hashedKey = createHash("sha256").update(apiKey).digest("hex");

        const keyRecord = await prisma.apiKeys.findFirst({
            where: {
                hashedKey : hashedKey
            },
            include: {
                user: true  // This fetches the user who owns the key
        }})
        
        if(!keyRecord){
            return res.status(401).json({message : "Not Authorized: API key does not match"});
        }

        
        if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
            return res.status(401).json({ message: "Not Authorized: API key expired" });
        }

        // If a JWT-authenticated user is already present, require key ownership match.
        if (req.user?.id && req.user.id !== keyRecord.userId) {
            return res.status(403).json({ message: "Forbidden: API key does not belong to authenticated user" });
        }

        req.apiKey = keyRecord;
        if (!req.user) {
            req.user = keyRecord.user;
        }

        next();

        
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
}
