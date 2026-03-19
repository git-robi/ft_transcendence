import { useState, useEffect } from "react";
import Profile from "../APIs/profile";

const BACKEND_URL = (import.meta.env.VITE_API_URL || "").replace(/\/api\/v1$/, '') || window.location.origin;

export default function UserAvatar({ size = 150 }: { size?: number }) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    async function fetchAvatar() {
        try {
            const res = await Profile.get("/me", { withCredentials: true });
            if (res.data.avatarUrl) {
                if (res.data.avatarUrl === "/avatars/avatar_default.png")
                    setAvatarUrl(res.data.avatarUrl);
                else
                    setAvatarUrl(BACKEND_URL + res.data.avatarUrl);
            }
        } catch {
            // silent
        }
    }

    useEffect(() => {
        fetchAvatar();
    }, []);

    return <img src={avatarUrl ?? ""} alt="avatar" width={size} />;
}
