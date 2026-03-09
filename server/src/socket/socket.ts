import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import vaultClient from "../config/vault";
import { prisma } from "../prisma/client";
import { onlineUsers } from "./onlineUsers";
import { FriendStatus } from "../prisma/generated/prisma/enums";

let ioInstance: Server | null = null;

export function getIO(): Server | null {
    return ioInstance;
}

export function initSocket(httpServer: HttpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "https://localhost",
            credentials: true,
        },
    });

    io.use((socket, next) => {
        const cookie = socket.handshake.headers.cookie;
        const token = cookie
            ?.split(";")
            .find(c => c.trim().startsWith("token="))
            ?.split("=")[1];

        if (!token) {
            return next(new Error("Unauthorized"));
        }

        try {
            const decoded = jwt.verify(token, vaultClient.getJwtSecret()) as { id: number };
            socket.data.userId = decoded.id;
            next();
        } catch {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", async (socket) => {
        const userId: number = socket.data.userId;

        // join room + become online
        socket.join(`user:${userId}`);
        onlineUsers.add(userId);

        // notify browser that user is online
        const friendIds = await getFriendIds(userId);

        // tell the connecting user which friends are already online
        const onlineFriendIds = friendIds.filter(id => onlineUsers.has(id));
        socket.emit("friends:online-list", onlineFriendIds);

        friendIds.forEach(friendId => {
            io.to(`user:${friendId}`).emit("friend:online", { userId });
        });

        // real-time chat
        socket.on("message:send", async ({ receiverId, content }: { receiverId: number; content: string }) => {
            try {
                if (!receiverId || !content || typeof content !== "string" || content.trim().length === 0) return;
                if (content.length > 1000) return;

                const friends = await getFriendIds(userId);
                if (!friends.includes(receiverId)) return;

                const message = await prisma.message.create({
                    data: { senderId: userId, receiverId, content: content.trim() },
                });

                io.to(`user:${receiverId}`).emit("message:receive", message);
                socket.emit("message:sent", message);
            } catch {
                // silent
            }
        });

        socket.on("disconnect", async () => {
            onlineUsers.delete(userId);

            // notify browser that user is offline
            const friendIds = await getFriendIds(userId);
            friendIds.forEach(friendId => {
                io.to(`user:${friendId}`).emit("friend:offline", { userId });
            });
        });
    });

    ioInstance = io;
    return io;
}

async function getFriendIds(userId: number): Promise<number[]> {
    const friendships = await prisma.friends.findMany({
        where: {
            OR: [{ senderId: userId }, { receiverId: userId }],
            status: FriendStatus.ACCEPTED,
        },
        select: { senderId: true, receiverId: true },
    });
    return friendships.map(f => f.senderId === userId ? f.receiverId : f.senderId);
}
