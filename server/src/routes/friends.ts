import express from "express";
import { prisma } from "../prisma/client";
import { protect } from "../middleware/auth";
import { FriendStatus } from "../prisma/generated/prisma/enums";
import { onlineUsers } from "../socket/onlineUsers";

const router = express.Router();


router.get("/", protect, async (req, res) => {
    try {
        const userId = (req.user as { id: number }).id;

        const friendships = await prisma.friends.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId },
                ],
                status: FriendStatus.ACCEPTED,
            },
            include: {
                sender:   { select: { id: true, profile: { select: { name: true, avatarUrl: true } } } },
                receiver: { select: { id: true, profile: { select: { name: true, avatarUrl: true } } } },
            },
        });

        const result = friendships.map(f => {
            const friend = f.senderId === userId ? f.receiver : f.sender;
            return {
                friendshipId: f.id,
                since: f.createdAt,
                friend,
                isOnline: onlineUsers.has(friend.id),
            };
        });

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});


router.post("/request/:id", protect, async (req, res) => {
    try {
        const receiverId = parseInt(req.params.id);
        const senderId = (req.user as { id: number }).id;

        if (isNaN(receiverId)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        if (senderId === receiverId) {
            return res.status(400).json({ message: "Cannot send a friend request to yourself" });
        }

        const target = await prisma.user.findUnique({ where: { id: receiverId } });
        if (!target) {
            return res.status(404).json({ message: "User not found" });
        }

        const existing = await prisma.friends.findFirst({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ],
            },
        });
        if (existing) {
            return res.status(409).json({ message: "Friend request already exists" });
        }

        const request = await prisma.friends.create({
            data: { senderId, receiverId, status: FriendStatus.PENDING },
        });

        return res.status(201).json(request);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/requests", protect, async (req, res) => {
    try {
        const userId = (req.user as { id: number }).id;

        const requests = await prisma.friends.findMany({
            where: {
                receiverId: userId,
                status: FriendStatus.PENDING,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        profile: { select: { name: true, avatarUrl: true } },
                    },
                },
            },
        });

        return res.status(200).json(requests);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/requests/sent", protect, async (req, res) => {
    try {
        const userId = (req.user as { id: number }).id;

        const sent = await prisma.friends.findMany({
            where: {
                senderId: userId,
                status: FriendStatus.PENDING,
            },
            include: {
                receiver: {
                    select: {
                        id: true,
                        profile: { select: { name: true, avatarUrl: true } },
                    },
                },
            },
        });

        return res.status(200).json(sent);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/accept/:id", protect, async (req, res) => {
    try {
        const userId = (req.user as { id: number }).id;
        const senderId = parseInt(req.params.id);

        if (isNaN(senderId)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const request = await prisma.friends.findFirst({
            where: {
                senderId: senderId,
                receiverId: userId,
                status: FriendStatus.PENDING,
            },
        });

        if (!request) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        await prisma.friends.update({
            where: { id: request.id },
            data: { status: FriendStatus.ACCEPTED },
        });

        return res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.delete("/:id", protect, async (req, res) => {
    try {
        const userId = (req.user as { id: number }).id;
        const targetId = parseInt(req.params.id);

        if (isNaN(targetId)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const result = await prisma.friends.deleteMany({
            where: {
                OR: [
                    { senderId: userId,   receiverId: targetId },
                    { senderId: targetId, receiverId: userId   },
                ],
            },
        });

        if (result.count === 0) {
            return res.status(404).json({ message: "Not a friend" });
        }

        return res.status(200).json({ message: "Friend removed" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
