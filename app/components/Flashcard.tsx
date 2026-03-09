"use client";

import React, { useState } from "react";
import { RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import Button from "./Button";

interface FlashcardProps {
    question?: string;
    answer?: string;
    onFlip?: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({
    question = "What is the largest planet in our solar system?",
    answer = "Jupiter",
    onFlip,
}) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        if (onFlip) onFlip();
    };

    return (
        <div className="Flashcard-wrapper">
            <motion.div
                className="Flashcard-inner"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* Front Face (Question) */}
                <div className="Flashcard Flashcard--front">
                    <div className="Flashcard__shapes">
                        <div className="Flashcard__shape Flashcard__shape--1"></div>
                        <div className="Flashcard__shape Flashcard__shape--2"></div>
                        <div className="Flashcard__shape Flashcard__shape--3"></div>
                        <div className="Flashcard__shape Flashcard__shape--4"></div>
                    </div>

                    <div className="Flashcard__badge">QUESTION</div>

                    <div className="Flashcard__text">{question}</div>

                    <div className="Flashcard__footer">
                        <Button
                            className="btn-3d--orange"
                            onClick={handleFlip}
                            icon={<RotateCw size={20} />}
                        >
                            Flip Card
                        </Button>
                    </div>
                </div>

                {/* Back Face (Answer) */}
                <div className="Flashcard Flashcard--back">
                    <div className="Flashcard__shapes">
                        <div className="Flashcard__shape Flashcard__shape--1"></div>
                        <div className="Flashcard__shape Flashcard__shape--2"></div>
                        <div className="Flashcard__shape Flashcard__shape--3"></div>
                        <div className="Flashcard__shape Flashcard__shape--4"></div>
                    </div>

                    <div className="Flashcard__badge">ANSWER</div>

                    <div className="Flashcard__text">{answer}</div>

                    <div className="Flashcard__footer">
                        <Button
                            className="btn-3d--orange"
                            onClick={handleFlip}
                            icon={<RotateCw size={20} />}
                        >
                            Flip Card
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Flashcard;
