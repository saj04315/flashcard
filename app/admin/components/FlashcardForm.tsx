"use client";

import React, { useState } from "react";
import Editor from 'react-simple-wysiwyg';
import { Camera } from "lucide-react";

export default function FlashcardForm() {
    const [questionHtml, setQuestionHtml] = useState('');
    const [answerHtml, setAnswerHtml] = useState('');

    function onQuestionChange(e: any) {
        setQuestionHtml(e.target.value);
    }

    function onAnswerChange(e: any) {
        setAnswerHtml(e.target.value);
    }

    const clearForm = () => {
        setQuestionHtml('');
        setAnswerHtml('');
    };

    return (
        <div className="FlashcardForm-card">
            <div className="FlashcardForm-card__header">
                <h2>Create New Flashcard</h2>
                <p>Design a new learning asset with rich content for your students.</p>
            </div>

            <div className="FlashcardForm-card__body">
                <div className="FlashcardForm__grid">
                    {/* QUETION AREA */}
                    <div className="FlashcardForm__section">
                        <h4 className="FlashcardForm__section-title">Question Content</h4>
                        <div className="FlashcardForm__editor">
                            <Editor
                                value={questionHtml}
                                onChange={onQuestionChange}
                                containerProps={{ style: { height: '220px', border: 'none' } }}
                            />
                        </div>
                        <div className="FlashcardForm__upload-box">
                            <Camera size={20} />
                            <span>Upload Question Image (Optional)</span>
                        </div>
                    </div>

                    {/* ANSWER AREA */}
                    <div className="FlashcardForm__section">
                        <h4 className="FlashcardForm__section-title">Answer Content</h4>
                        <div className="FlashcardForm__editor">
                            <Editor
                                value={answerHtml}
                                onChange={onAnswerChange}
                                containerProps={{ style: { height: '220px', border: 'none' } }}
                            />
                        </div>
                        <div className="FlashcardForm__upload-box">
                            <Camera size={20} />
                            <span>Upload Answer Image (Optional)</span>
                        </div>
                    </div>
                </div>

                <div className="FlashcardForm__footer">
                    <div className="FlashcardForm__section">
                        <h4 className="FlashcardForm__section-title">Unit Selector</h4>
                        <div className="FlashcardForm__select-group">
                            <select className="FlashcardForm__select">
                                <option>Select Unit...</option>
                                <option>Unit 1: The Solar System</option>
                                <option>Unit 2: Plant Biology</option>
                            </select>
                        </div>
                    </div>
                    <button className="btn--outline-gray" onClick={clearForm}>Clear Form</button>
                </div>
            </div>
        </div>
    );
}
