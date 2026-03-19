import express, { Response } from "express";
import { prisma } from "../prisma/client";
import { protect } from "../middleware/auth";
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import { displayXpFromUnits } from "../services/xp";

const router = express.Router();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
        cb(null, true);
    } else {
        cb(new Error("Only PNG and JPEG files are allowed"));
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1,
    },
});

const hasValidImageSignature = (buffer: Buffer, mimeType: string): boolean => {
    if (mimeType === "image/png") {
        if (buffer.length < 8) return false;
        const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
        return pngSignature.every((value, index) => buffer[index] === value);
    }

    if (mimeType === "image/jpeg") {
        if (buffer.length < 3) return false;
        return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }

    return false;
};

router.get("/me", protect, async (req: any, res: Response) => {
    try {
        const profile = await prisma.profile.findUnique({
            where: { userId: req.user.id },
        });

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        return res.status(200).json({
            ...profile,
            xp: displayXpFromUnits(profile.xp),
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.patch("/upload", protect, upload.single("avatar"), async (req: any, res) => {
    
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        if (!hasValidImageSignature(req.file.buffer, req.file.mimetype)) {
            return res.status(400).json({ message: "Invalid image file" });
        }

        const extension = req.file.mimetype === "image/png" ? ".png" : ".jpg";
        const fileName = `${Date.now()}-${randomUUID()}${extension}`;
        const uploadsDir = path.join(__dirname, "../../uploads/avatars");
        const outputPath = path.join(uploadsDir, fileName);

        await fs.mkdir(uploadsDir, { recursive: true });
        await fs.writeFile(outputPath, req.file.buffer, { mode: 0o644 });

        const updated = await prisma.profile.update({
            where: {userId: req.user.id},
            data: {
                avatarUrl: `/avatars/${fileName}`
            }
        })

        return res.status(200).json({
            ...updated,
            xp: displayXpFromUnits(updated.xp),
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
})

router.patch("/me", protect, async (req: any, res: Response) => {
    try {
        const { name, bio } = req.body as {
      name?: string;
      bio?: string;
    };

    // ---- validation ----
    if (name !== undefined && typeof name !== "string") {
      return res.status(400).json({ message: "name must be a string" });
    }
    if (bio !== undefined && typeof bio !== "string") {
      return res.status(400).json({ message: "bio must be a string" });
    }

    if (name !== undefined && name.trim().length === 0) {
      return res.status(400).json({ message: "name cannot be empty" });
    }

    if (name !== undefined && name.trim().length > 30) {
      return res.status(400).json({ message: "name must be 30 characters or less" });
    }

   
    if (bio !== undefined && bio.length > 255) {
      return res.status(400).json({ message: "bio must be 255 characters or less" });
    }

    
    const existing = await prisma.profile.findUnique({
      where: { userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Profile not found" });
    }

    
    const updated = await prisma.profile.update({
      where: { userId: req.user.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(bio !== undefined ? { bio } : {}),
      },
    });

    return res.status(200).json({
      ...updated,
      xp: displayXpFromUnits(updated.xp),
    });
        
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.patch("/password", protect, async (req: any, res) => {
    try {
        const {oldPassword, newPassword} = req.body;

        if (!oldPassword || typeof oldPassword !== "string") {
            return res.status(400).json({ message: "Old password is required" });
        }

        if (!newPassword || typeof newPassword !== "string") {
            return res.status(400).json({ message: "Password is required" });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.password) {
            return res.status(400).json({ message: "User has no local password" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Old password is incorrect" });
        }

        if (newPassword.length < 12) {
            return res.status(400).json({ message: 'Password must be at least 12 characters'});
        }

        if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            return res.status(400).json({ message: 'Password must contain at least one letter and one number'});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: {
                id : req.user.id
            },
            data: {
                password: hashedPassword
            }
        });
        return res.status(200).json({message: "Password updated"});
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/:id", protect, async (req: any, res: Response) => {
    try {
        const userId = Number(req.params.id);

        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const profile = await prisma.profile.findUnique({
            where: { userId },
        });

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        return res.status(200).json({
            ...profile,
            xp: displayXpFromUnits(profile.xp),
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
