"use client";

import React, { useState, useEffect, useRef } from "react";
import Editor from 'react-simple-wysiwyg';
import { Camera, Loader2, X, CheckCircle, Image as ImageIcon } from "lucide-react";
import { createFlashcard } from "../actions/flashcardActions";
import { uploadImage } from "@/lib/appwrite";
import { getSubjects, type Subject } from "../actions/subjectActions";
import { getUnitsBySubject, type Unit } from "../actions/unitActions";

export default function FlashcardForm() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Selection state
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [selectedUnitId, setSelectedUnitId] = useState("");

    // Content state
    const [questionHtml, setQuestionHtml] = useState('');
    const [answerHtml, setAnswerHtml] = useState('');
    const [questionImage, setQuestionImage] = useState<string | null>(null);
    const [answerImage, setAnswerImage] = useState<string | null>(null);

    // Upload/Submit state
    const [uploadingQuestion, setUploadingQuestion] = useState(false);
    const [uploadingAnswer, setUploadingAnswer] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const questionInputRef = useRef<HTMLInputElement>(null);
    const answerInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingData(true);
            const subjectsData = await getSubjects();
            setSubjects(subjectsData);
            if (subjectsData.length > 0) {
                setSelectedSubjectId(subjectsData[0].id);
            }
            setLoadingData(false);
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchUnits = async () => {
            if (selectedSubjectId) {
                console.log("Fetching units for subject:", selectedSubjectId);
                setLoadingData(true);
                try {
                    const filteredUnits = await getUnitsBySubject(selectedSubjectId);
                    console.log("Filtered units received:", filteredUnits);
                    setUnits(filteredUnits);
                    if (filteredUnits.length > 0) {
                        setSelectedUnitId(filteredUnits[0].id);
                    } else {
                        setSelectedUnitId("");
                    }
                } catch (error) {
                    console.error("Error fetching units:", error);
                    setUnits([]);
                    setSelectedUnitId("");
                } finally {
                    setLoadingData(false);
                }
            } else {
                setUnits([]);
                setSelectedUnitId("");
            }
        };
        fetchUnits();
    }, [selectedSubjectId]);

    const handleImageUpload = async (file: File, type: 'question' | 'answer') => {
        try {
            if (type === 'question') setUploadingQuestion(true);
            else setUploadingAnswer(true);

            const url = await uploadImage(file);

            if (type === 'question') setQuestionImage(url);
            else setAnswerImage(url);
        } catch (error) {
            alert("Upload failed. Make sure Appwrite is configured correctly.");
        } finally {
            setUploadingQuestion(false);
            setUploadingAnswer(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'question' | 'answer') => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file, type);
        }
    };

    const handleSubmit = async () => {
        if (!selectedUnitId) {
            alert("Please select a unit.");
            return;
        }
        if (!questionHtml || !answerHtml) {
            alert("Question and Answer content cannot be empty.");
            return;
        }

        setSubmitting(true);
        const res = await createFlashcard({
            unit_id: selectedUnitId,
            question: questionHtml,
            answer: answerHtml,
            questionImage: questionImage || undefined,
            answerImage: answerImage || undefined,
        });

        if (res.success) {
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                clearForm();
            }, 3000);
        } else {
            alert("Failed to save flashcard: " + res.error);
        }
        setSubmitting(false);
    };

    const clearForm = () => {
        setQuestionHtml('');
        setAnswerHtml('');
        setQuestionImage(null);
        setAnswerImage(null);
        setSuccess(false);
    };

    return (
        <div className="FlashcardForm-card">
            <div className="FlashcardForm-card__header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2>Create New Flashcard</h2>
                        <p>Design a new learning asset with rich content for your students.</p>
                    </div>
                    {success && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', background: '#DCFCE7', padding: '8px 16px', borderRadius: '8px' }}>
                            <CheckCircle size={20} />
                            <span style={{ fontWeight: 500 }}>Card Saved Successfully!</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="FlashcardForm-card__body">
                <div className="FlashcardForm__grid">
                    {/* QUESTION AREA */}
                    <div className="FlashcardForm__section">
                        <h4 className="FlashcardForm__section-title">Question Content</h4>
                        <div className="FlashcardForm__editor text-black">
                            <Editor
                                value={questionHtml}
                                onChange={(e) => setQuestionHtml(e.target.value)}
                                containerProps={{ style: { height: '220px', border: 'none' } }}
                            />
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            ref={questionInputRef}
                            onChange={(e) => handleFileChange(e, 'question')}
                        />

                        <div
                            className={`FlashcardForm__upload-box ${questionImage ? 'FlashcardForm__upload-box--active' : ''}`}
                            onClick={() => !uploadingQuestion && questionInputRef.current?.click()}
                        >
                            {uploadingQuestion ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : questionImage ? (
                                <>
                                    <X size={16} className="FlashcardForm__remove-img" onClick={(e) => { e.stopPropagation(); setQuestionImage(null); }} />
                                    <div className="FlashcardForm__img-preview" style={{ backgroundImage: `url(${questionImage})` }}></div>
                                    <span>Image Uploaded</span>
                                </>
                            ) : (
                                <>
                                    <Camera size={20} />
                                    <span>Upload Question Image (Optional)</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ANSWER AREA */}
                    <div className="FlashcardForm__section">
                        <h4 className="FlashcardForm__section-title">Answer Content</h4>
                        <div className="FlashcardForm__editor text-black">
                            <Editor
                                value={answerHtml}
                                onChange={(e) => setAnswerHtml(e.target.value)}
                                containerProps={{ style: { height: '220px', border: 'none' } }}
                            />
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            ref={answerInputRef}
                            onChange={(e) => handleFileChange(e, 'answer')}
                        />

                        <div
                            className={`FlashcardForm__upload-box ${answerImage ? 'FlashcardForm__upload-box--active' : ''}`}
                            onClick={() => !uploadingAnswer && answerInputRef.current?.click()}
                        >
                            {uploadingAnswer ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : answerImage ? (
                                <>
                                    <X size={16} className="FlashcardForm__remove-img" onClick={(e) => { e.stopPropagation(); setAnswerImage(null); }} />
                                    <div className="FlashcardForm__img-preview" style={{ backgroundImage: `url(${answerImage})` }}></div>
                                    <span>Image Uploaded</span>
                                </>
                            ) : (
                                <>
                                    <Camera size={20} />
                                    <span>Upload Answer Image (Optional)</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="FlashcardForm__footer">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1 }}>
                        <div className="FlashcardForm__section">
                            <h4 className="FlashcardForm__section-title">Subject</h4>
                            <div className="FlashcardForm__select-group">
                                <select
                                    className="FlashcardForm__select"
                                    value={selectedSubjectId}
                                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                                    disabled={loadingData}
                                >
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="FlashcardForm__section">
                            <h4 className="FlashcardForm__section-title">Unit</h4>
                            <div className="FlashcardForm__select-group">
                                <select
                                    className="FlashcardForm__select"
                                    value={selectedUnitId}
                                    onChange={(e) => setSelectedUnitId(e.target.value)}
                                    disabled={loadingData || units.length === 0}
                                >
                                    {units.length === 0 ? (
                                        <option value="">No Units Found</option>
                                    ) : (
                                        units.map(u => (
                                            <option key={u.id} value={u.id}>{u.title}</option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', paddingBottom: '4px' }}>
                        <button className="btn--outline-gray" onClick={clearForm} style={{ padding: '12px 24px' }}>Clear Form</button>
                        <button
                            className="btn-3d--teal"
                            style={{ padding: '12px 32px', minWidth: '160px' }}
                            onClick={handleSubmit}
                            disabled={submitting || uploadingQuestion || uploadingAnswer}
                        >
                            {submitting ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Saving...</span>
                                </div>
                            ) : (
                                "Save Flashcard"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
