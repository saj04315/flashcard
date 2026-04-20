"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProgressBar from "../components/ProgressBar";
import Flashcard from "../components/Flashcard";
import KeyboardGuide from "../components/KeyboardGuide";
import Toast from "../components/Toast";

import { useAppSelector } from "../store/hooks";
import {
    getGameData,
    markCardViewed,
    markUnitCompleted,
    awardRevisionCoins,
    type GameData,
} from "../actions/gameActions";

interface StudyInterfaceProps {
    flashcards: any[];
    subjectName: string;
    unitTitle: string;
    unitId?: string;
}

export default function StudyInterface({ flashcards, subjectName, unitTitle, unitId }: StudyInterfaceProps) {
    const globalAccentColor = useAppSelector((state) => state.theme.accentColor);
    const subjectColor = globalAccentColor || "#7ED321";

    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [unitCompleted, setUnitCompleted] = useState(false);
    const [isUnitPreviouslyCompleted, setIsUnitPreviouslyCompleted] = useState(false);
    const [gameData, setGameData] = useState<GameData | null>(null);
    const completionTrackedRef = useRef(false);

    const totalCards = flashcards.length;

    // ── On mount: load gameData and show "previously completed" toast ──
    useEffect(() => {
        if (!unitId) return;

        completionTrackedRef.current = false;
        setUnitCompleted(false);

        getGameData().then((data) => {
            if (!data) return;
            setGameData(data);

            const wasPreviouslyCompleted = data.completedUnits.includes(unitId);
            setIsUnitPreviouslyCompleted(wasPreviouslyCompleted);

            if (wasPreviouslyCompleted) {
                setToastMessage({
                    message: `📚 You learned this unit! Complete it again after 12+ hours for revision coins!`,
                    type: 'success',
                });
            }
        });
    }, [unitId]);

    // ── Detect last card and trigger unit completion ──
    useEffect(() => {
        const isLastCard = currentIndex === totalCards - 1 && totalCards > 0;
        if (isLastCard && !completionTrackedRef.current && unitId) {
            completionTrackedRef.current = true;
            setTimeout(() => { handleUnitCompletion(); }, 500);
        }
    }, [currentIndex, totalCards, unitId]);

    // ── Check if 12 h have passed since last completion ──
    const canGetRevisionReward = (uid: string): boolean => {
        if (!gameData) return false;
        const lastTime = gameData.unitLastCompleted[uid];
        if (!lastTime) return false;
        return (Date.now() - lastTime) >= 12 * 60 * 60 * 1000;
    };

    // ── Award 20 revision coins ──
    const handleRevisionReward = async (uid: string) => {
        await awardRevisionCoins(uid);
        setToastMessage({
            message: `🎉 Revision Complete! You earned 20 coins for coming back!`,
            type: 'success',
        });
    };

    // ── Handle unit completion ──
    const handleUnitCompletion = async () => {
        if (!unitId) return;

        await markUnitCompleted(unitId);

        if (canGetRevisionReward(unitId)) {
            await handleRevisionReward(unitId);
        } else {
            setToastMessage({
                message: `📚 Unit completed! Come back in 12+ hours for revision reward!`,
                type: 'success',
            });
        }

        setTimeout(() => {
            setToastMessage({
                message: `💡 Tip: Complete units again after 12+ hours to earn 20 revision coins!`,
                type: 'success',
            });
        }, 3000);

        setUnitCompleted(true);
    };

    // ── Handle card answer viewed ──
    const handleAnswerViewed = async () => {
        if (!unitId) return;

        const { updatedData, itemUnlocked } = await markCardViewed(unitId, !isUnitPreviouslyCompleted);

        if (updatedData) setGameData(updatedData);

        if (itemUnlocked) {
            setToastMessage({
                message: `🎉 New item unlocked! You can now get it from the Farm Shop!`,
                type: 'success',
            });
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

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? 500 : -500, opacity: 0, scale: 0.9 }),
        center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
        exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 500 : -500, opacity: 0, scale: 0.9 }),
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
                            opacity: { duration: 0.2 },
                        }}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                    >
                        <Flashcard
                            key={currentIndex}
                            question={currentCard.question}
                            answer={currentCard.answer}
                            questionImg={currentCard.question_img_url || currentCard.questionImage || currentCard.question_img}
                            answerImages={
                                currentCard.answerImages ||
                                (currentCard.answer_img_url || currentCard.answerImage || currentCard.answer_img
                                    ? [currentCard.answer_img_url || currentCard.answerImage || currentCard.answer_img].filter(Boolean) as string[]
                                    : undefined)
                            }
                            subjectColor={subjectColor}
                            unitTitle={unitTitle}
                            onAnswerViewed={handleAnswerViewed}
                        />
                    </motion.div>
                </AnimatePresence>
            </main>

            <div className="StudyPage__nav">
                <button className="btn-nav--prev" onClick={handlePrev} disabled={currentIndex === 0}>
                    <ChevronLeft size={24} />
                    <span>Previous</span>
                </button>
                <button className="btn-nav--next" onClick={handleNext} disabled={currentIndex === totalCards - 1}>
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
