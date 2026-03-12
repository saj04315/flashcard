"use server";

import clientPromise from "../../../lib/mongodb";
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
    order?: number;
    createdAt?: Date;
}

export async function getFlashcards(unit_id: string): Promise<Flashcard[]> {
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection("flashcards");

        const cards = await collection.find({ unit_id }).sort({ order: 1, createdAt: 1 }).toArray();

        return cards.map((c: WithId<Document>) => ({
            ...c,
            id: c._id.toString(),
            _id: c._id.toString(),
            question: (c as any).question,
            answer: (c as any).answer,
            order: (c as any).order || 0,
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

        const maxOrderCard = await collection.find({ unit_id: data.unit_id }).sort({ order: -1 }).limit(1).toArray();
        const nextOrder = maxOrderCard.length > 0 ? (maxOrderCard[0].order || 0) + 1 : 0;

        await collection.insertOne({
            ...data,
            order: nextOrder,
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

export async function updateFlashcardOrders(updates: { id: string; order: number }[]) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection("flashcards");

        const bulkOps = updates.map(update => {
            let filterId: any = update.id;
            if (ObjectId.isValid(update.id)) {
                filterId = new ObjectId(update.id);
            }
            return {
                updateOne: {
                    filter: { _id: filterId },
                    update: { $set: { order: update.order } }
                }
            };
        });

        if (bulkOps.length > 0) {
            await collection.bulkWrite(bulkOps);
        }

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error updating flashcard orders:", error);
        return { success: false, error: (error as Error).message };
    }
}
