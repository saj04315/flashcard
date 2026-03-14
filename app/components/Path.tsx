"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

interface PathItem {
    label: string;
    href?: string;
}

interface PathProps {
    items: PathItem[];
}

const Path: React.FC<PathProps> = ({ items }) => {
    if (!items || items.length === 0) return null;

    return (
        <nav className="Path" aria-label="Breadcrumb">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <React.Fragment key={index}>
                        {isLast ? (
                            <span className="Path__current">{item.label}</span>
                        ) : (
                            (index === 0 && item.href) ? (
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
