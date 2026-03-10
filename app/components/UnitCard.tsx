import React from "react";
import { Globe, BookOpen, Clock, Lock, Play } from "lucide-react";
import Button from "./Button";

interface UnitCardProps {
    unitNumber?: number;
    title?: string;
    cardCount?: number;
    duration?: number;
    bgImage?: string;
    Icon?: any;
    isLocked?: boolean;
    unlockText?: string;
    href?: string;
}

const UnitCard: React.FC<UnitCardProps> = ({
    unitNumber = 1,
    title = "The Solar System",
    cardCount = 30,
    duration = 15,
    bgImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=320",
    Icon = Globe,
    isLocked = false,
    unlockText = "",
    href = "#",
}) => {
    return (
        <div className={`UnitCard ${isLocked ? "UnitCard--locked" : ""}`}>
            <div
                className="UnitCard__header"
                style={{ backgroundImage: isLocked ? "none" : `url(${bgImage})`, backgroundColor: isLocked ? "#F1F5F9" : "transparent" }}
            >
                {!isLocked && <div className="UnitCard__overlay"></div>}
                <div className="UnitCard__badge">Unit {unitNumber}</div>
                <div className="UnitCard__icon-wrapper">
                    {isLocked ? (
                        <Lock size={48} color="#CBD5E1" />
                    ) : (
                        <Icon size={48} color="white" />
                    )}
                </div>
            </div>

            <div className="UnitCard__content">
                <h3 className="UnitCard__title">{title}</h3>

                {isLocked ? (
                    <div className="UnitCard__unlock-info">
                        <Lock size={14} />
                        <span>{unlockText || "LOCKED"}</span>
                    </div>
                ) : (
                    <div className="UnitCard__stats">
                        <div className="UnitCard__stat">
                            <BookOpen size={16} />
                            <span>{cardCount} Cards</span>
                        </div>
                        <div className="UnitCard__stat">
                            <Clock size={16} />
                            <span>{duration} Min</span>
                        </div>
                    </div>
                )}

                <a href={isLocked ? undefined : href} style={{ textDecoration: 'none', display: 'block' }}>
                    <Button
                        className={isLocked ? "btn-3d--locked" : "btn-3d--teal"}
                        style={{ width: "100%", gap: "8px" }}
                        disabled={isLocked}
                    >
                        {!isLocked && <Play size={18} fill="currentColor" />}
                        {isLocked ? "LOCKED" : "START LEARNING"}
                    </Button>
                </a>
            </div>
        </div>
    );
};

export default UnitCard;
