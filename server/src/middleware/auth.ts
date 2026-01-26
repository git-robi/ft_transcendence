import jwt from "jsonwebtoken";
import db from "../db";
import { Request, Response, NextFunction } from "express";
import vaultClient from "../config/vault";

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

        // Buscar usuario usando prepared statement
        const user = await db.query(
            "SELECT id, name FROM users WHERE id = $1",
            [decoded.id]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }

        req.user = user.rows[0];
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

