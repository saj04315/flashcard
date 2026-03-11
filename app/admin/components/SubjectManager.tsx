"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    PlusCircle,
    Search,
    Beaker,
    LayoutGrid,
    Compass,
    Globe,
    Palette,
    Music,
    Activity,
    Code,
    Microscope,
    Triangle,
    Plus,
    BookOpen,
    Trash2,
    Edit2,
    Loader2
} from "lucide-react";
import Button from "../../components/Button";
import { getSubjects, createSubject, updateSubject, deleteSubject, type Subject } from "../actions/subjectActions";

const icons = [
    { id: 'beaker', component: Beaker },
    { id: 'grid', component: LayoutGrid },
    { id: 'compass', component: Compass },
    { id: 'globe', component: Globe },
    { id: 'palette', component: Palette },
    { id: 'music', component: Music },
    { id: 'basketball', component: Activity },
    { id: 'code', component: Code },
    { id: 'microscope', component: Microscope },
    { id: 'triangle', component: Triangle },
    { id: 'book', component: BookOpen },
];

const colors = [
    '#FCA5A5', // Pastel Red
    '#A7F3D0', // Pastel Green
    '#BFDBFE', // Pastel Blue
    '#FCD9B6', // Pastel Orange
    '#E9D5FF', // Pastel Purple
    '#CBD5E1', // Pastel Gray
];

export default function SubjectManager() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        color: colors[2],
        icon: 'globe'
    });

    const fetchSubjects = useCallback(async (searchTerm: string = "") => {
        setLoading(true);
        const data = await getSubjects(searchTerm);
        setSubjects(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        fetchSubjects(value);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.name) {
            alert("Please enter a subject name.");
            return;
        }

        setSubmitting(true);
        if (editingId) {
            const res = await updateSubject(editingId, formData);
            if (res.success) {
                setEditingId(null);
                setFormData({ name: "", description: "", color: colors[2], icon: 'globe' });
                fetchSubjects(search);
            }
        } else {
            const res = await createSubject(formData);
            if (res.success) {
                setFormData({ name: "", description: "", color: colors[2], icon: 'globe' });
                fetchSubjects(search);
            }
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this subject? All associated units and flashcards might be affected?")) {
            const res = await deleteSubject(id);
            if (res.success) {
                fetchSubjects(search);
            }
        }
    };

    const handleEdit = (subject: Subject) => {
        setEditingId(subject.id);
        setFormData({
            name: subject.name,
            description: subject.description,
            color: subject.color,
            icon: subject.icon
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ name: "", description: "", color: colors[2], icon: 'globe' });
    };

    const getIconComponent = (iconId: string) => {
        const iconDef = icons.find(i => i.id === iconId);
        return iconDef ? iconDef.component : Globe;
    };

    return (
        <div className="SubjectManager">
            <div className="SubjectManager__header">
                <h1>Manage Subjects</h1>
                <p>Create, organize, and monitor your curriculum subjects</p>
            </div>

            <div className="SubjectManager__create-card">
                <div className="SubjectManager__form-title">
                    <PlusCircle size={24} color="var(--doodle-blue)" />
                    <span>{editingId ? "Edit Subject" : "Create New Subject"}</span>
                </div>

                <div className="SubjectManager__form-grid">
                    <div className="SubjectManager__form-left">
                        <div className="SubjectManager__field">
                            <label className="SubjectManager__field-label">Subject Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                className="SubjectManager__input"
                                placeholder="e.g. Advanced Mathematics"
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
                                <span>{formData.description.length}/100 max charaters</span>
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
                        <label className="SubjectManager__field-label">Subject Icon</label>
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
                        className="btn-3d--teal"
                        style={{ padding: '12px 32px' }}
                        onClick={handleSave}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            editingId ? "Update Subject" : "Save Subject"
                        )}
                    </Button>
                </div>
            </div>

            <div className="SubjectManager__list-header">
                <h2>
                    <LayoutGrid size={24} color="var(--doodle-blue)" />
                    Available Subjects
                </h2>
                <div className="AdminHeader__search">
                    <Search size={18} color="var(--text-gray)" />
                    <input
                        type="text"
                        placeholder="Search subjects..."
                        value={search}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <div style={{ minHeight: '300px', position: 'relative' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
                        <Loader2 size={32} className="animate-spin" color="var(--doodle-blue)" />
                    </div>
                ) : (
                    <div className="SubjectManager__grid">
                        {subjects.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
                                No subjects found.
                            </div>
                        ) : (
                            subjects.map(subject => {
                                const Icon = getIconComponent(subject.icon);
                                return (
                                    <div key={subject.id} className="SubjectItem-card" style={{ borderTopColor: subject.color }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div className="SubjectItem-card__icon" style={{ backgroundColor: `${subject.color}15`, color: subject.color }}>
                                                <Icon size={24} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    className="StudentTable__action-btn"
                                                    title="Edit"
                                                    onClick={() => handleEdit(subject)}
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    className="StudentTable__action-btn"
                                                    title="Delete"
                                                    style={{ color: '#EF4444' }}
                                                    onClick={() => handleDelete(subject.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="SubjectItem-card__title">{subject.name}</h3>
                                        <p className="SubjectItem-card__desc">{subject.description}</p>
                                        <div className="SubjectItem-card__stats">
                                            <span className="SubjectItem-card__stat">● {subject.unitsCount || 0} Units</span>
                                            <span className="SubjectItem-card__stat">● {subject.studentsCount || 0} Students</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        <div className="SubjectItem-card SubjectItem-card--add" onClick={() => {
                            setEditingId(null);
                            setFormData({ name: "", description: "", color: colors[2], icon: 'globe' });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} style={{ cursor: 'pointer' }}>
                            <Plus size={32} color="#94A3B8" />
                            <span>Add New Subject</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
