"use server";

import { createClerkClient } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

export interface Student {
    id: string;
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    initials: string;
    grade?: string;
    createdAt: Date;
}

export async function syncUsers() {
    try {
        const mongoClient = await clientPromise;
        const db = mongoClient.db();
        const usersCollection = db.collection("users");

        // Fetch all users from Clerk
        const clerkUsers = await clerkClient.users.getUserList();

        // Fetch all users from MongoDB
        const mongoUsers = await usersCollection.find({}).toArray();
        const mongoUserEmails = new Set(mongoUsers.map(u => u.email));

        const newUsers = [];

        for (const user of clerkUsers.data) {
            const email = user.emailAddresses[0]?.emailAddress;
            if (email && !mongoUserEmails.has(email)) {
                newUsers.push({
                    clerkId: user.id,
                    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
                    email: email,
                    role: "student", // Default role
                    status: "pending", // Default status as requested
                    createdAt: new Date(),
                    initials: (user.firstName?.[0] || "") + (user.lastName?.[0] || ""),
                });
            }
        }

        if (newUsers.length > 0) {
            await usersCollection.insertMany(newUsers);
        }

        return { success: true, count: newUsers.length };
    } catch (error) {
        console.error("Sync error:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function getStudents(search: string = ""): Promise<Student[]> {
    try {
        const mongoClient = await clientPromise;
        const db = mongoClient.db();
        const usersCollection = db.collection("users");

        let query = { role: "student" } as any;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        const students = await usersCollection.find(query).sort({ createdAt: -1 }).toArray();

        return students.map(s => ({
            ...s,
            id: s._id.toString(),
            _id: s._id.toString(),
        })) as unknown as Student[];
    } catch (error) {
        console.error("Fetch error:", error);
        return [];
    }
}

export async function approveStudent(studentId: string) {
    try {
        const mongoClient = await clientPromise;
        const db = mongoClient.db();
        const usersCollection = db.collection("users");

        let filter: any = { _id: studentId };
        if (ObjectId.isValid(studentId)) {
            filter = { $or: [{ _id: new ObjectId(studentId) }, { _id: studentId }] };
        }

        await usersCollection.updateOne(
            filter,
            { $set: { status: "Active" } }
        );

        return { success: true };
    } catch (error) {
        console.error("Approve error:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteStudent(studentId: string) {
    try {
        const mongoClient = await clientPromise;
        const db = mongoClient.db();
        const usersCollection = db.collection("users");

        let filter: any = { _id: studentId };
        if (ObjectId.isValid(studentId)) {
            filter = { $or: [{ _id: new ObjectId(studentId) }, { _id: studentId }] };
        }

        await usersCollection.deleteOne(filter);

        return { success: true };
    } catch (error) {
        console.error("Delete error:", error);
        return { success: false, error: (error as Error).message };
    }
}
