"use client";

import React, { useState } from "react";
import { RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import Button from "./Button";

interface FlashcardProps {
    question?: string;
    answer?: string;
    questionImg?: string;
    answerImages?: string[];
    onFlip?: () => void;
    subjectColor?: string;
    unitTitle?: string;
}

const Flashcard: React.FC<FlashcardProps> = ({
    question = "What is the largest planet in our solar system?",
    answer = "Jupiter",
    questionImg,
    answerImages,
    onFlip,
    subjectColor = "#ffffffff",
    unitTitle = "UNIT 2",
}) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        if (onFlip) onFlip();
    };

    const cardStyle: React.CSSProperties = {
        "--subject-color": subjectColor,
    } as any;

    return (
        <div className="Flashcard-wrapper" style={cardStyle}>
            <motion.div
                className="Flashcard-inner"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* Front Face (Question) */}
                <div className="Flashcard Flashcard--front" style={{ border: `24px solid ${subjectColor}`, backgroundColor: 'white' }}>
                    <div className="Flashcard__unit-badge">{unitTitle}</div>

                    <div className="Flashcard__text-content">
                        <div className="Flashcard__text" dangerouslySetInnerHTML={{ __html: question }}></div>
                        {questionImg && (
                            <div className="Flashcard__image">
                                <img src={questionImg} alt="Question" />
                            </div>
                        )}
                    </div>

                    <div className="Flashcard__flip-btn-container">
                        <Button
                            className="btn-flip"
                            onClick={handleFlip}
                            icon={<RotateCw size={16} />}
                        >
                            Flip
                        </Button>
                    </div>
                </div>

                {/* Back Face (Answer) */}
                <div className="Flashcard Flashcard--back" style={{ border: `24px solid ${subjectColor}`, backgroundColor: 'white' }}>
                    <div className="Flashcard__unit-badge">{unitTitle}</div>

                    <div className="Flashcard__text-content">
                        <div className="Flashcard__text" dangerouslySetInnerHTML={{ __html: answer }}></div>
                        {answerImages && answerImages.length > 0 && (
                            <div className="Flashcard__images" style={{ display: 'flex', gap: '16px', justifyContent: 'center', width: '100%' }}>
                                {answerImages.map((img, i) => (
                                    <div key={i} className="Flashcard__image" style={{ width: '150px', flexShrink: 0 }}>
                                        <img src={img} alt={`Answer ${i + 1}`} style={{ width: '100%', objectFit: 'contain' }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="Flashcard__flip-btn-container">
                        <Button
                            className="btn-flip"
                            onClick={handleFlip}
                            icon={<RotateCw size={16} />}
                        >
                            Flip
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Flashcard;
