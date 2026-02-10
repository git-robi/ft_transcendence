import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { PublicUser } from "../types";
import GameSettingsButtons from "../components/GameSettings/GameSettingsButons";

interface GameSettingsProps {
  setUser: (user: PublicUser | null) => void;
  user: PublicUser | null;
}

const GameSettings = ({ setUser, user }: GameSettingsProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }
  return (
    <div className="min-h-screen bg-neutral-700 text-white flex flex-col">
      <Header titleKey="gameSettings" />
      <GameSettingsButtons />
      <Footer setUser={setUser} />
    </div>
  )
}

export default GameSettings;