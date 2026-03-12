"use client";

import React from "react";
import { GraduationCap, ShieldCheck, Lock, Headphones } from "lucide-react";
import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SignUpPage() {
    const fadeInBlur = {
        initial: { opacity: 0, filter: "blur(10px)", y: 20 },
        animate: { opacity: 1, filter: "blur(0px)", y: 0 },
        transition: { duration: 0.8, ease: "easeOut" }
    } as const;

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.4
            }
        }
    };

    return (
        <div className="LoginPage">
            <div className="LoginHeader">
                <motion.h1
                    className="LoginHeader__title"
                    {...fadeInBlur}
                >
                    Join Your Learning Space
                </motion.h1>
                <motion.p
                    className="LoginHeader__subtitle"
                    {...fadeInBlur}
                    transition={{ ...fadeInBlur.transition, delay: 0.2 }}
                >
                    Create an account to start mastering your subjects with smart flashcards.
                </motion.p>
            </div>

            <motion.div
                className="LoginCard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <div className="LoginCard__body" style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", padding: "40px" }}>
                    <SignUp routing="hash" signInUrl="/login" />
                   
                </div>
            </motion.div>

            <motion.div
                className="LoginFooter-meta"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                <motion.div className="LoginFooter-meta__item" variants={fadeInBlur}>
                    <ShieldCheck size={16} />
                    <span>SSL Secure Connection</span>
                </motion.div>
                <motion.div className="LoginFooter-meta__item" variants={fadeInBlur}>
                    <Lock size={16} />
                    <span>Data Protection Compliant</span>
                </motion.div>
                <motion.div className="LoginFooter-meta__item" variants={fadeInBlur}>
                    <Headphones size={16} />
                    <span>24/7 Support</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
