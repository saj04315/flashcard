"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    UserPlus,
    Search,
    Download,
    Upload,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Users,
    Loader2
} from "lucide-react";
import Button from "../../components/Button";
import { syncUsers, getStudents, approveStudent, deleteStudent, type Student } from "../actions/userActions";

export default function StudentManager() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchStudents = useCallback(async (searchTerm: string = "") => {
        setLoading(true);
        const data = await getStudents(searchTerm);
        setStudents(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        const init = async () => {
            setIsSyncing(true);
            await syncUsers();
            setIsSyncing(false);
            fetchStudents();
        };
        init();
    }, [fetchStudents]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        // Debounce search ideally, but for now direct fetch
        fetchStudents(value);
    };

    const handleApprove = async (id: string) => {
        if (confirm("Are you sure you want to approve this student?")) {
            const res = await approveStudent(id);
            if (res.success) {
                fetchStudents(search);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this student?")) {
            const res = await deleteStudent(id);
            if (res.success) {
                fetchStudents(search);
            }
        }
    };

    return (
        <div className="StudentManager">
            <div className="UnitManager__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Manage Students</h1>
                    <p>Enroll new students and manage the current roster.</p>
                </div>
                {isSyncing && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-gray)' }}>
                        <Loader2 size={16} className="animate-spin" />
                        Syncing with Clerk...
                    </div>
                )}
            </div>

            <div className="StudentManager__roster-card">
                <div className="StudentManager__table-header">
                    <h2>Student Roster</h2>
                    <div className="AdminHeader__search">
                        <Search size={18} color="var(--text-gray)" />
                        <input
                            type="text"
                            placeholder="Search roster..."
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
                                    <th>Student Name</th>
                                    <th>Email</th>
                                    <th>Grade</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-gray)' }}>
                                            No students found.
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => (
                                        <tr key={student.id}>
                                            <td>
                                                <div className="StudentTable__user">
                                                    <div className="StudentTable__avatar">{student.initials}</div>
                                                    <span style={{ fontWeight: 700 }}>{student.name}</span>
                                                </div>
                                            </td>
                                            <td><span className="StudentTable__email">{student.email}</span></td>
                                            <td><span style={{ fontWeight: 500 }}>{student.grade || "N/A"}</span></td>
                                            <td>
                                                <span className={`StatusBadge ${student.status === 'Active' ? 'StatusBadge--active' : 'StatusBadge--pending'}`}>
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="StudentTable__actions">
                                                    {student.status.toLowerCase() === 'pending' && (
                                                        <>
                                                            <button
                                                                className="StudentTable__action-btn StudentTable__action-btn--approve"
                                                                title="Approve"
                                                                onClick={() => handleApprove(student.id)}
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                   
                                                    <button
                                                        className="StudentTable__action-btn"
                                                        title="Delete"
                                                        onClick={() => handleDelete(student.id)}
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
                    <span className="StudentManager__info">Showing {students.length} students</span>
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
