"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Trash2, CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getTeachers, type Teacher } from "../actions/teacherAction";
import { deleteStudent as deleteUser, approveStudent as approveUser } from "../actions/userActions";

export default function TeacherManager() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchTeachers = useCallback(async (searchTerm: string = "") => {
        setLoading(true);
        const data = await getTeachers();
        // apply client-side search since getTeachers doesn't have search param yet
        const filtered = data.filter(t => 
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            t.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setTeachers(filtered);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        fetchTeachers(value);
    };

    const handleApprove = async (id: string) => {
        if (confirm("Are you sure you want to approve this teacher?")) {
            try {
                const res = await approveUser(id);
                if (res.success) {
                    toast.success("Teacher approved successfully!");
                    fetchTeachers(search);
                } else {
                    toast.error(res.error || "Failed to approve teacher.");
                }
            } catch (error) {
                toast.error("An unexpected error occurred.");
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this teacher?")) {
            try {
                const res = await deleteUser(id);
                if (res.success) {
                    toast.success("Teacher deleted successfully!");
                    fetchTeachers(search);
                } else {
                    toast.error(res.error || "Failed to delete teacher.");
                }
            } catch (error) {
                toast.error("An unexpected error occurred.");
            }
        }
    };

    return (
        <div className="StudentManager">
            <div className="UnitManager__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Manage Teachers</h1>
                    <p>View and manage the teacher roster.</p>
                </div>
            </div>

            <div className="StudentManager__roster-card">
                <div className="StudentManager__table-header">
                    <h2>Teacher Roster</h2>
                    <div className="AdminHeader__search">
                        <Search size={18} color="var(--text-gray)" />
                        <input
                            type="text"
                            placeholder="Search teachers..."
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
                        <table className="StudentTable">
                            <thead>
                                <tr>
                                    <th>Teacher Name</th>
                                    <th>Email</th>
                                    <th>Students Count</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
                                            No teachers found.
                                        </td>
                                    </tr>
                                ) : (
                                    teachers.map((teacher) => (
                                        <tr key={teacher.id}>
                                            <td>
                                                <div className="StudentTable__user">
                                                    <div className="StudentTable__avatar">{teacher.initials}</div>
                                                    <span style={{ fontWeight: 700 }}>{teacher.name}</span>
                                                </div>
                                            </td>
                                            <td><span className="StudentTable__email">{teacher.email}</span></td>
                                            <td><span style={{ fontWeight: 500 }}>{teacher.students?.length || 0}</span></td>
                                            <td>
                                                <span className={`StatusBadge ${teacher.status === 'Active' ? 'StatusBadge--active' : 'StatusBadge--pending'}`}>
                                                    {teacher.status || 'Active'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="StudentTable__actions">
                                                    {teacher.status?.toLowerCase() === 'pending' && (
                                                        <button
                                                            className="StudentTable__action-btn StudentTable__action-btn--approve"
                                                            title="Approve"
                                                            onClick={() => handleApprove(teacher.id)}
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        className="StudentTable__action-btn"
                                                        title="Delete"
                                                        onClick={() => handleDelete(teacher.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="StudentManager__footer">
                    <span className="StudentManager__info">Showing {teachers.length} teachers</span>
                    <div className="StudentManager__pagination">
                        <button className="btn--outline-gray" style={{ padding: '6px 12px' }}>
                            <ChevronLeft size={18} />
                        </button>
                        <button className="btn--outline-gray" style={{ padding: '6px 12px' }}>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
