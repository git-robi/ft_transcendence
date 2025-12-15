import express, {Request, Response} from "express";
import dotenv from "dotenv"

import test from "./routes/test"
import cors from "cors"


// swagger
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerOptions from "./swaggerOptions";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));

const specs = swaggerJsdoc(swaggerOptions);


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));


app.use(express.json()); 
app.use("/api/v1/test", test);



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`server is up listening to port ${PORT}`)
} )

export {app};