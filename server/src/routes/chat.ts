import express from "express";
import { prisma } from "../prisma/client";
import { protect } from "../middleware/auth";
import { FriendStatus } from "../prisma/generated/prisma/enums";
import { getIO } from "../socket/socket";

const router = express.Router();

async function areFriends(userA: number, userB: number): Promise<boolean> {
    const friendship = await prisma.friends.findFirst({
        where: {
            OR: [
                { senderId: userA, receiverId: userB },
                { senderId: userB, receiverId: userA },
            ],
            status: FriendStatus.ACCEPTED,
        },
    });
    return !!friendship;
}

/**
 * @swagger
 * /api/v1/chat/conversations:
 *   get:
 *     summary: List chat conversations
 *     description: Returns friends the user has exchanged messages with, ordered by most recent message.
 *     tags: [Chat]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/conversations", protect, async (req: any, res) => {
    try {
        const userId: number = req.user.id;

        // Get all messages involving this user, grouped by the other party
        const messages = await prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            orderBy: { createdAt: "desc" },
            include: {
                sender: { select: { id: true, profile: { select: { name: true, avatarUrl: true } } } },
                receiver: { select: { id: true, profile: { select: { name: true, avatarUrl: true } } } },
            },
        });

        // Deduplicate: keep only the latest message per conversation partner
        const seen = new Set<number>();
        const conversations: {
            friendId: number;
            friend: { id: number; profile: { name: string; avatarUrl: string } | null };
            lastMessage: { content: string; createdAt: Date; senderId: number };
        }[] = [];

        for (const msg of messages) {
            const friendId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            if (seen.has(friendId)) continue;
            seen.add(friendId);

            const friend = msg.senderId === userId ? msg.receiver : msg.sender;
            conversations.push({
                friendId,
                friend,
                lastMessage: {
                    content: msg.content,
                    createdAt: msg.createdAt,
                    senderId: msg.senderId,
                },
            });
        }

        return res.status(200).json(conversations);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @swagger
 * /api/v1/chat/{friendId}:
 *   get:
 *     summary: Get message history
 *     description: Returns messages between the authenticated user and the given friend. Paginated.
 *     tags: [Chat]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The friend's user ID
 *       - in: query
 *         name: before
 *         schema:
 *           type: integer
 *         description: Return messages with ID less than this (for pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of messages to return (max 100)
 *     responses:
 *       200:
 *         description: Array of messages
 *       400:
 *         description: Invalid friend ID
 *       403:
 *         description: Not friends
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/:friendId", protect, async (req: any, res) => {
    try {
        const userId: number = req.user.id;
        const friendId = parseInt(req.params.friendId);

        if (isNaN(friendId)) {
            return res.status(400).json({ message: "Invalid friend ID" });
        }

        if (!(await areFriends(userId, friendId))) {
            return res.status(403).json({ message: "Not friends" });
        }

        const before = req.query.before ? parseInt(req.query.before as string) : undefined;
        const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: friendId },
                    { senderId: friendId, receiverId: userId },
                ],
                ...(before ? { id: { lt: before } } : {}),
            },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        // Return in chronological order
        return res.status(200).json(messages.reverse());
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @swagger
 * /api/v1/chat/{friendId}:
 *   post:
 *     summary: Send a message
 *     description: Send a message to a friend. Also emits a socket event for real-time delivery.
 *     tags: [Chat]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The friend's user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Message text (max 1000 characters)
 *     responses:
 *       201:
 *         description: Message sent
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Not friends
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/:friendId", protect, async (req: any, res) => {
    try {
        const userId: number = req.user.id;
        const friendId = parseInt(req.params.friendId);

        if (isNaN(friendId)) {
            return res.status(400).json({ message: "Invalid friend ID" });
        }

        const { content } = req.body;
        if (!content || typeof content !== "string" || content.trim().length === 0) {
            return res.status(400).json({ message: "Message content is required" });
        }
        if (content.length > 1000) {
            return res.status(400).json({ message: "Message must be 1000 characters or less" });
        }

        if (!(await areFriends(userId, friendId))) {
            return res.status(403).json({ message: "Not friends" });
        }

        const message = await prisma.message.create({
            data: {
                senderId: userId,
                receiverId: friendId,
                content: content.trim(),
            },
        });

        // Real-time delivery via socket.io
        const io = getIO();
        if (io) {
            io.to(`user:${friendId}`).emit("message:receive", message);
        }

        return res.status(201).json(message);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
