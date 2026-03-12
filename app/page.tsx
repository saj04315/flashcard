import React from "react";
import "./SubjectPage.css";
import {
  Trophy, BookOpen, GraduationCap, School, Book
} from "lucide-react";
import GradeCard from "./components/GradeCard";
import ProgressBar from "./components/ProgressBar";
import clientPromise from "@/lib/mongodb";

// Mapping for database icon strings to Lucide components if needed for Grades
const gradeIconMap: Record<string, any> = {
  "graduation_cap": GraduationCap,
  "school": School,
  "book": Book,
  "default": GraduationCap
};

export default async function GradesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const client = await clientPromise;
  const db = client.db();

  const query = search ? { name: { $regex: search, $options: "i" } } : {};
  // Assuming a 'grades' collection exists
  const grades = await db.collection("grades").find(query).toArray();

  return (
    <div className="SubjectPage">
      <header className="SubjectPage__header">
        <h1 className="SubjectPage__title">My Grades</h1>
        <p className="SubjectPage__subtitle">
          Select a grade to view its subjects.
        </p>
      </header>

      <div className="SubjectGrid">
        {grades.map((grade: any) => (
          <GradeCard
            key={grade._id.toString()}
            grade={grade.name}
            subjectCount={grade.subjectCount || 0}
            Icon={gradeIconMap[grade.icon] || GraduationCap}
            accentColor={grade.color || '#F28F3B'}
            bgImage={grade.bgImage || `https://images.unsplash.com/photo-1546410531-bea5aadcb6ce?auto=format&fit=crop&q=80&w=320`}
            href={`/subjects?gradeId=${grade._id}`}
          />
        ))}
        {grades.length === 0 && (
            <div style={{ color: 'white', gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                No grades found. Please add grades from the admin panel.
            </div>
        )}
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
