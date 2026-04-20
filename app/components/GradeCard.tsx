import React from 'react';
import { GraduationCap } from 'lucide-react';
import Button from './Button';

// *****************************************************************
// GradeCard Component
// Displays a grade card with icon, title, and subjects count
// *****************************************************************

export default function GradeCard({
    grade = 'Grade 10',
    subjectCount = 5,
    Icon = GraduationCap,
    accentColor = '#F28F3B', // Default to an orange color
    bgImage = "https://images.unsplash.com/photo-1546410531-bea5aadcb6ce?auto=format&fit=crop&q=80&w=320",
    href = '#',
}: {
    grade?: string;
    subjectCount?: number;
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
                <div className="SubjectCard__badge">GRADE</div>
                <div className="SubjectCard__icon-wrapper">
                    <Icon size={48} color="white" />
                </div>
            </div>

            <div className="SubjectCard__content">
                <h3 className="SubjectCard__title">{grade}</h3>

                <a href={href} style={{ textDecoration: 'none', display: 'block' }}>
                    <Button
                        className="btn-3d--teal"
                        style={{ width: "100%", gap: "8px" }}
                    >
                        CHOOSE SUBJECT
                    </Button>
                </a>
            </div>
        </div>
    );
}
