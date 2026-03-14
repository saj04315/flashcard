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

    // Fetch Subject for breadcrumbs
    let subjectName = "Subject";
    if (unit && unit.subject_id) {
        let subjectIdObj;
        try {
            subjectIdObj = ObjectId.isValid(unit.subject_id) ? new ObjectId(unit.subject_id) : unit.subject_id;
        } catch (e) {
            subjectIdObj = unit.subject_id;
        }

        const subject = await db.collection("subjects").findOne({
            $or: [
                { _id: subjectIdObj },
                { _id: String(unit.subject_id) }
            ],
        }, { projection: { name: 1 } }); // only fetch the name

        if (subject) {
            subjectName = subject.name;
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
                    { label: subjectName, href: `/units?subjectId=:subjectId` },
                    { label: unitTitle }
                ]} />
            </header>

            <StudyInterface
                flashcards={JSON.parse(JSON.stringify(flashcards))}
                subjectName={subjectName}
                unitTitle={unitTitle}
            />
        </div>
    );
}
