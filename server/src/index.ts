import express, {Request, Response} from "express";
import dotenv from "dotenv"

//import test route
import test from "./routes/test"

dotenv.config();

const app = express();


app.use(express.json()); //allows JSON request bodies
app.use("/api/v1/test",test);



const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`server is up listening to port ${PORT}`)
} )

export {app};