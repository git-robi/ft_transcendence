//import { prisma } from "./client";
import { PrismaClient } from '../src/prisma/generated/prisma/client';

async function seed() {
    await prisma.users.create({
        data: { name: "Ping", email: "ping@example.com", password: "pong123" },
    });
};

seed().then(() => prisma.$disconnect());
