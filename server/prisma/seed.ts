import { prisma } from "./client";

async function seed() {
    await prisma.users.create({
        data: { name: "Ping", email: "ping@example.com", password: "pong123" },
    });
};

seed().then(() => prisma.$disconnect());