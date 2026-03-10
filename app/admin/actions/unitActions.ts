"use server";

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export interface Unit {
    id: string;
    _id: string;
    subject_id: string;
    title: string;
    order: number;
    cardCount?: number;
    lastUpdated?: string;
    subjectName?: string;
    subjectColor?: string;
}

export async function getUnits(search: string = ""): Promise<Unit[]> {
    try {
        const client = await clientPromise;
        const db = client.db();
        const unitsCollection = db.collection("units");
        const subjectsCollection = db.collection("subjects");
        const flashcardsCollection = db.collection("flashcards");

        let query = {} as any;
        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        const units = await unitsCollection.find(query).sort({ order: 1 }).toArray();

        const enhancedUnits = await Promise.all(units.map(async (u) => {
            const subject = await subjectsCollection.findOne({
                $or: [
                    { _id: new ObjectId(u.subject_id) },
                    { _id: u.subject_id }
                ]
            });
            const cardCount = await flashcardsCollection.countDocuments({ unit_id: u._id.toString() });

            return {
                ...u,
                id: u._id.toString(),
                _id: u._id.toString(),
                subjectName: subject?.name || "Unknown",
                subjectColor: subject?.color || "#64748B",
                cardCount: cardCount,
                lastUpdated: u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : "Recently"
            };
        }));

        return enhancedUnits as unknown as Unit[];
    } catch (error) {
        console.error("Error fetching units:", error);
        return [];
    }
}

export async function createUnit(data: { subject_id: string; title: string; order?: number }) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const unitsCollection = db.collection("units");

        const result = await unitsCollection.insertOne({
            ...data,
            order: data.order || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        revalidatePath("/admin");
        return { success: true, id: result.insertedId.toString() };
    } catch (error) {
        console.error("Error creating unit:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function updateUnit(id: string, data: Partial<Unit>) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const unitsCollection = db.collection("units");

        let filter: any = { _id: id };
        if (ObjectId.isValid(id)) {
            filter = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
        }

        const { id: _, _id: __, ...updateData } = data as any;
        updateData.updatedAt = new Date();

        await unitsCollection.updateOne(filter, { $set: updateData });

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error updating unit:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteUnit(id: string) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const unitsCollection = db.collection("units");

        let filter: any = { _id: id };
        if (ObjectId.isValid(id)) {
            filter = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
        }

        await unitsCollection.deleteOne(filter);

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error deleting unit:", error);
        return { success: false, error: (error as Error).message };
    }
}
