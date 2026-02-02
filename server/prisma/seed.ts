//import { prisma } from "./client";
import bcrypt from "bcrypt"
import { prisma } from '../src/prisma/client';

async function seed() {
    const hashedPassword = await bcrypt.hash("pong123", 10);
    
    await prisma.users.upsert({
        where: { email: "ping@example.com" },
        update: {},
        create: { 
            name: "Ping", 
            email: "ping@example.com", 
            password: hashedPassword 
        },
    });
    
    console.log("✅ Database seeded successfully");
}

seed()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error("❌ Seed error:", e);
        prisma.$disconnect();
        process.exit(1);
    });
