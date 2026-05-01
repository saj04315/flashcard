"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import itemsData from "./item.json";
import Toast from "../components/Toast";
import "./FarmPage.css";

import {
    getGameData,
    buyFarmItem,
    saveInventory,
    savePlacedItems,
    type PlacedItem,
} from "../actions/gameActions";

// ── Types ──────────────────────────────────────────────────────────────────────
interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    size: { width: number; height: number };
}

// Inventory item with a runtime instance ID so the same item can be bought multiple times
interface InventoryEntry {
    instanceId: string;  // unique per slot (e.g. "inv-1713456789")
    itemId: string;      // matches ShopItem.id  →  lookup in item.json
}

// ── Constants ──────────────────────────────────────────────────────────────────
const shopItems = itemsData as ShopItem[];
const GRID_SIZE = 25;
const INVENTORY_SLOTS = 7;

/** Resolve full item data from item.json by ID */
function resolveItem(itemId: string): ShopItem | undefined {
    return shopItems.find(i => i.id === itemId);
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function FarmPage() {
    const [activeTab, setActiveTab] = useState<"shop" | "my-item">("shop");
    const [userCoins, setUserCoins] = useState(0);
    const [inventory, setInventory] = useState<InventoryEntry[]>([]);
    const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
    const [selectedPlacedId, setSelectedPlacedId] = useState<string | null>(null);
    const [draggedItem, setDraggedItem] = useState<{
        instanceId: string;
        itemId: string;
        size: { width: number; height: number };
        fromPlaced: boolean;
    } | null>(null);
    const [unlockedIndices, setUnlockedIndices] = useState<Set<number>>(new Set());
    const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [inventoryFull, setInventoryFull] = useState(false);

    // ── Load from MongoDB on mount ──────────────────────────────────────────────
    useEffect(() => {
        getGameData().then((data) => {
            if (!data) return;
            setUserCoins(data.coins);

            // Restore inventory: convert string[] → InventoryEntry[]
            const restoredInventory: InventoryEntry[] = (data.inventory || []).map((itemId, i) => ({
                instanceId: `inv-restored-${i}-${itemId}`,
                itemId,
            }));
            setInventory(restoredInventory);

            // Restore placed items (already in { instanceId, itemId, x, y } shape)
            setPlacedItems(data.placedItems || []);

            // Derive unlocked item indices from unitToItemIndex
            const indices = new Set(Object.values(data.unitToItemIndex) as number[]);
            setUnlockedIndices(indices);
        });
    }, []);

    // ── Persist helpers (debounced saves) ──────────────────────────────────────
    const persistInventory = useCallback((inv: InventoryEntry[]) => {
        saveInventory(inv.map(e => e.itemId));
    }, []);

    const persistPlacedItems = useCallback((items: PlacedItem[]) => {
        savePlacedItems(items);
    }, []);

    // ── Placement helpers ──────────────────────────────────────────────────────
    const canPlaceItem = (x: number, y: number, w: number, h: number, excludeId?: string): boolean => {
        if (x + w > GRID_SIZE || y + h > GRID_SIZE) return false;

        for (const placed of placedItems) {
            if (placed.instanceId === excludeId) continue;
            const item = resolveItem(placed.itemId);
            if (!item) continue;
            if (
                x < placed.x + item.size.width &&
                x + w > placed.x &&
                y < placed.y + item.size.height &&
                y + h > placed.y
            ) return false;
        }
        return true;
    };

    const getPlacedItemAt = (gx: number, gy: number): PlacedItem | null => {
        for (const placed of placedItems) {
            const item = resolveItem(placed.itemId);
            if (!item) continue;
            if (gx >= placed.x && gx < placed.x + item.size.width &&
                gy >= placed.y && gy < placed.y + item.size.height) {
                return placed;
            }
        }
        return null;
    };

    // ── Drag handlers ──────────────────────────────────────────────────────────
    const handleDragStartInventory = (entry: InventoryEntry, e: React.DragEvent) => {
        const item = resolveItem(entry.itemId);
        if (!item) return;
        setDraggedItem({ instanceId: entry.instanceId, itemId: entry.itemId, size: item.size, fromPlaced: false });
        e.dataTransfer.setData("text/plain", entry.instanceId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragStartPlaced = (placed: PlacedItem, e: React.DragEvent) => {
        const item = resolveItem(placed.itemId);
        if (!item) return;
        setDraggedItem({ instanceId: placed.instanceId, itemId: placed.itemId, size: item.size, fromPlaced: true });
        e.dataTransfer.setData("text/plain", placed.instanceId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDropOnCell = (cellIndex: number, e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedItem) return;

        const gx = cellIndex % GRID_SIZE;
        const gy = Math.floor(cellIndex / GRID_SIZE);

        const excludeId = draggedItem.fromPlaced ? draggedItem.instanceId : undefined;
        if (!canPlaceItem(gx, gy, draggedItem.size.width, draggedItem.size.height, excludeId)) {
            setDraggedItem(null);
            return;
        }

        let newPlaced: PlacedItem[];

        if (draggedItem.fromPlaced) {
            // Move already-placed item
            newPlaced = placedItems.map(p =>
                p.instanceId === draggedItem.instanceId ? { ...p, x: gx, y: gy } : p
            );
        } else {
            // Place from inventory
            const newEntry: PlacedItem = {
                instanceId: draggedItem.instanceId,
                itemId: draggedItem.itemId,
                x: gx,
                y: gy,
            };
            const newInv = inventory.filter(e => e.instanceId !== draggedItem.instanceId);
            setInventory(newInv);
            persistInventory(newInv);
            newPlaced = [...placedItems, newEntry];
        }

        setPlacedItems(newPlaced);
        persistPlacedItems(newPlaced);
        setSelectedPlacedId(null);
        setDraggedItem(null);
    };

    // ── Grid cell click ─────────────────────────────────────────────────────────
    const handleGridCellClick = (cellIndex: number) => {
        const gx = cellIndex % GRID_SIZE;
        const gy = Math.floor(cellIndex / GRID_SIZE);
        const found = getPlacedItemAt(gx, gy);
        setSelectedPlacedId(found ? found.instanceId : null);
    };

    // ── Placed item controls ────────────────────────────────────────────────────
    const handleMoveToInventory = () => {
        if (!selectedPlacedId) return;
        if (inventory.length >= INVENTORY_SLOTS) {
            setInventoryFull(true);
            setTimeout(() => setInventoryFull(false), 3000);
            return;
        }
        const placed = placedItems.find(p => p.instanceId === selectedPlacedId);
        if (!placed) return;

        const newInv = [...inventory, { instanceId: placed.instanceId, itemId: placed.itemId }];
        const newPlaced = placedItems.filter(p => p.instanceId !== selectedPlacedId);

        setInventory(newInv);
        setPlacedItems(newPlaced);
        persistInventory(newInv);
        persistPlacedItems(newPlaced);
        setSelectedPlacedId(null);
    };

    const handleRemovePlacedItem = () => {
        if (!selectedPlacedId) return;
        const newPlaced = placedItems.filter(p => p.instanceId !== selectedPlacedId);
        setPlacedItems(newPlaced);
        persistPlacedItems(newPlaced);
        setSelectedPlacedId(null);
    };

    const handleDeleteInventoryItem = (instanceId: string) => {
        const newInv = inventory.filter(e => e.instanceId !== instanceId);
        setInventory(newInv);
        persistInventory(newInv);
    };

    // ── Shop buy ────────────────────────────────────────────────────────────────
    const handleBuyItem = async (shopItem: ShopItem) => {
        if (inventory.length >= INVENTORY_SLOTS) {
            setToastMessage({ message: '❌ Inventory is full!', type: 'error' });
            return;
        }
        const { success, newCoins } = await buyFarmItem(shopItem.price);
        if (!success) {
            setToastMessage({ message: '❌ Not enough coins!', type: 'error' });
            return;
        }
        const newEntry: InventoryEntry = {
            instanceId: `inv-${Date.now()}`,
            itemId: shopItem.id,
        };
        const newInv = [...inventory, newEntry];
        setUserCoins(newCoins);
        setInventory(newInv);
        persistInventory(newInv);
        setToastMessage({ message: `✅ Successfully bought ${shopItem.name}!`, type: 'success' });
    };

    const isItemUnlocked = (itemIndex: number) => unlockedIndices.has(itemIndex);

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="FarmPage">
            <div className="FarmPage__header">
                <div className="FarmPage__coin-display">
                    <Image src="/farm/coin.png" alt="Coins" width={32} height={32} />
                    <span>{userCoins}</span>
                </div>
            </div>

            <div className="FarmPage__wrapper">
                {/* ── Left: Farm Grid ─────────────────────────────────────────── */}
                <section className="FarmPage__left">
                    <div className="FarmPage__farm-area">
                        <div className="FarmPage__grid" onDragOver={handleDragOver}>
                            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                                const gx = index % GRID_SIZE;
                                const gy = Math.floor(index / GRID_SIZE);
                                const placed = getPlacedItemAt(gx, gy);
                                const isSelected = placed?.instanceId === selectedPlacedId;

                                return (
                                    <div
                                        key={index}
                                        className={`FarmPage__grid-cell ${isSelected ? "selected" : ""}`}
                                        onClick={() => handleGridCellClick(index)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDropOnCell(index, e)}
                                    />
                                );
                            })}
                        </div>

                        {/* Placed items overlay */}
                        <div className="FarmPage__placed-items-overlay">
                            {placedItems.map((placed) => {
                                const item = resolveItem(placed.itemId);
                                if (!item) return null;
                                const isSelected = placed.instanceId === selectedPlacedId;

                                return (
                                    <div
                                        key={placed.instanceId}
                                        className={`FarmPage__placed-item ${isSelected ? "selected" : ""}`}
                                        draggable
                                        onDragStart={(e) => handleDragStartPlaced(placed, e)}
                                        onClick={() => setSelectedPlacedId(placed.instanceId)}
                                        style={{
                                            left: `${(placed.x / GRID_SIZE) * 100}%`,
                                            top: `${(placed.y / GRID_SIZE) * 100}%`,
                                            width: `${(item.size.width / GRID_SIZE) * 100}%`,
                                            height: `${(item.size.height / GRID_SIZE) * 100}%`,
                                        }}
                                    >
                                        <Image src={item.image} alt={item.name} fill />
                                    </div>
                                );
                            })}
                        </div>

                        <div className="FarmPage__farm-image">
                            <Image src="/farm/ground.png" alt="Farm" fill />
                        </div>
                    </div>

                    {selectedPlacedId && (
                        <div className="FarmPage__remove-controls">
                            <button className="FarmPage__move-btn" onClick={handleMoveToInventory}>
                                Move to Inventory
                            </button>
                            <button className="FarmPage__remove-btn" onClick={handleRemovePlacedItem}>
                                Delete
                            </button>
                        </div>
                    )}

                    {inventoryFull && (
                        <div className="FarmPage__message FarmPage__message--error">
                            My items is full!!
                        </div>
                    )}
                </section>

                {/* ── Right: Shop / My Items ──────────────────────────────────── */}
                <aside className="FarmPage__right">
                    <div className="FarmPage__tabs">
                        <button
                            className={activeTab === "shop" ? "active" : ""}
                            onClick={() => setActiveTab("shop")}
                        >
                            Farm Shop
                        </button>
                        <button
                            className={activeTab === "my-item" ? "active" : ""}
                            onClick={() => setActiveTab("my-item")}
                        >
                            My Item
                        </button>
                    </div>

                    <div className="FarmPage__tab-panel">
                        {activeTab === "shop" ? (
                            shopItems.map((item, itemIndex) => {
                                const isUnlocked = isItemUnlocked(itemIndex);
                                return (
                                    <div key={itemIndex} className={`FarmPage__card ${!isUnlocked ? 'FarmPage__card--locked' : ''}`}>
                                        <div className="FarmPage__card-image" style={{ position: 'relative' }}>
                                            <Image src={item.image} alt={item.name} width={72} height={72} />
                                            {!isUnlocked && (
                                                <div style={{
                                                    position: 'absolute', inset: 0, display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '8px', fontSize: '32px',
                                                }}>🔒</div>
                                            )}
                                        </div>
                                        <div className="FarmPage__card-body">
                                            <h3>{item.name}</h3>
                                            <p>{item.description}</p>
                                            <div className="FarmPage__card-footer">
                                                <span className="FarmPage__price">
                                                    {item.price === 0 ? (
                                                        "Free"
                                                    ) : (
                                                        <>
                                                            <Image src="/farm/coin.png" alt="Coin" width={18} height={18} />
                                                            {item.price}
                                                        </>
                                                    )}
                                                </span>
                                                <button
                                                    className="FarmPage__action-btn"
                                                    disabled={!isUnlocked || inventory.length >= INVENTORY_SLOTS}
                                                    style={!isUnlocked ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                                    onClick={() => isUnlocked && handleBuyItem(item)}
                                                >
                                                    {isUnlocked ? 'Buy' : 'Locked'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="FarmPage__inventory">
                                {Array.from({ length: INVENTORY_SLOTS }).map((_, index) => {
                                    const entry = inventory[index];
                                    const item = entry ? resolveItem(entry.itemId) : null;
                                    return (
                                        <div key={index} className="FarmPage__inventory-slot">
                                            {item && entry ? (
                                                <>
                                                    <div
                                                        className="FarmPage__slot-image"
                                                        draggable
                                                        onDragStart={(e) => handleDragStartInventory(entry, e)}
                                                    >
                                                        <Image src={item.image} alt={item.name} width={60} height={60} />
                                                    </div>
                                                    <div className="FarmPage__slot-info">
                                                        <h4>{item.name}</h4>
                                                        <p>{item.description}</p>
                                                        
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="FarmPage__empty-slot">
                                                    <span>Empty</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {toastMessage && (
                <Toast
                    message={toastMessage.message}
                    type={toastMessage.type}
                    onClose={() => setToastMessage(null)}
                />
            )}
        </div>
    );
}