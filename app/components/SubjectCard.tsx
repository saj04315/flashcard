import React from 'react';
import { FlaskConical } from 'lucide-react';


// *****************************************************************
// SubjectCard Component
// Displays a subject card with icon, title, card count, and mastery
// *****************************************************************

export default function SubjectCard({
    subject = 'Science',
    cardCount = 30,
    masteryPercent = 85,
    Icon = FlaskConical,
    accentColor = '#e1eeeaff',
    accentDark = '#91a5a0ff',
    href = '#',
}: {
    subject?: string;
    cardCount?: number;
    masteryPercent?: number;
    Icon?: any;
    accentColor?: string;
    accentDark?: string;
    href?: string;
}) {
    return (
        <a href={href} className="SubjectCard" style={{ textDecoration: 'none' }}>
            {/* Top colored section with icon */}
            <div
                className="SubjectCard__top"
                style={{ backgroundColor: accentColor }}
            >
                {/* Decorative corner squares */}
                <div className="SubjectCard__corner-dots">
                    <span></span>
                    <span></span>
                </div>

                {/* Lucide icon */}
                <div className="SubjectCard__icon">
                    <Icon size={36} color="white" strokeWidth={1.5} />
                </div>
            </div>

            {/* Bottom white info section */}
            <div className="SubjectCard__bottom">
                <p className="SubjectCard__subject">{subject.toUpperCase()}</p>
                <p className="SubjectCard__meta">
                    {cardCount} CARDS&nbsp;•&nbsp;{masteryPercent}% MASTERED
                </p>
            </div>
        </a>
    );
}