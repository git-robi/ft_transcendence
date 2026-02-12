import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { PublicUser } from "../types";

interface StatisticsHistoryProps {
  setUser: (user: PublicUser | null ) => void;
  user: PublicUser | null;
}

const StatisticsHistory = ({ setUser, user }: StatisticsHistoryProps) => {
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
      <Header titleKey='statisticsHistory'/>
      <Footer setUser={setUser}/>
    </div>
  )
}

export default StatisticsHistory;