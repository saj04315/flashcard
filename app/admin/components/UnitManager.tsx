"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    PlusCircle,
    Search,
    Filter,
    Edit2,
    Trash2,
    FileText,
    Clock,
    Sigma,
    Triangle,
    Rocket,
    Plus,
    Loader2,
    BookOpen,
    LayoutGrid
} from "lucide-react";
import Button from "../../components/Button";
import { toast } from "sonner";
import { getUnits, createUnit, updateUnit, deleteUnit, type Unit } from "../actions/unitActions";
import { getSubjects, type Subject } from "../actions/subjectActions";

interface GroupedUnits {
    subject: string;
    color: string;
    units: Unit[];
}

export default function UnitManager() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        subject_id: "",
        title: "",
        bgImage: "",
    });

    const fetchData = useCallback(async (searchTerm: string = "") => {
        setLoading(true);
        const [unitsData, subjectsData] = await Promise.all([
            getUnits(searchTerm),
            getSubjects()
        ]);
        setUnits(unitsData);
        setSubjects(subjectsData);

        // Auto-select first subject if not editing
        if (!editingId && subjectsData.length > 0 && !formData.subject_id) {
            setFormData(prev => ({ ...prev, subject_id: subjectsData[0].id }));
        }

        setLoading(false);
    }, [editingId, formData.subject_id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        fetchData(value);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.subject_id) {
            toast.error("Please fill in all fields.");
            return;
        }

        setSubmitting(true);
        try {
            if (editingId) {
                const res = await updateUnit(editingId, formData);
                if (res.success) {
                    toast.success("Unit updated successfully!");
                    setEditingId(null);
                    setFormData(prev => ({ ...prev, title: "", bgImage: "" }));
                    fetchData(search);
                } else {
                    toast.error(res.error || "Failed to update unit.");
                }
            } else {
                const res = await createUnit(formData);
                if (res.success) {
                    toast.success("Unit created successfully!");
                    setFormData(prev => ({ ...prev, title: "", bgImage: "" }));
                    fetchData(search);
                } else {
                    toast.error(res.error || "Failed to create unit.");
                }
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (unit: Unit) => {
        setEditingId(unit.id);
        setFormData({
            subject_id: unit.subject_id,
            title: unit.title,
            bgImage: unit.bgImage || "",
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this unit?")) {
            try {
                const res = await deleteUnit(id);
                if (res.success) {
                    toast.success("Unit deleted successfully!");
                    fetchData(search);
                } else {
                    toast.error(res.error || "Failed to delete unit.");
                }
            } catch (error) {
                toast.error("An unexpected error occurred.");
            }
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({
            subject_id: subjects[0]?.id || "",
            title: "",
            bgImage: "",
        });
    };

    const groupedUnits: GroupedUnits[] = subjects.map(subject => ({
        subject: subject.name,
        color: subject.color,
        units: units.filter(u => u.subject_id === subject.id || u.subjectName === subject.name)
    })).filter(group => group.units.length > 0);

    // Handle units with no subject matching (if any)
    const orphanedUnits = units.filter(u => !subjects.some(s => s.id === u.subject_id || s.name === u.subjectName));
    if (orphanedUnits.length > 0) {
        groupedUnits.push({
            subject: "Others",
            color: "var(--text-gray)",
            units: orphanedUnits
        });
    }

    return (
        <div className="UnitManager">
            <div className="UnitManager__header">
                <h1>Manage Units</h1>
                <p>Organize your course curriculum into manageable teaching blocks.</p>
            </div>

            <div className="UnitManager__create-card">
                <div className="SubjectManager__form-title">
                    <PlusCircle size={24} color="var(--doodle-blue)" />
                    <span>{editingId ? "Edit Unit" : "Add New Unit"}</span>
                </div>

                <div className="UnitManager__form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '24px', alignItems: 'flex-end' }}>
                    <div className="UnitManager__field">
                        <label className="UnitManager__field-label">Select Subject</label>
                        <div className="FlashcardForm__select-group" style={{ width: '100%' }}>
                            <select
                                className="SubjectManager__input"
                                value={formData.subject_id}
                                onChange={(e) => setFormData(p => ({ ...p, subject_id: e.target.value }))}
                            >
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="UnitManager__field">
                        <label className="UnitManager__field-label">Unit Name</label>
                        <input
                            type="text"
                            className="SubjectManager__input"
                            placeholder="e.g. Intro to Mechanics"
                            value={formData.title}
                            onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                        />
                    </div>

                    <div className="UnitManager__field">
                        <label className="UnitManager__field-label">Background Image URL</label>
                        <input
                            type="text"
                            className="SubjectManager__input"
                            placeholder="e.g. https://images.unsplash..."
                            value={formData.bgImage}
                            onChange={(e) => setFormData(p => ({ ...p, bgImage: e.target.value }))}
                        />
                    </div>

                    <div className="UnitManager__actions" style={{ display: 'flex', gap: '8px' }}>
                        {editingId && (
                            <button className="btn--outline-gray" onClick={cancelEdit} style={{ padding: '12px 24px' }}>
                                Cancel
                            </button>
                        )}
                        <Button
                            className="btn-3d--teal"
                            style={{ padding: '12px 32px' }}
                            onClick={handleSave}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    <Plus size={18} style={{ marginRight: editingId ? '0' : '8px' }} />
                                    {editingId ? "Update Unit" : "Create Unit"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="SubjectManager__list-header">
                <h2>Available Units</h2>
                <div className="AdminHeader__right">
                    <div className="AdminHeader__search">
                        <Search size={18} color="var(--text-gray)" />
                        <input
                            type="text"
                            placeholder="Search units..."
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
            </div>

            <div className="UnitManager__content" style={{ minHeight: '300px', position: 'relative' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
                        <Loader2 size={32} className="animate-spin" color="var(--doodle-blue)" />
                    </div>
                ) : units.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-gray)' }}>
                        No units found.
                    </div>
                ) : (
                    groupedUnits.map((group, index) => (
                        <div key={index} className="UnitManager__group">
                            <div className="UnitManager__group-header">
                                <div className="UnitManager__group-accent" style={{ backgroundColor: group.color }}></div>
                                <span className="UnitManager__group-title">{group.subject}</span>
                                <span className="UnitManager__group-count">{group.units.length} Unit{group.units.length !== 1 ? 's' : ''}</span>
                            </div>

                            <div className="UnitList">
                                {group.units.map(unit => (
                                    <div key={unit.id} className="UnitListItem">
                                        <div className="UnitListItem__left">
                                            <div className="UnitListItem__icon-box">
                                                <Sigma size={22} />
                                            </div>
                                            <div className="UnitListItem__info">
                                                <h3>{unit.title}</h3>
                                                <div className="UnitListItem__meta">
                                                    <span><FileText size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {unit.cardCount} Flashcards</span>
                                                    <span><Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Updated {unit.lastUpdated}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="UnitListItem__actions">
                                            <button className="UnitListItem__action-btn" onClick={() => handleEdit(unit)}>
                                                <Edit2 size={18} />
                                            </button>
                                            <button className="UnitListItem__action-btn" style={{ color: 'var(--doodle-red)' }} onClick={() => handleDelete(unit.id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
