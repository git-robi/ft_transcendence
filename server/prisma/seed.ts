import { prisma } from "./client";
import bcrypt from "bcrypt";

async function seed() {
    // Hash de contraseña con bcrypt (cost factor 12)
    const hashedPassword = await bcrypt.hash("pong123", 12);
    
    await prisma.users.create({
        data: { name: "Ping", password: hashedPassword },
    });
    
    console.log("Usuario de prueba creado: Ping / pong123");
};

seed()
    .then(() => prisma.$disconnect())
    .catch((error) => {
        console.error("Error en seed:", error);
        prisma.$disconnect();
        process.exit(1);
    });