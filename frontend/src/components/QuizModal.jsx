import { useState, useEffect } from 'react';
import api from '../api/axios';

const QuizModal = ({ topic, subjectId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quizData, setQuizData] = useState(null);

    // State for tracking user answers
    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [results, setResults] = useState(null);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        generateQuiz();
    }, [topic.id]);

    const generateQuiz = async () => {
        try {
            setLoading(true);
            setError('');
            // Route verified during backend review: /api/subjects/<subject_id>/topics/<topic_id>/generate-quiz
            const res = await api.post(`/subjects/${subjectId}/topics/${topic.id}/generate-quiz`);
            setQuizData(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate quiz. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionIndex, selectedOption) => {
        setAnswers({
            ...answers,
            [questionIndex]: selectedOption
        });
    };

    const submitQuiz = async () => {
        if (!quizData) return;

        // Check if all questions are answered
        if (Object.keys(answers).length < quizData.questions.length) {
            setSubmitError('Please answer all questions before submitting.');
            return;
        }

        setSubmitError('');
        setIsSubmitted(true);

        // Calculate score on the frontend as requested
        let score = 0;
        const itemizedResults = quizData.questions.map((q, idx) => {
            const correctAnswerStr = q.options[q.correct_index];
            const isCorrect = answers[idx] === correctAnswerStr;
            if (isCorrect) score += 1;
            return {
                question: q.question,
                selected: answers[idx],
                correct: correctAnswerStr,
                isCorrect,
                explanation: q.explanation
            };
        });

        try {
            // Send the score purely for DB tracking & validation
            // Verified backend format: /api/topics/<int:topic_id>/quiz/submit  POST {"score": X, "total": Y}
            await api.post(`/topics/${topic.id}/quiz/submit`, {
                score: score,
                total: quizData.questions.length
            });

            setResults({
                score,
                total: quizData.questions.length,
                details: itemizedResults
            });
        } catch (err) {
            setSubmitError(err.response?.data?.error || 'Failed to save quiz results.');
        }
    };

    return (
        <div className="modal-overlay" style={{ background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(8px)' }}>
            <div className="modal-content quiz-modal" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 0, padding: 0 }}>
                <div className="modal-header" style={{ padding: '32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0 }}>{topic.name} Quiz</h3>
                    <button className="close-btn" onClick={onClose} disabled={isSubmitted && !results} style={{ fontSize: '2.5rem', fontWeight: 300, cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--text-primary)' }}>×</button>
                </div>

                <div className="modal-body" style={{ padding: '32px', maxHeight: '70vh', overflowY: 'auto' }}>
                    {loading ? (
                        <div className="loading-state" style={{ textAlign: 'center', padding: '64px' }}>
                            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Generating personalized AI parameters...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state" style={{ padding: '32px', border: '1px solid var(--error-color)', background: 'var(--color-error-bg)', color: 'var(--error-color)', marginBottom: '24px' }}>
                            <p style={{ margin: '0 0 16px 0', fontWeight: 'bold' }}>{error}</p>
                            <button onClick={generateQuiz} style={{ width: 'auto', background: 'transparent', color: 'var(--error-color)', border: '1px solid var(--error-color)' }}>Retry Initialization</button>
                        </div>
                    ) : results ? (
                        <div className="quiz-results">
                            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '32px', color: 'var(--accent-color)' }}>Assessment Complete: {results.score} / {results.total}</h4>
                            <div className="results-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {results.details.map((res, i) => (
                                    <div key={i} className={`result-item ${res.isCorrect ? 'correct' : 'incorrect'}`} style={{ padding: '24px', border: `1px solid ${res.isCorrect ? 'var(--accent-color)' : 'var(--error-color)'}`, background: 'var(--panel-bg)' }}>
                                        <p className="q-text" style={{ fontSize: '1.1rem', marginBottom: '16px', lineHeight: 1.5 }}><strong>{i + 1}.</strong> {res.question}</p>
                                        <p className="a-text" style={{ color: res.isCorrect ? 'var(--accent-color)' : 'var(--error-color)', marginBottom: '8px' }}><strong>Your Input:</strong> {res.selected}</p>
                                        {!res.isCorrect && (
                                            <p className="c-text" style={{ color: 'var(--text-primary)', marginBottom: '8px' }}><strong>Expected:</strong> {res.correct}</p>
                                        )}
                                        {res.explanation && <p className="e-text" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{res.explanation}</p>}
                                    </div>
                                ))}
                            </div>
                            <button onClick={onClose} style={{ marginTop: '32px' }}>Acknowledge</button>
                        </div>
                    ) : quizData ? (
                        <div className="quiz-questions">
                            {submitError && <div className="error-message">{submitError}</div>}

                            {quizData.questions.map((q, qIndex) => (
                                <div key={qIndex} className="question-block" style={{ marginBottom: '40px', paddingBottom: '32px', borderBottom: '1px solid var(--border-color)' }}>
                                    <p className="question-text" style={{ fontSize: '1.25rem', marginBottom: '24px', lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>{qIndex + 1}. {q.question}</p>
                                    <div className="options-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {q.options.map((opt, oIndex) => (
                                            <label key={oIndex} className="option-label" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1px solid var(--border-color)', cursor: 'pointer', background: answers[qIndex] === opt ? 'rgba(255,255,255,0.05)' : 'transparent', transition: 'all 0.2s ease', borderColor: answers[qIndex] === opt ? 'var(--text-primary)' : 'var(--border-color)' }}>
                                                <input
                                                    type="radio"
                                                    name={`question-${qIndex}`}
                                                    value={opt}
                                                    checked={answers[qIndex] === opt}
                                                    onChange={() => handleOptionSelect(qIndex, opt)}
                                                    style={{ margin: 0, width: '20px', height: '20px', accentColor: 'var(--accent-color)' }}
                                                />
                                                <span style={{ fontSize: '1rem', fontFamily: 'var(--font-body)' }}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="quiz-footer" style={{ marginTop: '40px' }}>
                                <button onClick={submitQuiz} disabled={isSubmitted} style={{ background: 'var(--accent-color)', color: 'var(--bg-color)', border: 'none' }}>
                                    {isSubmitted ? 'Transmitting...' : 'Submit Assessment'}
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default QuizModal;
