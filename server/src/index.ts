import express, { Request, Response } from "express";
import dotenv from "dotenv";
import "./passport-config";

import auth from "./routes/auth";
import profile from "./routes/profile";
import apiKeys from "./routes/api-keys";
import cors from "cors";
import vaultClient from "./config/vault";
import { configureSecurityHeaders, errorHandler } from "./config/security";
import { apiRateLimiter } from "./middleware/rateLimiter";

// swagger
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerOptions from "./swaggerOptions";

import cookieParser from "cookie-parser";

// Load environment variables (development fallback)
dotenv.config();

const app = express();

// Initialize Vault before configuring the app
async function initializeApp() {
    try {
        await vaultClient.initialize();
        console.log("Vault initialized successfully");

        // Update Prisma DATABASE_URL when available
        if (process.env.NODE_ENV !== 'production' || vaultClient.getDatabaseUrl()) {
            process.env.DATABASE_URL = vaultClient.getDatabaseUrl();
        }
    } catch (error) {
        console.error("Error initializing Vault:", error);
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }

    // Configure security headers
    configureSecurityHeaders(app);

    // Trust first proxy (Nginx) for correct client IP in rate limiting
    app.set('trust proxy', 1);

    app.use(cookieParser());

    // Production-ready CORS
    app.use(cors({
        origin: process.env.CLIENT_URL || "https://localhost",
        credentials: true,
        optionsSuccessStatus: 200,
    }));

    // Limit request body size
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    const specs = swaggerJsdoc(swaggerOptions);

    // Swagger only in non-production
    if (process.env.NODE_ENV !== 'production') {
        app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
    }

    // Static assets
    app.use("/avatars", express.static("uploads/avatars"));

    // General API rate limiting (auth has its own stricter limiter)
    app.use("/api/v1", apiRateLimiter);
    app.use("/api/v1/auth", auth);
    app.use("/api/v1/profile", profile);
    app.use("/api/v1/api-keys", apiKeys);

    // Health check endpoint
    app.get("/health", (req: Request, res: Response) => {
        res.status(200).json({ status: "ok" });
    });

    // Error handling (must be the last middleware)
    app.use(errorHandler);

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server is up listening to port ${PORT}`);
    });
}

// Initialize the application
initializeApp().catch((error) => {
    console.error("Fatal error initializing the application:", error);
    process.exit(1);
});

export { app };
