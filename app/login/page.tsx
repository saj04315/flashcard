"use client";

import React, { useEffect, useState } from "react";
import { GraduationCap, ShieldCheck, Lock, Headphones, Loader2 } from "lucide-react";
import { SignIn, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { checkUserStatus } from "../actions/authActions";

export default function LoginPage() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getStatus = async () => {
            if (isSignedIn) {
                setLoading(true);
                const res = await checkUserStatus();
                if (res.authenticated) {
                    setStatus(res.status);
                    if (res.status === "Active" || res.status === "Approved") {
                        window.location.href = "/";
                    }
                }
                setLoading(false);
            }
        };
        getStatus();
    }, [isSignedIn]);

    const fadeInBlur = {
        initial: { opacity: 0, filter: "blur(10px)", y: 20 },
        animate: { opacity: 1, filter: "blur(0px)", y: 0 },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.4
            }
        }
    };

    const isPending = status && status !== "Active" && status !== "Approved";

    return (
        <div className="LoginPage">
            <div className="LoginHeader">
                <motion.h1
                    className="LoginHeader__title"
                    {...fadeInBlur}
                >
                    {isPending ? "Account Pending Approval" : "Welcome to Your Learning Space"}
                </motion.h1>
                <motion.p
                    className="LoginHeader__subtitle"
                    {...fadeInBlur}
                    transition={{ ...fadeInBlur.transition, delay: 0.2 }}
                >
                    {isPending
                        ? "Your account has been created. An administrator will review and approve your access shortly."
                        : "The secure way to master your subjects with smart flashcards."}
                </motion.p>
            </div>

            <motion.div
                className="LoginCard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <div className="LoginCard__body" style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", padding: "40px" }}>
                    {loading ? (
                        <div style={{ padding: "40px" }}>
                            <Loader2 className="animate-spin" size={40} color="#508DF7" />
                        </div>
                    ) : isPending ? (
                        <div style={{ textAlign: "center", color: "#64748B" }}>
                            <div style={{ marginBottom: "20px" }}>
                                <ShieldCheck size={48} color="#F2A359" style={{ margin: "0 auto" }} />
                            </div>
                            <p style={{ fontSize: "16px", fontWeight: 600,color:"black" }}>Please check back later.</p>
                            <p style={{ fontSize: "14px", marginTop: "8px",color:"black" }}>Once approved, you will have full access to your subjects.</p>
                        </div>
                    ) : (
                        <SignIn routing="hash" forceRedirectUrl="/" />
                    )}
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
