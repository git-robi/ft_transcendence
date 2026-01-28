import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import vaultClient from "../config/vault";
import { prisma } from "../prisma/client";

export const protect = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        // Obtener JWT secret desde Vault
        const jwtSecret = vaultClient.getJwtSecret();
        
        // Verificar token
        const decoded = jwt.verify(token, jwtSecret) as { id: number };

        const user = await prisma.users.findFirst({
            where: { id: decoded.id },
            select: { id: true, name: true },
        });

        if (!user) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }

        req.user = user
        next();
    } catch (err) {
        // No exponer detalles del error en producción
        if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Not authorized, invalid token" });
        }
        
        console.error('Error en middleware protect:', process.env.NODE_ENV === 'development' ? err : 'Auth error');
        res.status(401).json({ message: "Not authorized" });
    }
};

