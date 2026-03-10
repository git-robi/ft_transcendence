import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { spawnSync } from "node:child_process";
import vaultClient from "./config/vault";
import { configureSecurityHeaders, errorHandler, notFoundHandler } from "./config/security";
import { apiRateLimiter, docsRateLimiter } from "./middleware/rateLimiter";
import { verifyCsrfToken } from "./middleware/csrf";
import { initSocket } from "./socket/socket";

// swagger (for API documentation)
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerOptions from "./swaggerOptions";

import cookieParser from "cookie-parser";

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

        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            const migrate = spawnSync("npx", ["prisma", "migrate", "deploy"], {
                stdio: "inherit",
                env: process.env as NodeJS.ProcessEnv,
            });
            if (migrate.status !== 0) {
                throw new Error("Prisma migrate deploy failed");
            }
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

    // Swagger docs (public) with protections
    app.use("/api-docs", docsRateLimiter, (req, res, next) => {
        console.info(`API docs access from IP: ${req.ip} UA: ${req.headers['user-agent'] || 'unknown'}`);
        next();
    });
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
        swaggerOptions: {
            supportedSubmitMethods: [], // disable "Try it out" in public docs
        },
    }));

    // Static assets
    app.use("/avatars", express.static("uploads/avatars"));

    // Initialize auth strategies after secrets are ready
    await import("./passport-config");

    const [{ default: auth }, { default: profile }, { default: matches }, { default: apiKeys }, { default: publicAPI }, { default: friends }, { default: chat }] = await Promise.all([
        import("./routes/auth"),
        import("./routes/profile"),
        import("./routes/matches"),
        import("./routes/api-keys"),
        import("./routes/public"),
        import("./routes/friends"),
        import("./routes/chat"),
    ]);

    // General API rate limiting (auth has its own stricter limiter)
    app.use("/api/v1", apiRateLimiter);
    app.use("/api/v1", verifyCsrfToken);
    app.use("/api/v1/auth", auth);
    app.use("/api/v1/profile", profile);
    app.use("/api/v1/matches", matches);
    app.use("/api/v1/api-keys", apiKeys);
    app.use("/api/v1/public", publicAPI);
    app.use("/api/v1/friends", friends);
    app.use("/api/v1/chat", chat);

    // Health check endpoint
    app.get("/health", (req: Request, res: Response) => {
        res.status(200).json({ status: "ok" });
    });

    // 404 handler (before error handler)
    app.use(notFoundHandler);

    // Error handling (must be the last middleware)
    app.use(errorHandler);

    const PORT = process.env.PORT || 3001;
    const httpServer = http.createServer(app);
    initSocket(httpServer);
    httpServer.listen(PORT, () => {
        console.log(`Server is up listening to port ${PORT}`);
    });
}

// Initialize the application
initializeApp().catch((error) => {
    console.error("Fatal error initializing the application:", error);
    process.exit(1);
});

export { app };
