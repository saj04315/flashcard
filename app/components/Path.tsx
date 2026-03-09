"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

interface PathProps {
    items: string[];
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
                            <span className="Path__current">{item}</span>
                        ) : (
                            <span className="Path__item">{item}</span>
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
