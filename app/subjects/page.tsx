import React from "react";
import "../SubjectPage.css";
import { Trophy } from "lucide-react";
import SubjectCard from "../components/SubjectCard";
import ProgressBar from "../components/ProgressBar";
import clientPromise from "@/lib/mongodb";

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
            subjectId={sub._id.toString()}
            iconName={sub.icon}
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
