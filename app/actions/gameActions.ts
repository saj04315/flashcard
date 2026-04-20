"use server";

import { currentUser } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

/** A placed farm item — item details are looked up from item.json at runtime. */
export interface PlacedItem {
    instanceId: string;     // unique placement ID (e.g. "placed-1713456789")
    itemId: string;         // matches `id` field in item.json
    x: number;
    y: number;
}

export interface GameData {
    coins: number;
    completedUnits: string[];
    unitLastCompleted: Record<string, number>;
    cardsViewedPerUnit: Record<string, number>;
    unitToItemIndex: Record<string, number>;
    inventory: string[];    // array of item IDs from item.json  e.g. ["tractor", "bench"]
    placedItems: PlacedItem[];
}

const DEFAULT_GAME_DATA: GameData = {
    coins: 0,
    completedUnits: [],
    unitLastCompleted: {},
    cardsViewedPerUnit: {},
    unitToItemIndex: {},
    inventory: [],
    placedItems: [],
};

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
async function getUserEmail(): Promise<string | null> {
    const user = await currentUser();
    if (!user) return null;
    return user.emailAddresses[0]?.emailAddress ?? null;
}

async function getCollection() {
    const client = await clientPromise;
    return client.db().collection("users");
}

// ──────────────────────────────────────────────
// Public Actions
// ──────────────────────────────────────────────

/**
 * Fetch the current user's gameData document.
 */
export async function getGameData(): Promise<GameData | null> {
    const email = await getUserEmail();
    if (!email) return null;

    const col = await getCollection();
    const doc = await col.findOne({ email }, { projection: { gameData: 1 } });
    if (!doc) return null;

    // Merge with defaults to handle missing fields on old documents
    return { ...DEFAULT_GAME_DATA, ...(doc.gameData || {}) };
}

/**
 * Record that a card answer was viewed.
 * - Awards 1 coin (first-time unit only).
 * - Unlocks a farm item when 5 cards viewed in a unit (first-time only).
 */
export async function markCardViewed(
    unitId: string,
    isFirstTimeUnit: boolean
): Promise<{ updatedData: GameData | null; itemUnlocked: boolean }> {
    const email = await getUserEmail();
    if (!email || !unitId) return { updatedData: null, itemUnlocked: false };

    const col = await getCollection();

    const doc = await col.findOne({ email }, { projection: { gameData: 1 } });
    const gameData: GameData = { ...DEFAULT_GAME_DATA, ...(doc?.gameData || {}) };

    if (!isFirstTimeUnit) {
        return { updatedData: gameData, itemUnlocked: false };
    }

    const currentCount = (gameData.cardsViewedPerUnit[unitId] || 0) + 1;
    const newCoins = gameData.coins + 1;
    let itemUnlocked = false;

    const update: Record<string, any> = {
        $set: {
            "gameData.coins": newCoins,
            [`gameData.cardsViewedPerUnit.${unitId}`]: currentCount,
        },
    };

    // Unlock item at 5 cards viewed (if not already unlocked for this unit)
    if (currentCount === 5 && !Object.prototype.hasOwnProperty.call(gameData.unitToItemIndex, unitId)) {
        const usedIndices = new Set(Object.values(gameData.unitToItemIndex));
        let nextIndex = 0;
        for (let i = 0; i < 19; i++) {
            if (!usedIndices.has(i)) { nextIndex = i; break; }
        }
        if (usedIndices.size < 19) {
            update.$set[`gameData.unitToItemIndex.${unitId}`] = nextIndex;
            itemUnlocked = true;
        }
    }

    await col.updateOne({ email }, update, { upsert: true });

    const updatedDoc = await col.findOne({ email }, { projection: { gameData: 1 } });
    const updatedData: GameData = { ...DEFAULT_GAME_DATA, ...(updatedDoc?.gameData || {}) };

    return { updatedData, itemUnlocked };
}

/**
 * Mark a unit as completed and record completion timestamp (first time only).
 */
export async function markUnitCompleted(unitId: string): Promise<void> {
    const email = await getUserEmail();
    if (!email || !unitId) return;

    const col = await getCollection();
    const doc = await col.findOne({ email }, { projection: { "gameData.completedUnits": 1 } });
    const completed: string[] = doc?.gameData?.completedUnits ?? [];
    const isFirstCompletion = !completed.includes(unitId);

    const update: Record<string, any> = {
        $addToSet: { "gameData.completedUnits": unitId },
    };
    if (isFirstCompletion) {
        update.$set = { [`gameData.unitLastCompleted.${unitId}`]: Date.now() };
    }

    await col.updateOne({ email }, update, { upsert: true });
}

/**
 * Award 20 revision coins (called when revisiting a unit after 12 h).
 * Updates the last completion timestamp.
 */
export async function awardRevisionCoins(unitId: string): Promise<void> {
    const email = await getUserEmail();
    if (!email || !unitId) return;

    const col = await getCollection();
    const doc = await col.findOne({ email }, { projection: { "gameData.coins": 1 } });
    const currentCoins: number = doc?.gameData?.coins ?? 0;

    await col.updateOne(
        { email },
        {
            $set: {
                "gameData.coins": currentCoins + 20,
                [`gameData.unitLastCompleted.${unitId}`]: Date.now(),
            },
        },
        { upsert: true }
    );
}

/**
 * Deduct coins for a shop purchase.
 * Returns { success, newCoins }.
 */
export async function buyFarmItem(price: number): Promise<{ success: boolean; newCoins: number }> {
    const email = await getUserEmail();
    if (!email) return { success: false, newCoins: 0 };

    const col = await getCollection();
    const doc = await col.findOne({ email }, { projection: { "gameData.coins": 1 } });
    const currentCoins: number = doc?.gameData?.coins ?? 0;

    if (currentCoins < price) return { success: false, newCoins: currentCoins };

    const newCoins = currentCoins - price;
    await col.updateOne(
        { email },
        { $set: { "gameData.coins": newCoins } },
        { upsert: true }
    );

    return { success: true, newCoins };
}

/**
 * Persist the inventory as an array of item ID strings.
 * Full item details are resolved from item.json on the client — nothing duplicated.
 */
export async function saveInventory(itemIds: string[]): Promise<void> {
    const email = await getUserEmail();
    if (!email) return;

    const col = await getCollection();
    await col.updateOne(
        { email },
        { $set: { "gameData.inventory": itemIds } },
        { upsert: true }
    );
}

/**
 * Persist the placed items array.
 * Each entry is { instanceId, itemId, x, y } — size/image resolved from item.json on the client.
 */
export async function savePlacedItems(placedItems: PlacedItem[]): Promise<void> {
    const email = await getUserEmail();
    if (!email) return;

    const col = await getCollection();
    await col.updateOne(
        { email },
        { $set: { "gameData.placedItems": placedItems } },
        { upsert: true }
    );
}
