"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProgressBar from "../components/ProgressBar";
import Flashcard from "../components/Flashcard";
import Button from "../components/Button";
import KeyboardGuide from "../components/KeyboardGuide";
import Toast from "../components/Toast";

import { useAppSelector } from "../store/hooks";

interface StudyInterfaceProps {
    flashcards: any[];
    subjectName: string;
    unitTitle: string;
    unitId?: string;
}

export default function StudyInterface({ flashcards, subjectName, unitTitle, unitId }: StudyInterfaceProps) {
    const globalAccentColor = useAppSelector((state) => state.theme.accentColor);
    const subjectColor = globalAccentColor || "#7ED321"; // fallback color
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [unitCompleted, setUnitCompleted] = useState(false);
    const [isUnitPreviouslyCompleted, setIsUnitPreviouslyCompleted] = useState(false);
    const completionTrackedRef = useRef(false); // Track if completion was already handled

    // Check if unit was previously completed and show toast
    React.useEffect(() => {
        if (!unitId) return;
        
        // Reset completion tracking when entering a new unit
        completionTrackedRef.current = false;
        setUnitCompleted(false);
        
        const completedUnits = JSON.parse(localStorage.getItem("completedUnits") || "[]");
        const wasPreviouslyCompleted = completedUnits.includes(unitId);
        setIsUnitPreviouslyCompleted(wasPreviouslyCompleted);
        
        // Show "You learned this unit" toast for previously completed units
        if (wasPreviouslyCompleted) {
            setToastMessage({
                message: `📚 You learned this unit! Complete it again after 12+ hours for revision coins!`,
                type: 'success'
            });
        }
    }, [unitId]);

    const totalCards = flashcards.length;

    // Detect when last card is reached and complete the unit
    useEffect(() => {
        const isLastCard = currentIndex === totalCards - 1 && totalCards > 0;
        
        if (isLastCard && !completionTrackedRef.current && unitId) {
            // Mark as tracked to prevent multiple calls
            completionTrackedRef.current = true;
            // Delay slightly to ensure all card views are recorded
            setTimeout(() => {
                handleUnitCompletion();
            }, 500);
        }
    }, [currentIndex, totalCards, unitId]);

    // Check if 12 hours have passed since last unit completion
    const canGetRevisionReward = (unitId: string): boolean => {
        if (!unitId) return false;
        
        const lastCompletionKey = `unitLastCompleted_${unitId}`;
        const lastCompletionTime = localStorage.getItem(lastCompletionKey);
        
        if (!lastCompletionTime) return false; // First time - no revision reward yet
        
        const lastTime = parseInt(lastCompletionTime);
        const currentTime = Date.now();
        const twelveHours = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
        
        return (currentTime - lastTime) >= twelveHours;
    };

    // Award revision coins and update completion time
    const awardRevisionReward = (unitId: string) => {
        if (!unitId) return;
        
        const lastCompletionKey = `unitLastCompleted_${unitId}`;
        const currentCoins = parseInt(localStorage.getItem("farmCoins") || "0");
        
        // Award 20 coins for revision
        localStorage.setItem("farmCoins", (currentCoins + 20).toString());
        
        // Update last completion time
        localStorage.setItem(lastCompletionKey, Date.now().toString());
        
        // Show success toast
        setToastMessage({ 
            message: `🎉 Revision Complete! You earned 20 coins for coming back!`, 
            type: 'success' 
        });
    };

    // Handle unit completion
    const handleUnitCompletion = () => {
        if (!unitId) return;

        // Save unit as completed
        const completedUnits = JSON.parse(localStorage.getItem("completedUnits") || "[]");
        const isFirstCompletion = !completedUnits.includes(unitId);
        
        if (isFirstCompletion) {
            completedUnits.push(unitId);
            localStorage.setItem("completedUnits", JSON.stringify(completedUnits));
            // Save the completion time for first completion
            const lastCompletionKey = `unitLastCompleted_${unitId}`;
            localStorage.setItem(lastCompletionKey, Date.now().toString());
        }

        if (canGetRevisionReward(unitId)) {
            awardRevisionReward(unitId);
        } else {
            // Show message that revision reward is not available yet
            setToastMessage({
                message: `📚 Unit completed! Come back in 12+ hours for revision reward!`,
                type: 'success'
            });
        }

        // Show introductory toast about revision system after a short delay
        setTimeout(() => {
            setToastMessage({
                message: `💡 Tip: Complete units again after 12+ hours to earn 20 revision coins! Great for spaced learning!`,
                type: 'success'
            });
        }, 3000); // Show after 3 seconds

        setUnitCompleted(true);
    };

    const handleAnswerViewed = () => {
        // Only award coins and unlocks if this is the first time completing the unit
        if (unitId && !isUnitPreviouslyCompleted) {
            const cardsViewed = JSON.parse(localStorage.getItem("cardsViewedPerUnit") || "{}");
            const currentCount = (cardsViewed[unitId] || 0) + 1;
            cardsViewed[unitId] = currentCount;
            localStorage.setItem("cardsViewedPerUnit", JSON.stringify(cardsViewed));
            
            // Add 1 coin only for new units
            const currentCoins = parseInt(localStorage.getItem("farmCoins") || "0");
            localStorage.setItem("farmCoins", (currentCoins + 1).toString());

            // Check for unlock at 5 cards
            if (currentCount === 5) {
                const unitToItemIndex = JSON.parse(localStorage.getItem("unitToItemIndex") || "{}");
                
                // Only unlock if this unit hasn't already unlocked an item
                if (!unitToItemIndex[unitId]) {
                    // Find the next available item index (0-18 for 19 items)
                    const usedIndices = new Set(Object.values(unitToItemIndex) as number[]);
                    let nextItemIndex = 0;
                    
                    // Find the first unused item index
                    for (let i = 0; i < 19; i++) {
                        if (!usedIndices.has(i)) {
                            nextItemIndex = i;
                            break;
                        }
                    }
                    
                    // Check if all items are already unlocked
                    if (usedIndices.size < 19) {
                        // Assign this item to this unit
                        unitToItemIndex[unitId] = nextItemIndex;
                        localStorage.setItem("unitToItemIndex", JSON.stringify(unitToItemIndex));
                        
                        // Show toast notification
                        setToastMessage({ message: `🎉 New item unlocked! You can now get it from the Farm Shop!`, type: 'success' });
                    }
                }
            }
        }
    };

    const handleNext = () => {
        if (currentIndex < totalCards - 1) {
            setDirection(1);
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(currentIndex - 1);
        }
    };

    if (totalCards === 0) {
        return (
            <div className="StudyPage__empty">
                <p>No flashcards found for this unit.</p>
                <a href="/units" className="btn-3d--teal" style={{ textDecoration: 'none', padding: '10px 20px', display: 'inline-block', marginTop: '20px' }}>
                    Go Back to Units
                </a>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];

    // Animation variants
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 500 : -500,
            opacity: 0,
            scale: 0.9
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 500 : -500,
            opacity: 0,
            scale: 0.9
        })
    };

    return (
        <div className="StudyInterface">
            <div className="StudyPage__progress-container">
                <ProgressBar
                    current={currentIndex + 1}
                    total={totalCards}
                    title="Study Progress"
                    accentColor={subjectColor}
                />
            </div>

            <main className="StudyPage__card-area">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center'
                        }}
                    >
                        <Flashcard
                            key={currentIndex}
                            question={currentCard.question}
                            answer={currentCard.answer}
                            questionImg={currentCard.question_img_url || currentCard.questionImage || currentCard.question_img}
                            answerImages={currentCard.answerImages || (currentCard.answer_img_url || currentCard.answerImage || currentCard.answer_img ? [currentCard.answer_img_url || currentCard.answerImage || currentCard.answer_img].filter(Boolean) as string[] : undefined)}
                            subjectColor={subjectColor}
                            unitTitle={unitTitle}
                            onAnswerViewed={handleAnswerViewed}
                        />
                    </motion.div>
                </AnimatePresence>
            </main>

            <div className="StudyPage__nav">
                <button
                    className="btn-nav--prev"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                >
                    <ChevronLeft size={24} />
                    <span>Previous</span>
                </button>
                <button
                    className="btn-nav--next"
                    onClick={handleNext}
                    disabled={currentIndex === totalCards - 1}
                >
                    <span>Next</span>
                    <ChevronRight size={24} />
                </button>
            </div>

            <footer className="StudyPage__guide">
                <KeyboardGuide />
            </footer>

            {toastMessage && (
                <Toast
                    message={toastMessage.message}
                    type={toastMessage.type}
                    duration={4000}
                    onClose={() => setToastMessage(null)}
                />
            )}
        </div>
    );
}
