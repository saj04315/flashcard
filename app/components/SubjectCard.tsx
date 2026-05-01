'use client';

import React from 'react';
import { 
  FlaskConical, Layers, Clock, BookOpen, Globe, Sigma, Trophy,
  Cpu, Beaker, Atom, History, Map, Languages, Palette, LineChart, LucideIcon, Lock
} from 'lucide-react';
import Button from './Button';
import Link from 'next/link';
import { useAppDispatch } from '../store/hooks';
import { setAccentColor } from '../store/themeSlice';


// *****************************************************************
// SubjectCard Component
// Displays a subject card with icon, title, card count, and mastery
// *****************************************************************

const iconMap: Record<string, LucideIcon> = {
  "computer_science_icon_url": Cpu,
  "mathematics_icon_url": Sigma,
  "physics_icon_url": Atom,
  "chemistry_icon_url": Beaker,
  "biology_icon_url": Beaker,
  "history_icon_url": History,
  "geography_icon_url": Map,
  "literature_icon_url": Languages,
  "art_icon_url": Palette,
  "economics_icon_url": LineChart,
};

export default function SubjectCard({
    subject = 'Science',
    subjectId = '',
    iconName,
    Icon,
    accentColor = '#6BA898', // Default to teal like UnitCard
    bgImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=320",
    href = '#',
    isLocked = false,
}: {
    subject?: string;
    subjectId?: string;
    iconName?: string;
    Icon?: any;
    accentColor?: string;
    bgImage?: string;
    href?: string;
    isLocked?: boolean;
}) {
    const dispatch = useAppDispatch();

    const handleCardClick = () => {
        dispatch(setAccentColor(accentColor));
       
    };

    const ResolvedIcon = Icon || (iconName && iconMap[iconName]) || BookOpen || FlaskConical;

    return (
        <div className={`SubjectCard ${isLocked ? "SubjectCard--locked" : ""}`}>
            <div
                className="SubjectCard__header"
                style={{ backgroundImage: isLocked ? "none" : `url(${bgImage})`, backgroundColor: isLocked ? "#F1F5F9" : "transparent" }}
            >
                {!isLocked && <div className="SubjectCard__overlay" style={{ backgroundColor: `${accentColor}B3` }}></div>}
                <div className="SubjectCard__badge">SUBJECT</div>
                <div className="SubjectCard__icon-wrapper">
                    {isLocked ? (
                        <Lock size={48} color="#CBD5E1" />
                    ) : (
                        <ResolvedIcon size={48} color="white" />
                    )}
                </div>
            </div>

            <div className="SubjectCard__content">
                <h3 className="SubjectCard__title">{subject}</h3>

                <Link href={isLocked ? "#" : href} style={{ textDecoration: 'none', display: 'block' }} onClick={isLocked ? (e) => e.preventDefault() : handleCardClick}>
                    <Button
                        className={isLocked ? "btn-3d--locked" : "btn-3d--teal"}
                        style={{ width: "100%", gap: "8px" }}
                        disabled={isLocked}
                    >
                        {isLocked ? "LOCKED" : "CHOOSE UNIT"}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
