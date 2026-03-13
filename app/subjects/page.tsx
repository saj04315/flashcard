import React from "react";
import "../SubjectPage.css";
import {
  FlaskConical, BookOpen, Globe, Sigma, Trophy,
  Cpu, Beaker, Atom, History,
  Map, Languages, Palette, LineChart, LucideIcon
} from "lucide-react";
import SubjectCard from "../components/SubjectCard";
import ProgressBar from "../components/ProgressBar";
import clientPromise from "@/lib/mongodb";

// Mapping for database icon strings to Lucide components
const iconMap: Record<string, LucideIcon> = {
  "computer_science_icon_url": Cpu,
  "mathematics_icon_url": Sigma,
  "physics_icon_url": Atom,
  "chemistry_icon_url": Beaker,
  "biology_icon_url": Beaker,
  "history_icon_url": History,
  "geography_icon_url": Map,
  "literature_icon_url": Languages,
  "art_icon_url": Palette,
  "economics_icon_url": LineChart,
};

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; gradeId?: string }>;
}) {
  const { search, gradeId } = await searchParams;
  const client = await clientPromise;
  const db = client.db();

  const query: any = {};
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  if (gradeId) {
    query.gradeId = gradeId;
  }
  
  const subjects = await db.collection("subjects").find(query).toArray();

  return (
    <div className="SubjectPage">
      <header className="SubjectPage__header">
        <h1 className="SubjectPage__title">{gradeId ? 'Subjects for Grade' : 'All Subjects'}</h1>
        <p className="SubjectPage__subtitle">
          {gradeId ? 'Select a subject from your grade to study.' : 'Welcome back, Alex! Pick a subject to resume your learning.'}
        </p>
      </header>

      <div className="SubjectGrid">
        {subjects.map((sub: any) => (
          <SubjectCard
            key={sub._id.toString()}
            subject={sub.name}
            Icon={iconMap[sub.icon] || BookOpen}
            accentColor={sub.color}
            bgImage={`https://images.unsplash.com/featured/?${encodeURIComponent(sub.name)}`}
            href={`/units?subjectId=${sub._id}`}
          />
        ))}
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
