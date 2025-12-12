import express, {Request, Response} from "express";

const router = express.Router();

//healthcheck endpoint
router.get("/", (req: Request, res: Response) => {
    res.status(200).json({message: "Test endpoint is working"});
});


export default router;