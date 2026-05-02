"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";

export async function checkUserStatus() {
    try {
        const { userId } = await auth();
        if (!userId) return { authenticated: false };

        const mongoClient = await clientPromise;
        const db = mongoClient.db();
        const usersCollection = db.collection("users");

        const mongoUser = await usersCollection.findOne({ clerkId: userId });

        if (mongoUser) {
            return {
                authenticated: true,
                status: mongoUser.status,
                role: mongoUser.role,
                user: {
                    id: mongoUser._id.toString(),
                    name: mongoUser.name,
                    email: mongoUser.email,
                    status: mongoUser.status,
                    role: mongoUser.role,
                    grade: mongoUser.grade,
                    teacher: mongoUser.teacher || "admin"
                }
            };
        }

        // If user doesn't exist in MongoDB by clerkId, fetch full details from Clerk
        const user = await currentUser();
        if (!user) return { authenticated: false };

        const email = user.emailAddresses[0]?.emailAddress;
        if (!email) return { authenticated: false };

        const existingByEmail = await usersCollection.findOne({ email: email });

        if (!existingByEmail) {
            const newUser = {
                clerkId: user.id,
                name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
                email: email,
                role: "student",
                status: "pending",
                teacher: "unknown",
                createdAt: new Date(),
                initials: (user.firstName?.[0] || "") + (user.lastName?.[0] || ""),
                gameData: {
                    coins: 0,
                    completedUnits: [],
                    unitLastCompleted: {},
                    cardsViewedPerUnit: {},
                    unitToItemIndex: {},
                    inventory: [],
                    placedItems: [],
                },
            };
            await usersCollection.insertOne(newUser);
            return { authenticated: true, status: "pending", user: newUser };
        }

        // If they existed by email but not clerkId, we could update it here, but for now just return them
        return {
            authenticated: true,
            status: existingByEmail.status,
            role: existingByEmail.role,
            user: {
                id: existingByEmail._id.toString(),
                name: existingByEmail.name,
                email: existingByEmail.email,
                status: existingByEmail.status,
                role: existingByEmail.role,
                grade: existingByEmail.grade,
                teacher: existingByEmail.teacher || "admin"
            }
        };
    } catch (error: any) {
        if (error.status === 404 || error.code === 'not_found' || error.clerkError) {
            // User was likely deleted from Clerk but still has a local session cookie.
            // Fail silently so they are forced to log out/in.
            return { authenticated: false };
        }
        console.error("Error checking user status:", error);
        if (error.name === 'MongoServerSelectionError') {
            console.error("MongoDB Connection Timeout: Please check Atlas IP whitelisting.");
            return { authenticated: false, error: "Database connection timeout. Contact admin." };
        }
        return { authenticated: false, error: "Internal Server Error" };
    }
}
