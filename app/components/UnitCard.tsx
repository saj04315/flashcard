'use client';

import React from "react";
import { Globe, BookOpen, Clock, Lock, Layers, Book, Beaker, Atom, Cpu, Map, LucideIcon } from "lucide-react";
import Button from "./Button";
import { useAppDispatch } from "../store/hooks";
import { setUnit } from "../store/navigationSlice";

const iconMap: Record<string, LucideIcon> = {
    globe: Globe,
    book: Book,
    bookopen: BookOpen,
    beaker: Beaker,
    atom: Atom,
    cpu: Cpu,
    map: Map,
};

interface UnitCardProps {
    unitNumber?: number;
    unitId?: string;
    title?: string;
    cardCount?: number;
    duration?: number;
    bgImage?: string;
    iconName?: string;
    isLocked?: boolean;
    unlockText?: string;
    href?: string;
}

const UnitCard: React.FC<UnitCardProps> = ({
    unitNumber = 1,
    unitId = '',
    title = "The Solar System",
    cardCount = 0,
    duration = 0,
   
    bgImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=320",
    iconName = 'globe',
    isLocked = false,
    unlockText = "",
    href = "#",
}) => {
    const dispatch = useAppDispatch();
    const Icon = iconMap[iconName.toLowerCase()] || BookOpen;

    const handleClick = () => {
        if (!isLocked) {
            dispatch(setUnit({ id: unitId, title }));
        }
    };
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

                <div className="UnitCard__stats">
                    <div className="UnitCard__stat">
                        <Layers size={14} />
                        <span>{cardCount} CARDS</span>
                    </div>
                    <div className="UnitCard__stat">
                        <Clock size={14} />
                        <span>{duration} MIN READ</span>
                    </div>
                </div>

                <a href={isLocked ? undefined : href} style={{ textDecoration: 'none', display: 'block' }} onClick={handleClick}>
                    <Button
                        className={isLocked ? "btn-3d--locked" : "btn-3d--teal"}
                        style={{ width: "100%", gap: "8px" }}
                        disabled={isLocked}
                    >
                        
                        {isLocked ? "LOCKED" : "START LEARNING"}
                    </Button>
                </a>
            </div>
        </div>
    );
};

export default UnitCard;
