"use server";

import { currentUser } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";

export async function checkUserStatus() {
    try {
        const user = await currentUser();
        if (!user) return { authenticated: false };

        const email = user.emailAddresses[0]?.emailAddress;
        if (!email) return { authenticated: false };

        const mongoClient = await clientPromise;
        const db = mongoClient.db();
        const usersCollection = db.collection("users");

        let mongoUser = await usersCollection.findOne({ email: email });

        // If user doesn't exist in MongoDB, sync them
        if (!mongoUser) {
            const newUser = {
                clerkId: user.id,
                name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
                email: email,
                role: "student",
                status: "pending",
                createdAt: new Date(),
                initials: (user.firstName?.[0] || "") + (user.lastName?.[0] || ""),
            };
            await usersCollection.insertOne(newUser);
            return { authenticated: true, status: "pending", user: newUser };
        }

        return {
            authenticated: true,
            status: mongoUser.status,
            role: mongoUser.role,
            user: {
                id: mongoUser._id.toString(),
                name: mongoUser.name,
                email: mongoUser.email,
                status: mongoUser.status,
                role: mongoUser.role
            }
        };
    } catch (error) {
        console.error("Error checking user status:", error);
        return { authenticated: false, error: "Internal Server Error" };
    }
}
