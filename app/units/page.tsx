"use client";

import React from "react";
import "./UnitPage.css";
import { Globe, Leaf, CloudLightning, Trophy, Zap } from "lucide-react";
import UnitCard from "../components/UnitCard";
import Path from "../components/Path";

export default function UnitsPage() {
    return (
        <div className="UnitPage">
            <header className="UnitPage__header">
                <Path items={["Grade 5", "Science"]} />
                <h1 className="UnitPage__title">Science Units</h1>
                <p className="UnitPage__subtitle">
                    Select a unit to start practicing your flashcards and master the curriculum.
                </p>
            </header>

            <div className="UnitGrid">
                <UnitCard
                    unitNumber={1}
                    title="THE SOLAR SYSTEM"
                    cardCount={30}
                    duration={15}
                    bgImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=640"
                    Icon={Globe}
                />
                <UnitCard
                    unitNumber={2}
                    title="PLANT BIOLOGY"
                    cardCount={45}
                    duration={25}
                    bgImage="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=640"
                    Icon={Leaf}
                />
                <UnitCard
                    unitNumber={3}
                    title="WEATHER PATTERNS"
                    cardCount={38}
                    duration={20}
                    bgImage="https://images.unsplash.com/photo-1534088568595-a066f710b721?auto=format&fit=crop&q=80&w=640"
                    Icon={CloudLightning}
                />
                <UnitCard
                    unitNumber={4}
                    title="ECOSYSTEMS & ENERGY"
                    isLocked={true}
                    unlockText="UNLOCKS IN 3 DAYS"
                    Icon={Zap}
                />
            </div>

            <section className="ChallengeBanner">
                <div className="ChallengeBanner__left">
                    <div className="ChallengeBanner__icon">
                        <Trophy size={24} />
                    </div>
                    <div className="ChallengeBanner__info">
                        <h4>Ready for a challenge?</h4>
                        <p>Complete all units to earn your Science Explorer badge.</p>
                    </div>
                </div>
                <a href="#" className="ChallengeBanner__link">View Progress</a>
            </section>
        </div>
    );
}
