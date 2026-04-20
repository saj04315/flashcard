"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import itemsData from "./item.json";
import Toast from "../components/Toast";
import "./FarmPage.css";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  size: { width: number; height: number };
  unlockedBy?: { unitId: string; cardsViewed: number };
}

const shopItems = itemsData as ShopItem[];
const myItems = itemsData.slice(0, 2) as ShopItem[];

interface PlacedItem {
  id: string;
  itemId: string;
  position: { x: number; y: number };
}

const GRID_SIZE = 25;

export default function FarmPage() {
  const [activeTab, setActiveTab] = useState<"shop" | "my-item">("shop");
  const [userCoins, setUserCoins] = useState(0);
  const [inventory, setInventory] = useState<ShopItem[]>([]);
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [selectedPlacedItem, setSelectedPlacedItem] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ itemId: string; size: { width: number; height: number }; fromPlaced?: boolean; placedId?: string } | null>(null);
  const [inventoryFullMessage, setInventoryFullMessage] = useState(false);
  const [unlockedItems, setUnlockedItems] = useState<Set<number>>(() => {
    if (typeof window !== "undefined") {
      const unitToItemIndex = JSON.parse(localStorage.getItem("unitToItemIndex") || "{}");
      return new Set(Object.values(unitToItemIndex) as number[]);
    }
    return new Set();
  });
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const inventorySlots = 7;

  // Check if position is available for item placement
  const canPlaceItem = (x: number, y: number, itemWidth: number, itemHeight: number): boolean => {
    if (x + itemWidth > GRID_SIZE || y + itemHeight > GRID_SIZE) {
      return false;
    }

    for (const placed of placedItems) {
      const item = myItems.find(i => i.id === placed.itemId);
      if (!item) continue;

      const placedX = placed.position.x;
      const placedY = placed.position.y;
      const placedWidth = item.size.width;
      const placedHeight = item.size.height;

      // Check collision
      if (
        x < placedX + placedWidth &&
        x + itemWidth > placedX &&
        y < placedY + placedHeight &&
        y + itemHeight > placedY
      ) {
        return false;
      }
    }

    return true;
  };

  // Handle drag start from inventory
  const handleDragStart = (itemId: string, e: React.DragEvent) => {
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      setDraggedItem({ itemId, size: item.size, fromPlaced: false });
      e.dataTransfer.setData("text/plain", itemId);
      e.dataTransfer.effectAllowed = "move";
    }
  };

  // Handle drag start from placed item
  const handleDragStartPlaced = (placedId: string, e: React.DragEvent) => {
    const placed = placedItems.find(p => p.id === placedId);
    const item = placed ? myItems.find(i => i.id === placed.itemId) : null;
    if (item && placed) {
      setDraggedItem({ itemId: placed.itemId, size: item.size, fromPlaced: true, placedId });
      e.dataTransfer.setData("text/plain", placedId);
      e.dataTransfer.effectAllowed = "move";
    }
  };

  // Handle drag over grid
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Handle drop on grid cell
  const handleDropOnCell = (cellIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedItem) return;

    const gridX = cellIndex % GRID_SIZE;
    const gridY = Math.floor(cellIndex / GRID_SIZE);

    if (canPlaceItem(gridX, gridY, draggedItem.size.width, draggedItem.size.height)) {
      // If dragging from placed items, remove old placement first
      if (draggedItem.fromPlaced && draggedItem.placedId) {
        setPlacedItems(placedItems.filter(item => item.id !== draggedItem.placedId));
      } else {
        // If dragging from inventory, remove item from inventory
        setInventory(inventory.filter(item => item.id !== draggedItem.itemId));
      }

      // Add new placement
      const newPlacedItem: PlacedItem = {
        id: `placed-${Date.now()}`,
        itemId: draggedItem.itemId,
        position: { x: gridX, y: gridY },
      };
      setPlacedItems([...placedItems.filter(item => item.id !== draggedItem.placedId), newPlacedItem]);
      setSelectedPlacedItem(null);
    }

    setDraggedItem(null);
  };

  // Handle grid cell click to select item
  const handleGridCellClick = (cellIndex: number) => {
    const gridX = cellIndex % GRID_SIZE;
    const gridY = Math.floor(cellIndex / GRID_SIZE);

    for (const placed of placedItems) {
      const item = myItems.find(i => i.id === placed.itemId);
      if (!item) continue;

      if (
        gridX >= placed.position.x &&
        gridX < placed.position.x + item.size.width &&
        gridY >= placed.position.y &&
        gridY < placed.position.y + item.size.height
      ) {
        setSelectedPlacedItem(placed.id);
        return;
      }
    }
    setSelectedPlacedItem(null);
  };

  // Handle remove placed item (long press or click on selected)
  const handleRemovePlacedItem = () => {
    if (selectedPlacedItem) {
      setPlacedItems(placedItems.filter(item => item.id !== selectedPlacedItem));
      setSelectedPlacedItem(null);
    }
  };

  // Handle moving placed item back to inventory
  const handleMoveToInventory = () => {
    if (!selectedPlacedItem) return;

    const placed = placedItems.find(p => p.id === selectedPlacedItem);
    if (!placed) return;

    // Check if inventory is full
    if (inventory.length >= inventorySlots) {
      setInventoryFullMessage(true);
      setTimeout(() => setInventoryFullMessage(false), 3000);
      return;
    }

    // Find the item data
    const item = myItems.find(i => i.id === placed.itemId);
    if (!item) return;

    // Add back to inventory
    setInventory([...inventory, { ...item, id: `inv-${Date.now()}` }]);

    // Remove from placed items
    setPlacedItems(placedItems.filter(p => p.id !== selectedPlacedItem));
    setSelectedPlacedItem(null);
  };

  // Handle buy button
  const handleBuyItem = (item: typeof shopItems[0], itemIndex: number) => {
    // Add item to inventory (cost was already deducted in UI logic)
    if (inventory.length < inventorySlots) {
      setInventory([...inventory, { ...item, id: `inv-${Date.now()}` }]);
    } else {
      setInventoryFullMessage(true);
      setTimeout(() => setInventoryFullMessage(false), 3000);
    }
  };

  // Handle delete inventory item
  const handleDeleteInventoryItem = (itemId: string) => {
    setInventory(inventory.filter(item => item.id !== itemId));
  };

  // Get item at specific placed position
  const getPlacedItemAtGrid = (x: number, y: number): PlacedItem | null => {
    for (const placed of placedItems) {
      const item = myItems.find(i => i.id === placed.itemId);
      if (!item) continue;

      if (
        x >= placed.position.x &&
        x < placed.position.x + item.size.width &&
        y >= placed.position.y &&
        y < placed.position.y + item.size.height
      ) {
        return placed;
      }
    }
    return null;
  };

  const isCellOccupied = (index: number): boolean => {
    const gridX = index % GRID_SIZE;
    const gridY = Math.floor(index / GRID_SIZE);
    return getPlacedItemAtGrid(gridX, gridY) !== null;
  };

  // Update localStorage when coins change
  const updateCoins = (newCoins: number) => {
    setUserCoins(newCoins);
    if (typeof window !== "undefined") {
      localStorage.setItem("farmCoins", newCoins.toString());
    }
  };

  // Update localStorage when unlocked items change
  const updateUnlockedItems = (newUnlocked: Set<number>) => {
    setUnlockedItems(newUnlocked);
    if (typeof window !== "undefined") {
      localStorage.setItem("unlockedFarmItems", JSON.stringify(Array.from(newUnlocked)));
    }
  };

  // Sync localStorage updates (when coming back from study)
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== "undefined") {
        const savedCoins = parseInt(localStorage.getItem("farmCoins") || "0");
        setUserCoins(savedCoins);

        const unitToItemIndex = JSON.parse(localStorage.getItem("unitToItemIndex") || "{}");
        const newUnlockedSet = new Set(Object.values(unitToItemIndex) as number[]);
        setUnlockedItems(newUnlockedSet);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const isItemUnlocked = (itemIndex: number): boolean => {
    return unlockedItems.has(itemIndex);
  };

  return (
    <div className="FarmPage">
      <div className="FarmPage__header">
        <div className="FarmPage__coin-display">
          <Image src="/farm/coin.png" alt="Coins" width={32} height={32} />
          <span>{userCoins}</span>
        </div>
      </div>

      <div className="FarmPage__wrapper">
        <section className="FarmPage__left">
          <div className="FarmPage__farm-area">
            <div
              className="FarmPage__grid"
              onDragOver={handleDragOver}
            >
              {Array.from({ length: 25 * 25 }).map((_, index) => {
                const gridX = index % GRID_SIZE;
                const gridY = Math.floor(index / GRID_SIZE);
                const placedItem = getPlacedItemAtGrid(gridX, gridY);
                const isSelected = placedItem?.id === selectedPlacedItem;

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
                const item = myItems.find(i => i.id === placed.itemId);
                const isSelected = placed.id === selectedPlacedItem;
                if (!item) return null;

                return (
                  <div
                    key={placed.id}
                    className={`FarmPage__placed-item ${isSelected ? "selected" : ""}`}
                    draggable
                    onDragStart={(e) => handleDragStartPlaced(placed.id, e)}
                    onClick={() => setSelectedPlacedItem(placed.id)}
                    style={{
                      left: `${(placed.position.x / GRID_SIZE) * 100}%`,
                      top: `${(placed.position.y / GRID_SIZE) * 100}%`,
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
              <Image src="/farm/farm.png" alt="Farm" fill />
            </div>
          </div>

          {selectedPlacedItem && (
            <div className="FarmPage__remove-controls">
              <button className="FarmPage__move-btn" onClick={handleMoveToInventory}>
                Move to Inventory
              </button>
              <button className="FarmPage__remove-btn" onClick={handleRemovePlacedItem}>
                Delete
              </button>
            </div>
          )}

          {inventoryFullMessage && (
            <div className="FarmPage__message FarmPage__message--error">
              My items is full!!
            </div>
          )}
        </section>

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
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          borderRadius: '8px',
                          fontSize: '32px'
                        }}>
                          🔒
                        </div>
                      )}
                    </div>
                    <div className="FarmPage__card-body">
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <div className="FarmPage__card-footer">
                        {isUnlocked ? (
                          <>
                            <span className="FarmPage__price">
                              <Image src="/farm/coin.png" alt="Coin" width={18} height={18} />
                              {item.price}
                            </span>
                            <button 
                              className="FarmPage__action-btn"
                              onClick={() => {
                                if (userCoins >= item.price) {
                                  if (inventory.length < inventorySlots) {
                                    updateCoins(userCoins - item.price);
                                    handleBuyItem(item, itemIndex);
                                    setToastMessage({ message: `✅ Successfully bought ${item.name}!`, type: 'success' });
                                  } else {
                                    setToastMessage({ message: '❌ Inventory is full!', type: 'error' });
                                  }
                                } else {
                                  setToastMessage({ message: '❌ Not enough coins!', type: 'error' });
                                }
                              }}
                              disabled={inventory.length >= inventorySlots}
                            >
                              Buy
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="FarmPage__price">
                              <Image src="/farm/coin.png" alt="Coin" width={18} height={18} />
                              {item.price}
                            </span>
                            <button 
                              className="FarmPage__action-btn"
                              disabled
                              style={{ opacity: 0.5, cursor: 'not-allowed' }}
                            >
                              Locked
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="FarmPage__inventory">
                {Array.from({ length: inventorySlots }).map((_, index) => {
                  const item = inventory[index];
                  return (
                    <div key={index} className="FarmPage__inventory-slot">
                      {item ? (
                        <>
                          <div 
                            className="FarmPage__slot-image"
                            draggable
                            onDragStart={(e) => handleDragStart(item.id, e)}
                          >
                            <Image src={item.image} alt={item.name} width={60} height={60} />
                          </div>
                          <div className="FarmPage__slot-info">
                            <h4>{item.name}</h4>
                            <p>{item.description}</p>
                            <div className="FarmPage__slot-actions">
                              <button 
                                className="FarmPage__delete-btn" 
                                aria-label="Delete"
                                onClick={() => handleDeleteInventoryItem(item.id)}
                              >
                                🗑️
                              </button>
                              <button className="FarmPage__place-btn" disabled>
                                Drag
                              </button>
                            </div>
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