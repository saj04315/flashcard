"use client";

import React, { useState } from "react";
import "./../Admin.css";
import { Search, Bell, Menu, X } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import FlashcardForm from "../components/FlashcardForm";
import SubjectManager from "../components/SubjectManager";
import UnitManager from "../components/UnitManager";
import StudentManager from "../components/StudentManager";
import GradeManager from "../components/GradeManager";

export default function AdminDashboardPage() {
    const [currentTab, setCurrentTab] = useState('grades');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
                return <StudentManager />;
            default:
                return (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <h2 style={{ color: 'var(--text-black)' }}>{currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} Section</h2>
                        <p style={{ color: 'var(--text-gray)' }}>This section is currently under development.</p>
                    </div>
                );
        }
    };

    return (
        <div className="AdminLayout">
            <AdminSidebar
                currentTab={currentTab}
                onTabChange={(tab) => {
                    setCurrentTab(tab);
                    setIsSidebarOpen(false); // Close sidebar on selection on mobile
                }}
                isOpen={isSidebarOpen}
            />

            <main className="AdminMain">
                <header className="AdminHeader">
                    <div className="AdminHeader__left-flex">
                        <button className="AdminHeader__mobile-toggle" onClick={toggleSidebar}>
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
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
