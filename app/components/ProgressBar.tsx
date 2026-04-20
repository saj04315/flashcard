"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

interface ProgressBarProps {
    current?: number;
    total?: number;
    title?: string;
    accentColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    current = 4,
    total = 30,
    title = "Study Progress",
    accentColor = "#d10c0cff",
}) => {
    const percentage = Math.round((current / total) * 100);
    const remaining = total - current;

    return (
        <div className="ProgressBar">
            <div className="ProgressBar__top ">
                <div className="ProgressBar__title-group text-black">
                    <BookOpen size={24} />
                    <span>{title}</span>
                </div>
                <div className="ProgressBar__count text-black">
                    {current} of {total} cards
                </div>
            </div>

            <div className="ProgressBar__track">
                <motion.div
                    className="ProgressBar__fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ backgroundColor: "#d10c0cff" }}
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
