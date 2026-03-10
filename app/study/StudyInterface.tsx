"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

    const totalCards = flashcards.length;

    const handleNext = () => {
        if (currentIndex < totalCards - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
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

    return (
        <div className="StudyInterface">
            <div className="StudyPage__progress-container">
                <ProgressBar
                    current={currentIndex + 1}
                    total={totalCards}
                    title="Study Progress"
                />
            </div>

            <main className="StudyPage__card-area">
                <Flashcard
                    key={currentIndex}
                    question={currentCard.question}
                    answer={currentCard.answer}
                    questionImg={currentCard.question_img_url}
                    answerImg={currentCard.answer_img_url}
                />
            </main>

            <div className="StudyPage__nav">
                <Button
                    className="btn-nav--outline"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    icon={<ChevronLeft size={20} />}
                >
                    Previous
                </Button>
                <Button
                    className="btn-nav--solid"
                    onClick={handleNext}
                    disabled={currentIndex === totalCards - 1}
                    icon={<ChevronRight size={20} />}
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
