"use client";

import React, { useState, useEffect, useRef } from "react";
import Editor from 'react-simple-wysiwyg';
import { Camera, Loader2, X, CheckCircle, Image as ImageIcon, ChevronUp, ChevronDown, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { createFlashcard, updateFlashcard, getFlashcards, updateFlashcardOrders, deleteFlashcard, type Flashcard } from "../actions/flashcardActions";
import { uploadImage } from "@/lib/appwrite";
import { getSubjects, type Subject } from "../actions/subjectActions";
import { getUnitsBySubject, type Unit } from "../actions/unitActions";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setAccentColor } from "../../store/themeSlice";

export default function FlashcardForm() {
    const dispatch = useAppDispatch();
    const globalAccentColor = useAppSelector((state) => state.theme.accentColor);

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [loadingCards, setLoadingCards] = useState(false);

    // Selection state
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [selectedUnitId, setSelectedUnitId] = useState("");

    // Content state
    const [questionHtml, setQuestionHtml] = useState('');
    const [answerHtml, setAnswerHtml] = useState('');
    const [questionImage, setQuestionImage] = useState<string | null>(null);
    const [answerImages, setAnswerImages] = useState<string[]>([]);

    // Upload/Submit state
    const [uploadingQuestion, setUploadingQuestion] = useState(false);
    const [uploadingAnswer, setUploadingAnswer] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Edit state
    const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

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
                const subj = subjects.find(s => s.id === selectedSubjectId);
                if (subj && subj.color) {
                    dispatch(setAccentColor(subj.color));
                }
                
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

    useEffect(() => {
        const fetchCards = async () => {
            if (!selectedUnitId) {
                setFlashcards([]);
                return;
            }
            setLoadingCards(true);
            try {
                const cards = await getFlashcards(selectedUnitId);
                setFlashcards(cards);
            } catch (error) {
                console.error("Error fetching flashcards", error);
            } finally {
                setLoadingCards(false);
            }
        };
        fetchCards();
    }, [selectedUnitId]);

    const handleImageUpload = async (file: File, type: 'question' | 'answer') => {
        try {
            if (type === 'question') {
                setUploadingQuestion(true);
                const url = await uploadImage(file);
                setQuestionImage(url);
                toast.success("Question image uploaded successfully!");
            } else {
                if (answerImages.length >= 3) {
                    toast.error("You can only upload up to 3 answer images.");
                    return;
                }
                setUploadingAnswer(true);
                const url = await uploadImage(file);
                setAnswerImages((prev) => [...prev, url]);
                toast.success("Answer image uploaded successfully!");
            }
        } catch (error) {
            toast.error("Upload failed. Make sure Appwrite is configured correctly.");
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

    const handleEditCard = (card: Flashcard) => {
        setEditingCard(card);
        setQuestionHtml(card.question);
        setAnswerHtml(card.answer);
        setQuestionImage(card.questionImage || null);
        setAnswerImages(card.answerImages || []);
        // Scroll to the top of the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async () => {
        if (!selectedUnitId) {
            toast.error("Please select a unit.");
            return;
        }
        if (!questionHtml || !answerHtml) {
            toast.error("Question and Answer content cannot be empty.");
            return;
        }

        setSubmitting(true);
        try {
            let res;
            if (editingCard) {
                res = await updateFlashcard(editingCard.id, {
                    question: questionHtml,
                    answer: answerHtml,
                    questionImage: questionImage || null,
                    answerImages: answerImages.length > 0 ? answerImages : [],
                });
                if (res.success) {
                    toast.success("Flashcard updated successfully!");
                }
            } else {
                res = await createFlashcard({
                    unit_id: selectedUnitId,
                    question: questionHtml,
                    answer: answerHtml,
                    questionImage: questionImage || undefined,
                    answerImages: answerImages.length > 0 ? answerImages : undefined,
                });
                if (res.success) {
                    toast.success("Flashcard saved successfully!");
                }
            }

            if (res.success) {
                clearForm();
                const cards = await getFlashcards(selectedUnitId);
                setFlashcards(cards);
            } else {
                toast.error("Failed to save flashcard: " + res.error);
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    const clearForm = () => {
        setQuestionHtml('');
        setAnswerHtml('');
        setQuestionImage(null);
        setAnswerImages([]);
        setEditingCard(null);
    };

    const handleMoveUp = async (index: number) => {
        if (index === 0) return;
        const newFlashcards = [...flashcards];
        const temp = newFlashcards[index];
        newFlashcards[index] = newFlashcards[index - 1];
        newFlashcards[index - 1] = temp;
        
        newFlashcards.forEach((card, i) => card.order = i);
        setFlashcards(newFlashcards);

        const updates = newFlashcards.map((card, i) => ({ id: card.id, order: i }));
        await updateFlashcardOrders(updates);
    };

    const handleMoveDown = async (index: number) => {
        if (index === flashcards.length - 1) return;
        const newFlashcards = [...flashcards];
        const temp = newFlashcards[index];
        newFlashcards[index] = newFlashcards[index + 1];
        newFlashcards[index + 1] = temp;

        newFlashcards.forEach((card, i) => card.order = i);
        setFlashcards(newFlashcards);

        const updates = newFlashcards.map((card, i) => ({ id: card.id, order: i }));
        await updateFlashcardOrders(updates);
    };

    const handleDeleteCard = async (id: string) => {
        if (!confirm("Are you sure you want to delete this flashcard?")) return;
        try {
            const res = await deleteFlashcard(id);
            if (res.success) {
                toast.success("Flashcard deleted!");
                const cards = await getFlashcards(selectedUnitId);
                setFlashcards(cards);
            } else {
                toast.error(res.error || "Failed to delete");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="FlashcardForm-container">
        <div className="FlashcardForm-card">
            <div className="FlashcardForm-card__header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2>{editingCard ? 'Edit Flashcard' : 'Create New Flashcard'}</h2>
                        <p>{editingCard ? 'Update the question, answer, and images for this flashcard.' : 'Design a new learning asset with rich content for your students.'}</p>
                    </div>
                    {editingCard && (
                        <button
                            className="btn--outline-gray"
                            onClick={clearForm}
                            style={{ padding: '8px 16px', fontSize: '13px' }}
                        >
                            Cancel Edit
                        </button>
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

                        {/* RENDER UPLOADED IMAGES ROW */}
                        {answerImages.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                {answerImages.map((imgUrl, index) => (
                                    <div key={index} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '12px', border: '2px solid #E9EEF2', overflow: 'hidden' }}>
                                        <X 
                                            size={16} 
                                            style={{ position: 'absolute', top: '4px', right: '4px', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '50%', color: 'var(--doodle-red)', zIndex: 10 }}
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setAnswerImages(prev => prev.filter((_, i) => i !== index)); 
                                            }} 
                                        />
                                        <div style={{ backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', width: '100%', height: '100%' }}></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div
                            className={`FlashcardForm__upload-box ${answerImages.length >= 3 ? 'FlashcardForm__upload-box--disabled' : ''}`}
                            style={answerImages.length >= 3 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                            onClick={() => !uploadingAnswer && answerImages.length < 3 && answerInputRef.current?.click()}
                        >
                            {uploadingAnswer ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <Camera size={20} />
                                    <span>{answerImages.length >= 3 ? "Max 3 Answer Images Uploaded" : "Upload Answer Image (Optional)"}</span>
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
                        <button className="btn--outline-gray" onClick={clearForm} style={{ padding: '12px 24px' }}>{editingCard ? 'Cancel' : 'Clear Form'}</button>
                        <button
                            className="btn-3d--teal"
                            style={{ padding: '12px 32px', minWidth: '180px' }}
                            onClick={handleSubmit}
                            disabled={submitting || uploadingQuestion || uploadingAnswer}
                        >
                            {submitting ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>{editingCard ? 'Updating...' : 'Saving...'}</span>
                                </div>
                            ) : (
                                editingCard ? 'Update Flashcard' : 'Save Flashcard'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Flashcard List Management */}
        <div className="FlashcardList-section" style={{ marginTop: '40px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--doodle-blue)' }}>Manage Unit Flashcards</h3>
            {loadingCards ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div>
            ) : flashcards.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', border: '2px solid var(--border-color)', color: 'var(--text-gray)' }}>
                    No flashcards created for this unit yet.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {flashcards.map((card, index) => (
                        <div key={card.id || index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', border: `2px solid ${globalAccentColor}`, borderRadius: '12px', padding: '16px', boxSizing: 'border-box' }}>
                            <div style={{ flex: 1, minWidth: 0, marginRight: '16px', maxHeight: '100px', overflow: 'hidden' }}>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-gray)', marginBottom: '4px' }}>Flashcard {index + 1}</div>
                                <div style={{ fontWeight: '600', color: 'var(--doodle-blue)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: card.question }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button onClick={() => handleMoveUp(index)} disabled={index === 0} style={{ padding: '8px', cursor: index === 0 ? 'default' : 'pointer', backgroundColor: 'var(--bg-light)', border: 'none', borderRadius: '8px', opacity: index === 0 ? 0.3 : 1 }}>
                                    <ChevronUp size={18} />
                                </button>
                                <button onClick={() => handleMoveDown(index)} disabled={index === flashcards.length - 1} style={{ padding: '8px', cursor: index === flashcards.length - 1 ? 'default' : 'pointer', backgroundColor: 'var(--bg-light)', border: 'none', borderRadius: '8px', opacity: index === flashcards.length - 1 ? 0.3 : 1 }}>
                                    <ChevronDown size={18} />
                                </button>
                                <button
                                    onClick={() => handleEditCard(card)}
                                    title="Edit flashcard"
                                    style={{ padding: '8px', cursor: 'pointer', backgroundColor: '#EFF6FF', color: '#3B82F6', border: 'none', borderRadius: '8px' }}
                                >
                                    <Pencil size={18} />
                                </button>
                                <button onClick={() => handleDeleteCard(card.id)} style={{ padding: '8px', cursor: 'pointer', backgroundColor: '#FEE2E2', color: 'var(--doodle-red)', border: 'none', borderRadius: '8px' }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        </div>
    );
}
