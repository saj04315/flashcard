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
import { toast } from "sonner";
import { syncUsers, getStudents, approveStudent, deleteStudent, changeRoleToTeacher, type Student } from "../actions/userActions";
import { getTeachers, type Teacher } from "../actions/teacherAction";
import { ArrowRightLeft, Filter } from "lucide-react";

interface StudentManagerProps {
    teacherId?: string;
    role?: string | null;
}

export default function StudentManager({ teacherId, role }: StudentManagerProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchStudents = useCallback(async (searchTerm: string = "", teacherFilter: string = "all") => {
        setLoading(true);
        // If teacherId prop is present, it takes precedence (likely a teacher viewing their own students)
        // Otherwise use the selected filter
        const effectiveTeacherId = teacherId || (teacherFilter === "all" ? undefined : teacherFilter);
        const data = await getStudents(searchTerm, effectiveTeacherId);
        setStudents(data);
        setLoading(false);
    }, [teacherId]);

    useEffect(() => {
        const init = async () => {
            setIsSyncing(true);
            await syncUsers();
            
            if (!teacherId) {
                const teachersData = await getTeachers();
                setTeachers(teachersData);
            }
            
            setIsSyncing(false);
            fetchStudents(search, selectedTeacher);
        };
        init();
    }, [fetchStudents, teacherId]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        fetchStudents(value, selectedTeacher);
    };

    const handleTeacherFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedTeacher(value);
        fetchStudents(search, value);
    };

    const handleApprove = async (id: string) => {
        if (confirm("Are you sure you want to approve this student?")) {
            try {
                const res = await approveStudent(id);
                if (res.success) {
                    toast.success("Student approved successfully!");
                    fetchStudents(search);
                } else {
                    toast.error(res.error || "Failed to approve student.");
                }
            } catch (error) {
                toast.error("An unexpected error occurred.");
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this student?")) {
            try {
                const res = await deleteStudent(id);
                if (res.success) {
                    toast.success("Student deleted successfully!");
                    fetchStudents(search);
                } else {
                    toast.error(res.error || "Failed to delete student.");
                }
            } catch (error) {
                toast.error("An unexpected error occurred.");
            }
        }
    };

    const handleChangeToTeacher = async (id: string) => {
        if (confirm("Are you sure you want to change this user's role to Teacher?")) {
            try {
                const res = await changeRoleToTeacher(id);
                if (res.success) {
                    toast.success("Role changed to Teacher successfully!");
                    fetchStudents(search);
                } else {
                    toast.error(res.error || "Failed to change role.");
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
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {!teacherId && teachers.length > 0 && (
                            <div className="AdminHeader__search" style={{ padding: '0 8px', minWidth: '180px' }}>
                                <Filter size={18} color="var(--text-gray)" />
                                <select
                                    value={selectedTeacher}
                                    onChange={handleTeacherFilterChange}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        fontSize: '14px',
                                        color: 'var(--text-main)',
                                        outline: 'none',
                                        width: '100%',
                                        padding: '8px 4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="all">All Teachers</option>
                                    <option value="admin">Admin (No Teacher)</option>
                                    {teachers.map(teacher => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
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
                                    <th>Teacher</th>
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
                                            <td><span style={{ fontWeight: 500 }}>{student.teacherName || "Admin"}</span></td>
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

                                                    {role !== 'teacher' && student.status.toLowerCase() === 'active' && (
                                                        <button
                                                            className="StudentTable__action-btn"
                                                            title="Change to Teacher"
                                                            onClick={() => handleChangeToTeacher(student.id)}
                                                        >
                                                            <ArrowRightLeft size={16} />
                                                        </button>
                                                    )}
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
