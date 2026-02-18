import { useState, useEffect } from "react";
import Profile from "../APIs/profile";

const BACKEND_HOST = (import.meta.env.VITE_API_URL ?? '').replace(/\/api\/v1\/?$/, '');

export default function UserAvatar() {
  const [avatarUrl, setAvatarUrl] = useState<string>('/avatars/avatar_default.png');

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const res = await Profile.get("/me", { withCredentials: true });
        console.log("Backend returned avatarUrl:", res.data.avatarUrl);
    
        if (res.data.avatarUrl) {
          if (res.data.avatarUrl === "/avatars/avatar_default.png") {
            setAvatarUrl(res.data.avatarUrl);
          } else {
            // If VITE_API_URL provided, build absolute host; otherwise use relative path so Vite proxy serves it.
            setAvatarUrl(
              BACKEND_HOST ? `${BACKEND_HOST}${res.data.avatarUrl}` : `${res.data.avatarUrl}`
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
        setAvatarUrl('/avatars/avatar_default.png')
      }
    };
    
    fetchAvatar();
  }, []);

  return (
    <img
      src={avatarUrl}
      alt="avatar"
      className={`rounded-full object-cover w-32 h-32`}
    />
  );
}
