import express, { Response } from "express";
import { prisma } from "../prisma/client";
import { protect } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /api/v1/matches:
 *   post:
 *     summary: Create a match
 *     description: Creates a new match for the authenticated user against AI or a guest.
 *     tags:
 *       - Matches
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - opponent
 *             properties:
 *               opponent:
 *                 type: string
 *                 description: Type of opponent ("ai" or "guest")
 *               guestName:
 *                 type: string
 *                 description: Name of the guest player (only when opponent is "guest")
 *     responses:
 *       201:
 *         description: Match created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 userId:
 *                   type: integer
 *                 opponent:
 *                   type: string
 *                 guestName:
 *                   type: string
 *                 userScore:
 *                   type: integer
 *                 opponentScore:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 completedAt:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.post("/", protect, async (req: any, res) => {
    try {
        const {opponent, guestName} = req.body;
        
       
        const match = await prisma.match.create({
            data: {
                userId : req.user.id,
                opponent,
                guestName
            }
        });

        res.send(201).json(match);
        

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @swagger
 * /api/v1/matches/{id}:
 *   patch:
 *     summary: Update match result
 *     description: Updates a match with the final scores and marks it as closed.
 *     tags:
 *       - Matches
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userScore
 *               - opponentScore
 *             properties:
 *               userScore:
 *                 type: integer
 *                 description: Final score of the logged-in user
 *               opponentScore:
 *                 type: integer
 *                 description: Final score of the opponent
 *     responses:
 *       200:
 *         description: Match updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 userId:
 *                   type: integer
 *                 opponent:
 *                   type: string
 *                 guestName:
 *                   type: string
 *                 userScore:
 *                   type: integer
 *                 opponentScore:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 completedAt:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", protect, async (req, res) => {
    try {
        const {userScore, opponentScore} = req.body;

        const updated = await prisma.match.update({
            where: { id : Number(req.params.id)},
            data: {
                userScore,
                opponentScore,
                status: "closed",
                completedAt: new Date()
            }
        });

        res.send(200).json(updated);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
})

export default router;