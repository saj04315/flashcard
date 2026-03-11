"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProgressBar from "../components/ProgressBar";
import Flashcard from "../components/Flashcard";
import Button from "../components/Button";
import KeyboardGuide from "../components/KeyboardGuide";

interface StudyInterfaceProps {
    flashcards: any[];
    subjectName: string;
    unitTitle: string;
}

export default function StudyInterface({ flashcards, subjectName, unitTitle }: StudyInterfaceProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const totalCards = flashcards.length;

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
            scale: 0.8
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
            scale: 0.8
        })
    };

    return (
        <div className="StudyInterface" style={{ overflow: 'hidden' }}>
            <div className="StudyPage__progress-container">
                <ProgressBar
                    current={currentIndex + 1}
                    total={totalCards}
                    title="Study Progress"
                />
            </div>

            <main className="StudyPage__card-area" style={{ position: 'relative', minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                            questionImg={currentCard.questionImage}
                            answerImg={currentCard.answerImage}
                        />
                    </motion.div>
                </AnimatePresence>
            </main>

            <div className="StudyPage__nav">
                <Button
                    className=""
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                >
                    Previous
                </Button>
                <Button
                    className="btn-3d--orange"
                    onClick={handleNext}
                    disabled={currentIndex === totalCards - 1}
                >
                    Next
                </Button>
            </div>

            <footer className="StudyPage__guide">
                <KeyboardGuide />
            </footer>
        </div>
    );
}
