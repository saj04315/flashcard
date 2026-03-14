"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { useAppSelector } from "../store/hooks";

interface PathItem {
    label: string;
    href?: string;
}

interface PathProps {
    items: PathItem[];
}

const Path: React.FC<PathProps> = ({ items }) => {
    const { subjectId, unitId } = useAppSelector((state) => state.navigation);

    if (!items || items.length === 0) return null;

    // Replace placeholder tokens in hrefs with real IDs from Redux state
    const resolvedItems = items.map((item) => {
        let resolvedHref = item.href;
        if (resolvedHref) {
            resolvedHref = resolvedHref
                .replace(':subjectId', subjectId)
                .replace(':unitId', unitId);
        }
        return { ...item, href: resolvedHref };
    });

    return (
        <nav className="Path" aria-label="Breadcrumb">
            {resolvedItems.map((item, index) => {
                const isLast = index === resolvedItems.length - 1;

                return (
                    <React.Fragment key={index}>
                        {isLast ? (
                            <span className="Path__current">{item.label}</span>
                        ) : (
                            item.href ? (
                                <a href={item.href} className="Path__item Path__link">
                                    {item.label}
                                </a>
                            ) : (
                                <span className="Path__item">{item.label}</span>
                            )
                        )}
                        {!isLast && (
                            <span className="Path__separator" aria-hidden="true">
                                <ChevronRight size={18} />
                            </span>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default Path;
