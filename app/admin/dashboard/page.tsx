"use client";

import React, { useState, useEffect } from "react";
import "./../Admin.css";
import { Search, Bell, Menu, X } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import FlashcardForm from "../components/FlashcardForm";
import SubjectManager from "../components/SubjectManager";
import UnitManager from "../components/UnitManager";
import StudentManager from "../components/StudentManager";
import GradeManager from "../components/GradeManager";
import TeacherManager from "../components/TeacherManager";
import { checkUserStatus } from "../../actions/authActions";

export default function AdminDashboardPage() {
    const [currentTab, setCurrentTab] = useState('grades');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const getAuth = async () => {
            const status = await checkUserStatus();
            setRole((status as any).role || null);
            setUserId((status as any).user?.id || null);
            if ((status as any).role === 'teacher') {
                setCurrentTab('students');
            }
            setLoadingAuth(false);
        };
        getAuth();
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const renderContent = () => {
        switch (currentTab) {
            case 'grades':
                return <GradeManager />;
            case 'flashcards':
                return <FlashcardForm />;
            case 'subjects':
                return <SubjectManager />;
            case 'units':
                return <UnitManager />;
            case 'students':
                return <StudentManager teacherId={role === 'teacher' && userId ? userId : undefined} role={role} />;
            case 'teachers':
                return <TeacherManager />;
            default:
                return (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <h2 style={{ color: 'var(--text-black)' }}>{currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} Section</h2>
                        <p style={{ color: 'var(--text-gray)' }}>This section is currently under development.</p>
                    </div>
                );
        }
    };

    if (loadingAuth) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard...</div>;
    }

    return (
        <div className="AdminLayout">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="AdminSidebar__overlay"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <AdminSidebar
                currentTab={currentTab}
                role={role}
                onTabChange={(tab) => {
                    setCurrentTab(tab);
                    setIsSidebarOpen(false); // Close sidebar on selection on mobile
                }}
                isOpen={isSidebarOpen}
            />

            <main className="AdminMain">
                {/* Mobile Navbar */}
                <nav className="AdminMobileNav">
                    <div className="AdminMobileNav__left">
                        <button className="AdminMobileNav__toggle" onClick={toggleSidebar}>
                            {isSidebarOpen ? <X size={24} color="#000" /> : <Menu size={24} color="#000" />}
                        </button>
                        <h1 className="AdminMobileNav__title">Teacher Management</h1>
                    </div>
                    <div className="AdminMobileNav__right">
                        <div className="AdminHeader__notification AdminHeader__notification--badge">
                            <Bell size={20} />
                        </div>
                    </div>
                </nav>

                <header className="AdminHeader">
                    <div className="AdminHeader__left-flex">
                        <div className="AdminHeader__title">
                            <h1>Teacher Management</h1>
                        </div>
                    </div>
                    <div className="AdminHeader__right">
                        <div className="AdminHeader__search">
                            <Search size={18} color="var(--text-gray)" />
                            <input type="text" placeholder="Search resources..." />
                        </div>
                        <div className="AdminHeader__notification AdminHeader__notification--badge">
                            <Bell size={20} />
                        </div>
                    </div>
                </header>

                <div className="AdminContent">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
