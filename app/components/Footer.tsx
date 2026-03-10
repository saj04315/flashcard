"use client";

import React from "react";

import { usePathname } from "next/navigation";

const Footer: React.FC = () => {
    const pathname = usePathname();
    if (pathname === "/login") return null;

    return (
        <footer className="Footer">
            <div className="Footer__left">
                <span className="Footer__text">© 2026 Flashcard App. All rights reserved.</span>
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
