"use client";

import React from "react";
import "./SubjectPage.css";
import { FlaskConical, BookOpen, Globe, Sigma, Trophy } from "lucide-react";
import SubjectCard from "./components/SubjectCard";
import ProgressBar from "./components/ProgressBar";

export default function Home() {
  return (
    <div className="SubjectPage">
      <header className="SubjectPage__header">
        <h1 className="SubjectPage__title">My Subjects</h1>
        <p className="SubjectPage__subtitle">
          Welcome back, Alex! Pick a subject to resume your learning.
        </p>
      </header>

      <div className="SubjectGrid">
        <SubjectCard
          subject="Science"
          cardCount={30}
          masteryPercent={85}
          Icon={FlaskConical}
          accentColor="#6BA898"
          accentDark="#4D7A6E"
          href="/units"
        />
        <SubjectCard
          subject="History"
          cardCount={24}
          masteryPercent={10}
          Icon={BookOpen}
          accentColor="#F2A359"
          accentDark="#D18E4E"
        />
        <SubjectCard
          subject="Geography"
          cardCount={18}
          masteryPercent={45}
          Icon={Globe}
          accentColor="#5C89E9"
          accentDark="#3E62B3"
        />
        <SubjectCard
          subject="Mathematics"
          cardCount={42}
          masteryPercent={92}
          Icon={Sigma}
          accentColor="#E9C46A"
          accentDark="#C9A64A"
        />
      </div>

      <section className="DailyGoal">
        <div className="DailyGoal__icon">
          <Trophy size={32} color="white" />
        </div>
        <div className="DailyGoal__info">
          <h2 className="DailyGoal__title">Daily Learning Goal</h2>
          <p className="DailyGoal__subtitle">45 / 50 cards completed</p>
        </div>
        <div className="DailyGoal__progress">
          <ProgressBar current={45} total={50} title="Daily Goal" />
        </div>
      </section>
    </div>
  );
}
