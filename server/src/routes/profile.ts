import express, { Response } from "express";
import { prisma } from "../prisma/client";
import { protect } from "../middleware/auth";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../../uploads/avatars"))
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }

})



const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
        cb(null, true);
    } else {
        cb(new Error("Only PNG and JPEG files are allowed"));
    }
};

const upload = multer({storage, fileFilter});

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

//endpoint that updates avatar pic
router.patch("/upload", upload.single("avatar"), (req, res) => {
    res.send("image uploaded");
})

//put endpoint to update profile info
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

    return res.status(200).json(updated);
        
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
})

export default router;
