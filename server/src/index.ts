
import "dotenv/config";
import express, {Request, Response} from "express";
import dotenv from "dotenv"
import "./passport-config"
import auth  from "./routes/auth"
import apiKeys from "./routes/api-keys"
import cors from "cors"


// swagger
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerOptions from "./swaggerOptions";

import cookieParser from "cookie-parser";


dotenv.config();

const app = express();

app.use(cookieParser());

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));

const specs = swaggerJsdoc(swaggerOptions);


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));


app.use(express.json()); 
app.use("/api/v1/auth", auth);
app.use("/api/v1/api-keys", apiKeys);



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`server is up listening to port ${PORT}`)
} )

export {app};