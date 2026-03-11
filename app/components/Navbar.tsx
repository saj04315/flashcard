"use client";

import React from "react";
import "./Navbar.css";
import { BookOpen, Search, LogOut } from "lucide-react";
import { UserButton, SignOutButton, Show, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const Navbar: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { user } = useUser();
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        setSearchQuery(searchParams.get("search") || "");
    }, [searchParams]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        const params = new URLSearchParams(searchParams.toString());
        if (query) {
            params.set("search", query);
        } else {
            params.delete("search");
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    if (pathname === "/login") return null;

    return (
        <nav className={`Navbar ${isMenuOpen ? "Navbar--open" : ""}`}>
            <div className="Navbar__main">
                <div className="Navbar__left">
                    <div className="Navbar__logo">
                        <a href="/" className="Navbar__link">
                            <span>FlashCardEdu</span>
                        </a>
                    </div>
                </div>

                {!pathname.startsWith('/study') && (
                    <div className="Navbar__center">
                        <div className="Navbar__search">
                            <Search size={18} color="#94A3B8" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                )}

                <div className="Navbar__right">
                    <Show when="signed-in">
                        <div className="Navbar__user">
                            <div className="Navbar__user-info">
                                <span className="Navbar__user-name">{user?.fullName || user?.username || "Guest"}</span>
                                <span className="Navbar__user-grade">{(user?.publicMetadata?.grade as string) || "Student"}</span>
                            </div>
                            <UserButton />
                        </div>
                        <div className="Navbar__logout">
                            <SignOutButton>
                                <button className="Navbar__icon-btn">
                                    <LogOut size={20} />
                                </button>
                            </SignOutButton>
                        </div>
                    </Show>
                    <Show when="signed-out">
                        <div className="Navbar__auth-buttons">
                            <SignInButton mode="modal">
                                <button className="btn-3d" style={{ padding: "8px 16px", fontSize: "14px", height: "36px" }}>Sign In</button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="btn-3d--orange" style={{ padding: "8px 16px", fontSize: "14px", height: "36px" }}>Sign Up</button>
                            </SignUpButton>
                        </div>
                    </Show>

                    <button className="Navbar__menu-toggle" onClick={toggleMenu}>
                        {isMenuOpen ? <span className="close-icon" style={{ fontSize: '24px' }}>&times;</span> : <span className="hamburger-icon" style={{ fontSize: '24px' }}>&#x2630;</span>}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="Navbar__mobile-menu">
                    {!pathname.startsWith('/study') && (
                        <div className="Navbar__mobile-search">
                            <Search size={18} color="#94A3B8" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => {
                                    handleSearch(e);
                                }}
                            />
                        </div>
                    )}
                    <Show when="signed-in">
                        <div className="Navbar__mobile-user">
                            <div className="Navbar__user-info">
                                <span className="Navbar__user-name">{user?.fullName || user?.username || "Guest"}</span>
                                <span className="Navbar__user-grade">{(user?.publicMetadata?.grade as string) || "Student"}</span>
                            </div>
                            <UserButton />
                        </div>
                        <div className="Navbar__mobile-logout">
                            <SignOutButton>
                                <button className="Navbar__icon-btn" style={{ width: '100%', justifyContent: 'center', gap: '8px' }}>
                                    <LogOut size={20} />
                                    <span>Logout</span>
                                </button>
                            </SignOutButton>
                        </div>
                    </Show>
                    <Show when="signed-out">
                        <div className="Navbar__mobile-auth">
                            <SignInButton mode="modal">
                                <button className="btn-3d" style={{ width: '100%', padding: "10px", height: 'auto' }}>Sign In</button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="btn-3d--orange" style={{ width: '100%', padding: "10px", height: 'auto' }}>Sign Up</button>
                            </SignUpButton>
                        </div>
                    </Show>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
