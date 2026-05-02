


// app/onboarding/page.tsx

import { redirect } from 'next/navigation';
import { selectTeacherAction } from './actions';
import { getTeachers } from '../admin/actions/teacherAction';
import { ShieldCheck, Lock, Headphones } from "lucide-react";


export default async function OnboardingPage() {

    
  


  const teachers = await getTeachers();

  return (
    <div className="LoginPage">
    
        <div className="LoginHeader">
            <h1 className="LoginHeader__title">
                Welcome to Your Learning Space
            </h1>
            <p className="LoginHeader__subtitle">
                Please select your teacher to continue your registration.
            </p>
        </div>

        <div className="LoginCard">
            <div className="LoginCard__body" style={{ padding: "40px", width: "100%", maxWidth: "400px", margin: "0 auto" }}>
                <form action={selectTeacherAction} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label htmlFor="teacherId" style={{ fontWeight: 600, color: "var(--text-black)" }}>Select Teacher</label>
                        <select 
                            name="teacherId" 
                            id="teacherId" 
                            className="input-field" 
                            style={{ padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", width: "100%", fontSize: "16px" }}
                            required
                            defaultValue="admin"
                        >
                            <option key="admin" value="admin" >Admin</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn-3d" style={{ width: "100%" }}>
                        Complete Sign Up
                    </button>
                </form>
            </div>
        </div>

        <div className="LoginFooter-meta">
            <div className="LoginFooter-meta__item">
                <ShieldCheck size={16} />
                <span>SSL Secure Connection</span>
            </div>
            <div className="LoginFooter-meta__item">
                <Lock size={16} />
                <span>Data Protection Compliant</span>
            </div>
            <div className="LoginFooter-meta__item">
                <Headphones size={16} />
                <span>24/7 Support</span>
            </div>
        </div>
    </div>
  );
}