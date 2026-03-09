"use client";

import React from "react";
import { GraduationCap, ShieldCheck, Lock, Headphones } from "lucide-react";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
    return (
        <div className="LoginPage">
            <div className="LoginHeader">
                <h1 className="LoginHeader__title">Welcome to Your Learning Space</h1>
                <p className="LoginHeader__subtitle">
                    The secure way to master your subjects with smart flashcards.
                </p>
            </div>

            <div className="LoginCard">
                
                <div className="LoginCard__body" style={{ display: "flex", justifyContent: "center" }}>
                    <SignIn routing="hash" />
                </div>
            </div>

            <div className="LoginFooter-meta">
                <div className="LoginFooter-meta__item">
                    <ShieldCheck size={16} />
                    <span>SSL Secure Connection</span>
                </div>
                <div className="LoginFooter-meta__item">
                    <Lock size={16} />
                    <span>Data Protection Compliant</span>
                </div>
                <div className="LoginFooter-meta__item">
                    <Headphones size={16} />
                    <span>24/7 Support</span>
                </div>
            </div>
        </div>
    );
}
