import bcrypt from "bcrypt";
import { prisma } from "../src/prisma/client";

async function seed() {
    // Hash password with bcrypt (cost factor 12)
    const hashedPassword = await bcrypt.hash("pong123", 12);

    await prisma.users.create({
        data: {
            name: "Ping",
            email: "ping@example.com",
            password: hashedPassword,
        },
    });

    console.log("Test user created: Ping / ping@example.com / pong123");
}

seed()
    .then(() => prisma.$disconnect())
    .catch((error) => {
        console.error("Error en seed:", error);
        prisma.$disconnect();
        process.exit(1);
    });
