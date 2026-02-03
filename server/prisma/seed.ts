//import { prisma } from "./client";
import bcrypt from "bcrypt"
import { prisma } from '../src/prisma/client';

async function seed() {
    const hashedPassword = await bcrypt.hash("pong123", 10);
    
    await prisma.user.create({
        data: {
            email: "ping@example.com",
            password: hashedPassword,
            profile: {
                create: {
                    name: "Ping",
                    bio: ''
                }
            }
        },
    });
}

seed().then(() => prisma.$disconnect());
