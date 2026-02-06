
import express, {Request, Response} from "express";
import dotenv from "dotenv"
import cors from "cors"

// Load environment variables FIRST before any other imports that need them
dotenv.config();

// Now import modules that depend on env variables
import "./passport-config"
import auth  from "./routes/auth"
import profile from "./routes/profile"
import matches from "./routes/matches"
import cors from "cors"
import apiKeys from "./routes/api-keys"


// swagger (for API documentation)
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerOptions from "./swaggerOptions";

import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());


app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));

const specs = swaggerJsdoc(swaggerOptions);


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));


app.use(express.json()); 
app.use("/avatars", express.static("uploads/avatars"))
app.use("/api/v1/auth", auth);
app.use("/api/v1/profile", profile);
app.use("/api/v1/matches", matches);
app.use("/api/v1/api-keys", apiKeys);



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`server is up listening to port ${PORT}`)
} )

export {app};
