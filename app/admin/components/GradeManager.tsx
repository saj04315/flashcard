"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    PlusCircle,
    Search,
    GraduationCap,
    School,
    Book,
    Square,
    Circle,
    Triangle,
    Plus,
    Trash2,
    Edit2,
    Loader2
} from "lucide-react";
import Button from "../../components/Button";
import { toast } from "sonner";
import { getGrades, createGrade, updateGrade, deleteGrade, type Grade } from "../actions/gradeActions";

const icons = [
    { id: 'graduation_cap', component: GraduationCap },
    { id: 'school', component: School },
    { id: 'book', component: Book },
    { id: 'square', component: Square },
    { id: 'circle', component: Circle },
    { id: 'triangle', component: Triangle }
];

const colors = [
    '#F28F3B', // Orange
    '#4285F4', // Blue
    '#EA4335', // Red
    '#FBBC05', // Yellow
    '#34A853', // Green
    '#A142F4', // Purple
];

export default function GradeManager() {
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        color: colors[0],
        icon: 'graduation_cap'
    });

    const fetchGrades = useCallback(async (searchTerm: string = "") => {
        setLoading(true);
        const data = await getGrades(searchTerm);
        setGrades(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchGrades();
    }, [fetchGrades]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        fetchGrades(value);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error("Please enter a grade name.");
            return;
        }

        setSubmitting(true);
        try {
            if (editingId) {
                const res = await updateGrade(editingId, formData);
                if (res.success) {
                    toast.success("Grade updated successfully!");
                    setEditingId(null);
                    setFormData({ name: "", description: "", color: colors[0], icon: 'graduation_cap' });
                    fetchGrades(search);
                } else {
                    toast.error(res.error || "Failed to update grade.");
                }
            } else {
                const res = await createGrade(formData);
                if (res.success) {
                    toast.success("Grade created successfully!");
                    setFormData({ name: "", description: "", color: colors[0], icon: 'graduation_cap' });
                    fetchGrades(search);
                } else {
                    toast.error(res.error || "Failed to create grade.");
                }
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this grade? All associated subjects might be affected.")) {
            try {
                const res = await deleteGrade(id);
                if (res.success) {
                    toast.success("Grade deleted successfully!");
                    fetchGrades(search);
                } else {
                    toast.error(res.error || "Failed to delete grade.");
                }
            } catch (error) {
                toast.error("An unexpected error occurred.");
            }
        }
    };

    const handleEdit = (grade: Grade) => {
        setEditingId(grade.id);
        setFormData({
            name: grade.name,
            description: grade.description,
            color: grade.color,
            icon: grade.icon
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ name: "", description: "", color: colors[0], icon: 'graduation_cap' });
    };

    const getIconComponent = (iconId: string) => {
        const iconDef = icons.find(i => i.id === iconId);
        return iconDef ? iconDef.component : GraduationCap;
    };

    return (
        <div className="SubjectManager">
            <div className="SubjectManager__header">
                <h1>Manage Grades</h1>
                <p>Create, organize, and monitor educational grades/levels</p>
            </div>

            <div className="SubjectManager__create-card">
                <div className="SubjectManager__form-title">
                    <PlusCircle size={24} color="var(--doodle-orange, #F28F3B)" />
                    <span>{editingId ? "Edit Grade" : "Create New Grade"}</span>
                </div>

                <div className="SubjectManager__form-grid">
                    <div className="SubjectManager__form-left">
                        <div className="SubjectManager__field">
                            <label className="SubjectManager__field-label">Grade Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                className="SubjectManager__input"
                                placeholder="e.g. 10th Grade"
                            />
                        </div>
                        <div className="SubjectManager__field" style={{ marginTop: '24px' }}>
                            <label className="SubjectManager__field-label">Description</label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleFormChange}
                                className="SubjectManager__input"
                                placeholder="Brief description..."
                                maxLength={100}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '10px', color: 'var(--text-gray)', marginTop: '4px' }}>
                                <span>{formData.description.length}/100 max characters</span>
                            </div>
                        </div>
                        <div className="SubjectManager__field" style={{ marginTop: '24px' }}>
                            <label className="SubjectManager__field-label">Theme Color</label>
                            <div className="SubjectManager__color-options">
                                {colors.map(color => (
                                    <button
                                        key={color}
                                        className={`SubjectManager__color-btn ${formData.color === color ? "SubjectManager__color-btn--active" : ""}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="SubjectManager__form-right">
                        <label className="SubjectManager__field-label">Grade Icon</label>
                        <div className="SubjectManager__icon-grid">
                            {icons.map(icon => (
                                <button
                                    key={icon.id}
                                    className={`SubjectManager__icon-btn ${formData.icon === icon.id ? "SubjectManager__icon-btn--active" : ""}`}
                                    onClick={() => setFormData(prev => ({ ...prev, icon: icon.id }))}
                                >
                                    <icon.component size={20} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="SubjectManager__save-container" style={{ gap: '12px' }}>
                    {editingId && (
                        <button
                            className="btn--outline-gray"
                            onClick={cancelEdit}
                            style={{ padding: '10px 24px' }}
                        >
                            Cancel
                        </button>
                    )}
                    <Button
                        className="btn-3d--orange"
                        style={{ padding: '12px 32px' }}
                        onClick={handleSave}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            editingId ? "Update Grade" : "Save Grade"
                        )}
                    </Button>
                </div>
            </div>

            <div className="SubjectManager__list-header">
                <h2>
                    <GraduationCap size={24} color="var(--doodle-orange, #F28F3B)" />
                    Available Grades
                </h2>
                <div className="AdminHeader__search">
                    <Search size={18} color="var(--text-gray)" />
                    <input
                        type="text"
                        placeholder="Search grades..."
                        value={search}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <div style={{ minHeight: '300px', position: 'relative' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
                        <Loader2 size={32} className="animate-spin" color="var(--doodle-orange, #F28F3B)" />
                    </div>
                ) : (
                    <div className="SubjectManager__grid">
                        {grades.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
                                No grades found.
                            </div>
                        ) : (
                            grades.map(grade => {
                                const Icon = getIconComponent(grade.icon);
                                return (
                                    <div key={grade.id} className="SubjectItem-card" style={{ borderTopColor: grade.color }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div className="SubjectItem-card__icon" style={{ backgroundColor: `${grade.color}15`, color: grade.color }}>
                                                <Icon size={24} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    className="StudentTable__action-btn"
                                                    title="Edit"
                                                    onClick={() => handleEdit(grade)}
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    className="StudentTable__action-btn"
                                                    title="Delete"
                                                    style={{ color: 'var(--doodle-red)' }}
                                                    onClick={() => handleDelete(grade.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="SubjectItem-card__title">{grade.name}</h3>
                                        <p className="SubjectItem-card__desc">{grade.description}</p>
                                        <div className="SubjectItem-card__stats">
                                            <span className="SubjectItem-card__stat">● {grade.subjectCount || 0} Subjects</span>
                                            <span className="SubjectItem-card__stat">● {grade.studentsCount || 0} Students</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        <div className="SubjectItem-card SubjectItem-card--add" onClick={() => {
                            setEditingId(null);
                            setFormData({ name: "", description: "", color: colors[0], icon: 'graduation_cap' });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} style={{ cursor: 'pointer' }}>
                            <Plus size={32} color="var(--text-gray)" />
                            <span>Add New Grade</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
