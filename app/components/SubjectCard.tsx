import React from 'react';
import { FlaskConical, Layers, Clock } from 'lucide-react';
import Button from './Button';

// *****************************************************************
// SubjectCard Component
// Displays a subject card with icon, title, card count, and mastery
// *****************************************************************

export default function SubjectCard({
    subject = 'Science',
    unitCount = 0,
    readTime = 2,
    Icon = FlaskConical,
    accentColor = '#6BA898', // Default to teal like UnitCard
    bgImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=320",
    href = '#',
}: {
    subject?: string;
    unitCount?: number;
    readTime?: number;
    Icon?: any;
    accentColor?: string;
    bgImage?: string;
    href?: string;
}) {
    return (
        <div className="SubjectCard">
            <div
                className="SubjectCard__header"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="SubjectCard__overlay" style={{ backgroundColor: `${accentColor}B3` }}></div>
                <div className="SubjectCard__badge">SUBJECT</div>
                <div className="SubjectCard__icon-wrapper">
                    <Icon size={48} color="white" />
                </div>
            </div>

            <div className="SubjectCard__content">
                <h3 className="SubjectCard__title">{subject}</h3>

                <div className="UnitCard__stats">
                    <div className="UnitCard__stat">
                        <Layers size={14} />
                        <span>{unitCount} UNITS</span>
                    </div>
                    <div className="UnitCard__stat">
                        <Clock size={14} />
                        <span>{readTime} MIN READ</span>
                    </div>
                </div>

                <a href={href} style={{ textDecoration: 'none', display: 'block' }}>
                    <Button
                        className="btn-3d--teal"
                        style={{ width: "100%", gap: "8px" }}
                    >
                        CHOOSE UNIT
                    </Button>
                </a>
            </div>
        </div>
    );
}