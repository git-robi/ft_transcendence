import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "../i18n/useLanguage";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { PublicUser } from "../types";
import MyCalendar from "../components/StatisticsHistory/MyCalendar";
import Sparkline from "../components/StatisticsHistory/Sparkline";

interface StatisticsHistoryProps {
  setUser: (user: PublicUser | null ) => void;
  user: PublicUser | null;
}


const StatisticsHistory = ({ setUser, user }: StatisticsHistoryProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const formatted = selectedDate.toLocaleDateString(language, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

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
        <main className="grid gap-8 m-6" style={{gridTemplateColumns: "380px 1fr 320px "}}>
          {/*1st column*/}
          <div className="">
            <div className="">
              <MyCalendar 
                value={selectedDate}
                onChange={setSelectedDate}
                locale={language}
              />
            </div>
            <div className="my-6">
              Your Level: xx points
            </div>
            <div>
              Your Progression
            </div>
            <div>
              <Sparkline 
                data={[10,15,12,20,18]}
              />
            </div>


          </div>
          {/*2nd column*/}
          <div>
            Your matches: {formatted}
          </div>
          {/*3rd column*/}
          <div className="text-center">
            Leaderboard: Overall Ranking
          </div>
        </main>
      <Footer setUser={setUser}/>
    </div>
  )
}

export default StatisticsHistory;