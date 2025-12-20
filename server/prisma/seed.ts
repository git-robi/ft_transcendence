import { prisma } from "./client";

async function seed() {
    await prisma.users.create({
        data: { name: "Ping", password: "pong123" },
    });
};

seed().then(() => prisma.$disconnect());