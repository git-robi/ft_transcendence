import express, {Request, Response} from "express";
import dotenv from "dotenv"

// swagger
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerOptions from "./swaggerOptions";

const app = express();


const specs = swaggerJsdoc(swaggerOptions);


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));


import test from "./routes/test"

dotenv.config();

app.use(express.json()); 
app.use("/api/v1/test", test);



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`server is up listening to port ${PORT}`)
} )

export {app};