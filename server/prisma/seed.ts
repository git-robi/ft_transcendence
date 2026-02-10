import bcrypt from "bcrypt";
import { prisma } from "../src/prisma/client";

async function seed() {
    const hashedPassword = await bcrypt.hash("pong123", 12);

    await prisma.user.upsert({
        where: { email: "ping@example.com" },
        update: {},
        create: {
            email: "ping@example.com",
            password: hashedPassword,
            profile: {
                create: {
                    name: "Ping",
                    bio: "",
                }
            }
        }
    });

    console.log("✅ Database seeded successfully");
}

seed()
    .then(() => prisma.$disconnect())
    .catch((error) => {
        console.error("❌ Seed error:", error);
        await prisma.$disconnect();
        process.exit(1);
    });
