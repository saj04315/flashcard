"use server";

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface Teacher {
    id: string;
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    initials: string;
    students: string[];
    createdAt: Date;
}

export async function getTeachers(): Promise<Teacher[]> {
    try {
        const mongoClient = await clientPromise;
        const db = mongoClient.db();
        const usersCollection = db.collection("users");

        const teachers = await usersCollection.find({ role: "teacher" }).sort({ createdAt: -1 }).toArray();

        return teachers.map(t => ({
            ...t,
            id: t._id.toString(),
            _id: t._id.toString(),
            students: t.students || []
        })) as unknown as Teacher[];
    } catch (error) {
        console.error("Fetch teachers error:", error);
        return [];
    }
}

export async function assignStudentToTeacher(studentId: string, teacherId: string) {
    try {
        const mongoClient = await clientPromise;
        const db = mongoClient.db();
        const usersCollection = db.collection("users");

        // Add studentId to teacher's students array
        let filter: any = { _id: teacherId };
        if (ObjectId.isValid(teacherId)) {
            filter = { $or: [{ _id: new ObjectId(teacherId) }, { _id: teacherId }] };
        }

        await usersCollection.updateOne(
            filter,
            { $addToSet: { students: studentId } }
        );

        return { success: true };
    } catch (error) {
        console.error("Assign student error:", error);
        return { success: false, error: (error as Error).message };
    }
}
