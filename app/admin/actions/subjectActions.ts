"use server";

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export interface Subject {
    id: string;
    _id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
    unitsCount?: number;
    studentsCount?: number;
}

export async function getSubjects(search: string = ""): Promise<Subject[]> {
    try {
        const client = await clientPromise;
        const db = client.db();
        const subjectsCollection = db.collection("subjects");

        let query = {} as any;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const subjects = await subjectsCollection.find(query).toArray();

        // Count units for each subject (placeholder logic if needed)
        // In a real app, you might aggregate or have a separate query
        const unitsCollection = db.collection("units");

        const enhancedSubjects = await Promise.all(subjects.map(async (s) => {
            const unitsCount = await unitsCollection.countDocuments({ subject_id: s._id.toString() });
            return {
                ...s,
                id: s._id.toString(),
                _id: s._id.toString(),
                name: s.name,
                description: s.description || s.desc || "", // Handle both variations
                color: s.color,
                icon: s.icon,
                unitsCount: unitsCount,
                studentsCount: s.studentsCount || 0
            };
        }));

        return enhancedSubjects as unknown as Subject[];
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return [];
    }
}

export async function createSubject(data: Omit<Subject, "id" | "_id">) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const subjectsCollection = db.collection("subjects");

        const result = await subjectsCollection.insertOne({
            ...data,
            createdAt: new Date(),
        });

        revalidatePath("/admin");
        return { success: true, id: result.insertedId.toString() };
    } catch (error) {
        console.error("Error creating subject:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function updateSubject(id: string, data: Partial<Subject>) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const subjectsCollection = db.collection("subjects");

        let filter: any = { _id: id };
        if (ObjectId.isValid(id)) {
            filter = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
        }

        const { id: _, _id: __, ...updateData } = data as any;

        await subjectsCollection.updateOne(filter, { $set: updateData });

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error updating subject:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteSubject(id: string) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const subjectsCollection = db.collection("subjects");

        let filter: any = { _id: id };
        if (ObjectId.isValid(id)) {
            filter = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
        }

        await subjectsCollection.deleteOne(filter);

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error deleting subject:", error);
        return { success: false, error: (error as Error).message };
    }
}
