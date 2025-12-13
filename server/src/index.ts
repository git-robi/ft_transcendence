import express, {Request, Response} from "express";
import dotenv from "dotenv"

// swagger
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerOptions from "./swaggerOptions";

const app = express();

// Generate the OpenAPI specification
const specs = swaggerJsdoc(swaggerOptions);

// Serve the documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

//import test route
import test from "./routes/test"

dotenv.config();

app.use(express.json()); //allows JSON request bodies
app.use("/api/v1/test",test);



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`server is up listening to port ${PORT}`)
} )

export {app};