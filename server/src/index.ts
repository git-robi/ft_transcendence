
import express, {Request, Response} from "express";
import dotenv from "dotenv"
import cors from "cors"

// Load environment variables FIRST before any other imports that need them
dotenv.config();

// Now import modules that depend on env variables
import "./passport-config"
import auth  from "./routes/auth"
import profile from "./routes/profile"
import apiKeys from "./routes/api-keys"


// swagger
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerOptions from "./swaggerOptions";

import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());

// Allow multiple origins for development
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const specs = swaggerJsdoc(swaggerOptions);


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));


app.use(express.json()); 
app.use("/avatars", express.static("uploads/avatars"))
app.use("/api/v1/auth", auth);
app.use("/api/v1/profile", profile);
app.use("/api/v1/api-keys", apiKeys);



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`server is up listening to port ${PORT}`)
} )

export {app};