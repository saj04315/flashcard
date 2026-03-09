"use client";

import React from "react";

const Footer: React.FC = () => {
    return (
        <footer className="Footer">
            <div className="Footer__left">
                <span className="Footer__text">© 2024 Flashcard App. All rights reserved.</span>
            </div>
            <div className="Footer__right">
                <span className="Footer__text">
                    Design by{" "}
                    <a
                        href="https://webasi.co"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="Footer__link"
                    >
                        WEBASI
                    </a>
                </span>
            </div>
        </footer>
    );
};

export default Footer;
