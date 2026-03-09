"use client";

import React from "react";

const KeyboardGuide: React.FC = () => {
    return (
        <div className="KeyboardGuide">
            <div className="KeyboardGuide__item">
                <span className="KeyboardGuide__key">Space</span>
                <span className="KeyboardGuide__label">Flip</span>
            </div>

            <div className="KeyboardGuide__separator"></div>

            <div className="KeyboardGuide__item">
                <span className="KeyboardGuide__key">←</span>
                <span className="KeyboardGuide__label">Back</span>
            </div>

            <div className="KeyboardGuide__item">
                <span className="KeyboardGuide__key">→</span>
                <span className="KeyboardGuide__label">Next</span>
            </div>
        </div>
    );
};

export default KeyboardGuide;
