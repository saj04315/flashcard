import React from "react";
import "./UnitPage.css";
import {
    Globe, Leaf, CloudLightning, Trophy, Zap,
    BookOpen, Book, Beaker, Atom, Cpu,
    LucideIcon
} from "lucide-react";
import UnitCard from "../components/UnitCard";
import Path from "../components/Path";
import clientPromise from "@/lib/mongodb";

// Mapping for unit icons if needed, or fallback
const iconMap: Record<string, LucideIcon> = {
    "globe": Globe,
    "leaf": Leaf,
    "cloud": CloudLightning,
    "zap": Zap,
    "book": BookOpen,
};

export default async function UnitsPage({
    searchParams,
}: {
    searchParams: Promise<{ subjectId?: string }>;
}) {
    const { subjectId } = await searchParams;
    const client = await clientPromise;
    const db = client.db();

    // Fetch Subject Details
    const subject = await db.collection("subjects").findOne({ _id: subjectId as any });

    // Fetch Units for this Subject
    const units = await db.collection("units").find({ subject_id: subjectId }).toArray();

    const subjectName = subject?.name || "Subject";

    return (
        <div className="UnitPage">
            <header className="UnitPage__header">
                <Path items={["Dashboard", subjectName]} />
                <h1 className="UnitPage__title">{subjectName} Units</h1>
                <p className="UnitPage__subtitle">
                    Select a unit to start practicing your flashcards and master the curriculum.
                </p>
            </header>

            <div className="UnitGrid">
                {units.length > 0 ? (
                    units.map((unit: any, index: number) => (
                        <UnitCard
                            key={unit._id.toString()}
                            unitNumber={unit.order || index + 1}
                            title={unit.title.toUpperCase()}
                            cardCount={Math.floor(Math.random() * 30) + 10} // Placeholder for now
                            duration={Math.floor(Math.random() * 20) + 5}   // Placeholder for now
                            bgImage={`https://images.unsplash.com/photo-${1451187580459 + index}-43490279c0fa?auto=format&fit=crop&q=80&w=640`}
                            Icon={Book}
                            href={`/study?unitId=${unit._id}`}
                        />
                    ))
                ) : (
                    <p style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.6 }}>
                        No units found for this subject.
                    </p>
                )}
            </div>

            <section className="ChallengeBanner">
                <div className="ChallengeBanner__left">
                    <div className="ChallengeBanner__icon">
                        <Trophy size={24} />
                    </div>
                    <div className="ChallengeBanner__info">
                        <h4>Ready for a challenge?</h4>
                        <p>Complete all units to earn your {subjectName} Explorer badge.</p>
                    </div>
                </div>
                <a href="#" className="ChallengeBanner__link">View Progress</a>
            </section>
        </div>
    );
}
