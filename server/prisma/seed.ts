import { prisma } from "./client";
import bcrypt from "bcrypt"

async function seed() {
    const hashedPassword = await bcrypt.hash("pong123", 10);
    
    await prisma.users.create({
        data: { 
            name: "Ping", 
            email: "ping@example.com", 
            password: hashedPassword 
        },
    });
}

seed().then(() => prisma.$disconnect());