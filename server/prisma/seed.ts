//import { prisma } from "./client";
import bcrypt from "bcrypt"
import { prisma } from '../src/prisma/client';

async function seed() {
    const hashedPassword = await bcrypt.hash("pong123", 10);
    
    await prisma.user.upsert({
        where: { email: "ping@example.com" },
        update: {},
        create: { 
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
    
    console.log("✅ Database seeded successfully");
}

seed()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error("❌ Seed error:", e);
        prisma.$disconnect();
        process.exit(1);
    });
