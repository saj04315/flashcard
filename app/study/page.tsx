import React from "react";
import "./StudyPage.css";
import Path from "../components/Path";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import StudyInterface from "./StudyInterface";

export default async function StudyPage({
    searchParams,
}: {
    searchParams: Promise<{ unitId?: string }>;
}) {
    const { unitId } = await searchParams;
    const client = await clientPromise;
    const db = client.db();

    // Fetch Unit Details
    const unit = await db.collection("units").findOne({ _id: unitId as any });

    // Fetch flashcards for this Unit
    const flashcards = await db.collection("flashcards").find({ unit_id: unitId }).toArray();

    // Fetch Subject for breadcrumbs and color
    let subjectName = "Subject";
    let subjectColor = "#7ED321"; // Default green if not found
    if (unit) {
        const subject = await db.collection("subjects").findOne({
            $or: [
                { _id: unit.subject_id as any },
                { _id: ObjectId.isValid(unit.subject_id) ? new ObjectId(unit.subject_id) : unit.subject_id as any }
            ]
        });
        if (subject) {
            subjectName = subject.name;
            subjectColor = subject.color || subjectColor;
        }
    }
    
    // Convert ObjectId to string if needed for client component
    const sanitizedFlashcards = JSON.parse(JSON.stringify(flashcards));

    const unitTitle = unit?.title || "Unit";

    return (
        <div className="StudyPage">
            <header className="StudyPage__header">
                <Path items={[
                    { label: "Dashboard", href: "/" },
                    { label: subjectName, href: `/units?subjectId=${unit?.subject_id}` },
                    { label: unitTitle }
                ]} />
            </header>

            <StudyInterface
                flashcards={JSON.parse(JSON.stringify(flashcards))}
                subjectName={subjectName}
                unitTitle={unitTitle}
                subjectColor={subjectColor}
            />
        </div>
    );
}
