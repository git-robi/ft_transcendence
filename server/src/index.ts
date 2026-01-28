import express, { Request, Response } from "express";
import dotenv from "dotenv";
import "./passport-config";

import auth from "./routes/auth";
import cors from "cors";
import vaultClient from "./config/vault";
import { configureSecurityHeaders, errorHandler } from "./config/security";

// swagger
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerOptions from "./swaggerOptions";

import cookieParser from "cookie-parser";

// Cargar variables de entorno (fallback para desarrollo)
dotenv.config();

const app = express();

// Inicializar Vault antes de configurar la aplicación
async function initializeApp() {
    try {
        await vaultClient.initialize();
        console.log("Vault inicializado correctamente");
        
        // Actualizar DATABASE_URL para Prisma si está disponible
        if (process.env.NODE_ENV !== 'production' || vaultClient.getDatabaseUrl()) {
            process.env.DATABASE_URL = vaultClient.getDatabaseUrl();
        }
    } catch (error) {
        console.error("Error al inicializar Vault:", error);
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }

    // Configurar headers de seguridad
    configureSecurityHeaders(app);

    app.use(cookieParser());

    // CORS configurado para producción
    app.use(cors({
        origin: process.env.CLIENT_URL || "https://localhost",
        credentials: true,
        optionsSuccessStatus: 200,
    }));

    // Limitar tamaño del body
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    const specs = swaggerJsdoc(swaggerOptions);

    // Swagger solo en desarrollo
    if (process.env.NODE_ENV !== 'production') {
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
    }

    app.use("/api/v1/auth", auth);

    // Health check endpoint
    app.get("/health", (req: Request, res: Response) => {
        res.status(200).json({ status: "ok" });
    });

    // Manejo de errores (debe ser el último middleware)
    app.use(errorHandler);

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server is up listening to port ${PORT}`);
    });
}

// Inicializar aplicación
initializeApp().catch((error) => {
    console.error("Error fatal al inicializar la aplicación:", error);
    process.exit(1);
});

export { app };