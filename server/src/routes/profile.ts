import express, { Response } from "express";
import { prisma } from "../prisma/client";
import { protect } from "../middleware/auth";

const router = express.Router();

//get endpoint that returns the user's profile
router.get("/me", protect, async (req: any, res: Response) => {
    try {
        const profile = await prisma.profile.findUnique({
            where: { userId: req.user.id },
        });

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        return res.status(200).json(profile);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

//put endpoint to update profile info
router.patch("/me", protect, async (req: any, res: Response) => {
    try {
        const { name, bio, avatarUrl } = req.body as {
      name?: string;
      bio?: string;
      avatarUrl?: string;
    };

    // ---- validation ----
    if (name !== undefined && typeof name !== "string") {
      return res.status(400).json({ message: "name must be a string" });
    }
    if (bio !== undefined && typeof bio !== "string") {
      return res.status(400).json({ message: "bio must be a string" });
    }
    if (avatarUrl !== undefined && typeof avatarUrl !== "string") {
      return res.status(400).json({ message: "avatarUrl must be a string" });
    }

    if (name !== undefined && name.trim().length === 0) {
      return res.status(400).json({ message: "name cannot be empty" });
    }

    if (avatarUrl !== undefined && avatarUrl.length > 2048) {
        return res.status(400).json({ message: "avatarUrl must be 2048 characters or less"});
    }

    // bio is @db.VarChar(255)
    if (bio !== undefined && bio.length > 255) {
      return res.status(400).json({ message: "bio must be 255 characters or less" });
    }

    // ---- ensure profile exists ----
    const existing = await prisma.profile.findUnique({
      where: { userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // ---- patch update (only fields sent) ----
    const updated = await prisma.profile.update({
      where: { userId: req.user.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      },
    });

    return res.status(200).json(updated);
        
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
})

export default router;
