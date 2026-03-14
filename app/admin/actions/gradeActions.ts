"use server";

import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export interface Grade {
    id: string;
    _id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
    subjectCount?: number;
    studentsCount?: number;
}

export async function getGrades(search: string = ""): Promise<Grade[]> {
    try {
        const client = await clientPromise;
        const db = client.db();
        const gradesCollection = db.collection("grades");

        const query = {} as any;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const grades = await gradesCollection.find(query).toArray();

        const subjectsCollection = db.collection("subjects");

        const enhancedGrades = await Promise.all(grades.map(async (g) => {
            const subjectCount = await subjectsCollection.countDocuments({ gradeId: g._id.toString() });
            return {
                ...g,
                id: g._id.toString(),
                _id: g._id.toString(),
                name: g.name,
                description: g.description || "",
                color: g.color,
                icon: g.icon,
                subjectCount: subjectCount,
                studentsCount: g.studentsCount || 0
            };
        }));

        return enhancedGrades as unknown as Grade[];
    } catch (error) {
        console.error("Error fetching grades:", error);
        return [];
    }
}

export async function createGrade(data: Omit<Grade, "id" | "_id">) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const gradesCollection = db.collection("grades");

        const result = await gradesCollection.insertOne({
            ...data,
            createdAt: new Date(),
        });

        revalidatePath("/admin");
        return { success: true, id: result.insertedId.toString() };
    } catch (error) {
        console.error("Error creating grade:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function updateGrade(id: string, data: Partial<Grade>) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const gradesCollection = db.collection("grades");

        let filter: any = { _id: id };
        if (ObjectId.isValid(id)) {
            filter = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
        }

        const { id: _, _id: __, ...updateData } = data as any;

        await gradesCollection.updateOne(filter, { $set: updateData });

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error updating grade:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteGrade(id: string) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const gradesCollection = db.collection("grades");

        let filter: any = { _id: id };
        if (ObjectId.isValid(id)) {
            filter = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
        }

        await gradesCollection.deleteOne(filter);

        revalidatePath("/admin");
        return { success: true };
    } catch (error) {
        console.error("Error deleting grade:", error);
        return { success: false, error: (error as Error).message };
    }
}
