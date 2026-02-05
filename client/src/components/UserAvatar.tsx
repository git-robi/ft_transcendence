import { useState, useEffect } from "react";
import Profile from "../APIs/profile";

const BACKEND_URL = "http://localhost:3001";

export default function UserAvatar() {
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const res = await Profile.get("/me", { withCredentials: true });
        if (res.data.avatarUrl) {
          if (res.data.avatarUrl === "/avatars/avatar_default.png")
            setAvatarUrl(res.data.avatarUrl);
          else
            setAvatarUrl(BACKEND_URL + res.data.avatarUrl);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    
    fetchAvatar();
  }, []);

  return (
    <img
      src={avatarUrl || ""}
      alt="avatar"
      className={`rounded-full object-cover w-32 h-32`}
    />
  );
}
