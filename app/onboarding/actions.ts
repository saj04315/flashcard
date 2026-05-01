"use server";

import clientPromise from "@/lib/mongodb";
import { currentUser } from "@clerk/nextjs/server";
import { assignStudentToTeacher } from "../admin/actions/teacherAction";
import { redirect } from "next/navigation";

export async function selectTeacherAction(formData: FormData) {
    const teacherId = formData.get("teacherId") as string;
    
    if (!teacherId) {
        return { error: "Teacher is required" };
    }

    const user = await currentUser();
    if (!user) {
        return { error: "Not logged in" };
    }
    
    const mongoClient = await clientPromise;
    const db = mongoClient.db();
    const usersCollection = db.collection("users");

    // The user should already be synced from layout.tsx
    // Let's update their teacher field
    await usersCollection.updateOne(
        { clerkId: user.id },
        { $set: { teacher: teacherId } }
    );

    const mongoUser = await usersCollection.findOne({ clerkId: user.id });
    if (mongoUser) {
        await assignStudentToTeacher(mongoUser._id.toString(), teacherId);
    }
    
    redirect("/login");
}
