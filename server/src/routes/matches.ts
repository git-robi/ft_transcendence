import express, { Response } from "express";
import { prisma } from "../prisma/client";
import { protect } from "../middleware/auth";

const router = express.Router();

const calculateLevel = (xp: number) => {
    let level = 1;
    let threshold = 200;
    while (xp >= threshold) {
        level++;
        threshold += (level + 1) * 100;
    }
    return level;
};

// Users are ranked by total wins
// If two users have the same number of wins, 
// we break the tie using win rate
const getRankedUsers = async () => {
    const allUsers = await prisma.user.findMany({
        include: {
            profile: true,
            matches: { where: { status: "closed" } }
        }
    });

    return allUsers
        .map(u => {
            const wins = u.matches.filter(
                m => m.userScore > m.opponentScore
            ).length;

            const gamesPlayed = u.matches.length;

            const winRate = gamesPlayed === 0
                ? 0
                : wins / gamesPlayed;

            return {
                userId: u.id,
                name: u.profile?.name,
                avatarUrl: u.profile?.avatarUrl,
                level: u.profile?.level,
                wins,
                gamesPlayed,
                winRate: Number(winRate.toFixed(2))
            };
        })
        .sort((a, b) => {
            
            if (b.wins !== a.wins) {
                return b.wins - a.wins;
            }

            
            return b.winRate - a.winRate;
        });
};


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

        return res.status(201).json(match);
        

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
 *         description: Match updated and profile XP/level updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 match:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     opponent:
 *                       type: string
 *                     guestName:
 *                       type: string
 *                     userScore:
 *                       type: integer
 *                     opponentScore:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                 profile:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     avatarUrl:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     level:
 *                       type: integer
 *                     xp:
 *                       type: integer
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", protect, async (req, res) => {
    try {
        const {userScore, opponentScore} = req.body;
        const idUser = Number(req.params.id);
        const gainedXp = userScore > opponentScore ? 50 : 10;
        const profile = await prisma.profile.findFirst({
            where: {
                userId : idUser
            }
        });
        if (!profile){
            return;
        }
        const newXp = gainedXp + profile.xp;

        const newLevel = calculateLevel(newXp);

        const updatedProfile = await prisma.profile.update({
            where: {
                userId : idUser,
            },
            data : {
                level : newLevel,
                xp : newXp
            }
        });

        const updatedMatch = await prisma.match.update({
            where: { id : idUser},
            data: {
                userScore,
                opponentScore,
                status: "closed",
                completedAt: new Date()
            }
        });

        return res.status(200).json({ match: updatedMatch, profile: updatedProfile });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @swagger
 * /api/v1/matches/stats/{id}:
 *   get:
 *     summary: Get user statistics
 *     description: Returns game statistics for the authenticated user or a specific user by ID.
 *     tags:
 *       - Matches
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         schema:
 *           type: integer
 *         description: User ID (optional, defaults to authenticated user)
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gamesPlayed:
 *                   type: integer
 *                 wins:
 *                   type: integer
 *                 losses:
 *                   type: integer
 *                 rank:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */
router.get("/stats/:id?", protect, async (req: any, res) => {
    try {
        
        const userId = req.params.id ? Number(req.params.id) : req.user.id;

        const matches = await prisma.match.findMany({
            where: {
                userId : userId,
            }
        });
        
        const gamesPlayed = matches.length;
        const wins = matches.filter(m => m.userScore > m.opponentScore).length;
        const losses = matches.filter(m => m.userScore < m.opponentScore).length;
        const ranked = await getRankedUsers();
        const rank = ranked.findIndex(r => r.userId === userId) + 1;

        return res.status(200).json({
            gamesPlayed,
            wins,
            losses,
            rank
        })

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @swagger
 * /api/v1/matches/leaderboard:
 *   get:
 *     summary: Get leaderboard
 *     description: Returns all users ranked by wins, with win rate as tiebreaker.
 *     tags:
 *       - Matches
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   avatarUrl:
 *                     type: string
 *                   level:
 *                     type: integer
 *                   wins:
 *                     type: integer
 *                   gamesPlayed:
 *                     type: integer
 *                   winRate:
 *                     type: number
 *       500:
 *         description: Internal server error
 */
router.get("/leaderboard", protect, async (req, res) => {
    try {
        const ranked = await getRankedUsers();
        return res.status(200).json(ranked);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;