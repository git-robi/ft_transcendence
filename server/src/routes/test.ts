import express, {Request, Response} from "express";

const router = express.Router();

/**
 * @swagger
 * /api/v1/test:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns a message indicating that the system is working
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Test endpoint is working
 */

//healthcheck endpoint
router.get("/", (req: Request, res: Response) => {
    res.status(200).json({message: "Test endpoint is working"});
});


export default router;