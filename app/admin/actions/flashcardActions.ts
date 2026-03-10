"use server";

import clientPromise from "@/lib/mongodb";
import { ObjectId, WithId, Document } from "mongodb";
import { revalidatePath } from "next/cache";

export interface Flashcard {
    id: string;
    _id: string;
    unit_id: string;
    question: string;
    answer: string;
    questionImage?: string;
    answerImage?: string;
    createdAt?: Date;
}

export async function getFlashcards(unit_id: string): Promise<Flashcard[]> {
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection("flashcards");

        const cards = await collection.find({ unit_id }).toArray();

        return cards.map((c: WithId<Document>) => ({
            ...c,
            id: c._id.toString(),
            _id: c._id.toString(),
            question: (c as any).question,
            answer: (c as any).answer,
        })) as unknown as Flashcard[];
    } catch (error) {
        console.error("Error fetching flashcards:", error);
        return [];
    }
}

export async function createFlashcard(data: Omit<Flashcard, "id" | "_id">) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection("flashcards");

        await collection.insertOne({
            ...data,
            createdAt: new Date(),
        });

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error creating flashcard:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteFlashcard(id: string) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection("flashcards");

        let filter: any = { _id: id };
        if (ObjectId.isValid(id)) {
            filter = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
        }

        await collection.deleteOne(filter);

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error deleting flashcard:", error);
        return { success: false, error: (error as Error).message };
    }
}
