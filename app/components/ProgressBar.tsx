"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

interface ProgressBarProps {
    current?: number;
    total?: number;
    title?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    current = 4,
    total = 30,
    title = "Study Progress",
}) => {
    const percentage = Math.round((current / total) * 100);
    const remaining = total - current;

    return (
        <div className="ProgressBar">
            <div className="ProgressBar__top">
                <div className="ProgressBar__title-group">
                    <BookOpen size={20} />
                    <span>{title}</span>
                </div>
                <div className="ProgressBar__count">
                    {current} of {total} cards
                </div>
            </div>

            <div className="ProgressBar__track">
                <motion.div
                    className="ProgressBar__fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>

            <div className="ProgressBar__bottom">
                <div className="ProgressBar__percent">
                    PROGRESS: {percentage}%
                </div>
                <div className="ProgressBar__remaining">
                    {remaining} cards remaining
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
