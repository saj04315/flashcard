import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error("Error: MONGODB_URI is not defined in .env.local");
    process.exit(1);
}

const client = new MongoClient(uri);

async function seed() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db();

        // 1. Users
        const users = db.collection("users");
        await users.deleteMany({});
        const userData = Array.from({ length: 10 }).map((_, i) => ({
            _id: `user_${789 + i}` as any,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            password: "hashed_password_here",
            role: i === 0 ? "admin" : "student",
            status: "approved"
        }));
        await users.insertMany(userData);
        console.log("Seeded 10 users");

        // 2. Subjects
        const subjects = db.collection("subjects");
        await subjects.deleteMany({});
        const subjectNames = [
            "Computer Science", "Mathematics", "Physics", "Chemistry", "Biology",
            "History", "Geography", "Literature", "Art", "Economics"
        ];
        const subjectData = subjectNames.map((name, i) => ({
            _id: `subj_${(i + 1).toString().padStart(3, '0')}` as any,
            creator_id: "user_789",
            name: name,
            grade: i < 5 ? "Undergraduate" : "High School",
            color: ["#4A90E2", "#F5A623", "#7ED321", "#D0021B", "#9013FE", "#50E3C2", "#B8E986", "#F8E71C", "#417505", "#BD10E0"][i],
            icon: `${name.toLowerCase().replace(" ", "_")}_icon_url`
        }));
        await subjects.insertMany(subjectData);
        console.log("Seeded 10 subjects");

        // 3. Units
        const units = db.collection("units");
        await units.deleteMany({});
        const unitData = Array.from({ length: 10 }).map((_, i) => ({
            _id: `unit_${555 + i}` as any,
            subject_id: `subj_${(Math.floor(i / 1) + 1).toString().padStart(3, '0')}`, // 1 unit per subject for simplicity
            title: `Unit ${i + 1}: Foundations of ${subjectNames[i]}`,
            order: 1
        }));
        await units.insertMany(unitData);
        console.log("Seeded 10 units");

        // 4. Flashcards
        const flashcards = db.collection("flashcards");
        await flashcards.deleteMany({});
        const flashcardData = Array.from({ length: 10 }).map((_, i) => ({
            _id: `card_${999 + i}` as any,
            unit_id: `unit_${555 + i}`,
            question: `Question for ${subjectNames[i]}?`,
            answer: `Answer for ${subjectNames[i]}!`,
            question_img_url: `https://storage.googleapis.com/bucket/q${i + 1}.png`,
            answer_img_url: `https://storage.googleapis.com/bucket/a${i + 1}.png`
        }));
        await flashcards.insertMany(flashcardData);
        console.log("Seeded 10 flashcards");

        console.log("Database seeded with 10 records per collection successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        await client.close();
    }
}

seed();
