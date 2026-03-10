"use client";

import React from "react";
import { LayoutDashboard, GraduationCap, Shapes, Layers, CreditCard, Users, GraduationCap as SchoolIcon } from "lucide-react";

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    href?: string;
}

interface AdminSidebarProps {
    currentTab: string;
    onTabChange: (tab: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps & { onClick: () => void }> = ({ icon, label, isActive = false, onClick }) => (
    <button
        onClick={onClick}
        className={`AdminSidebar__item ${isActive ? "AdminSidebar__item--active" : ""}`}
        style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default function AdminSidebar({ currentTab, onTabChange }: AdminSidebarProps) {
    return (
        <aside className="AdminSidebar">
            <div className="AdminSidebar__logo">
               
            </div>

            <nav className="AdminSidebar__nav">
               
                <SidebarItem
                    icon={<Shapes size={20} />}
                    label="Subjects"
                    isActive={currentTab === 'subjects'}
                    onClick={() => onTabChange('subjects')}
                />
                <SidebarItem
                    icon={<Layers size={20} />}
                    label="Units"
                    isActive={currentTab === 'units'}
                    onClick={() => onTabChange('units')}
                />
                <SidebarItem
                    icon={<CreditCard size={20} />}
                    label="Flashcards"
                    isActive={currentTab === 'flashcards'}
                    onClick={() => onTabChange('flashcards')}
                />
                <SidebarItem
                    icon={<Users size={20} />}
                    label="Students"
                    isActive={currentTab === 'students'}
                    onClick={() => onTabChange('students')}
                />
            </nav>
        </aside>
    );
}
