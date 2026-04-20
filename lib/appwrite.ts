import { Client, Storage, ID } from 'appwrite';

const client = new Client();

// THESE NEED TO BE SET BY THE USER
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'flashcard';

if (APPWRITE_PROJECT_ID) {
    client
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT_ID);
}

export const storage = new Storage(client);

/**
 * Uploads a file to Appwrite storage and returns the file URL.
 * @param file The file object to upload.
 * @returns Promise<string> The public URL of the uploaded file.
 */
export async function uploadImage(file: File): Promise<string> {
    try {
        if (!APPWRITE_PROJECT_ID) {
            throw new Error("Appwrite Project ID not configured. Please add NEXT_PUBLIC_APPWRITE_PROJECT_ID to your .env.local");
        }

        const response = await storage.createFile(
            BUCKET_ID,
            ID.unique(),
            file
        );

        // Construct the view URL
        // Format: [endpoint]/storage/buckets/[bucketId]/files/[fileId]/view?project=[projectId]
        const fileUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${response.$id}/view?project=${APPWRITE_PROJECT_ID}`;

        return fileUrl;
    } catch (error) {
        console.error("Appwrite upload error:", error);
        throw error;
    }
}
