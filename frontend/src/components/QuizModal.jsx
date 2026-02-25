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
        <div className="modal-overlay">
            <div className="modal-content quiz-modal">
                <div className="modal-header">
                    <h3>{topic.name} Quiz</h3>
                    <button className="close-btn" onClick={onClose} disabled={isSubmitted && !results}>×</button>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Generating personalized AI questions...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>{error}</p>
                            <button onClick={generateQuiz}>Try Again</button>
                        </div>
                    ) : results ? (
                        <div className="quiz-results">
                            <h4>You scored {results.score} out of {results.total}</h4>
                            <div className="results-list">
                                {results.details.map((res, i) => (
                                    <div key={i} className={`result-item ${res.isCorrect ? 'correct' : 'incorrect'}`}>
                                        <p className="q-text"><strong>Q:</strong> {res.question}</p>
                                        <p className="a-text"><strong>Your Answer:</strong> {res.selected}</p>
                                        {!res.isCorrect && (
                                            <p className="c-text"><strong>Correct Answer:</strong> {res.correct}</p>
                                        )}
                                        {res.explanation && <p className="e-text"><em>{res.explanation}</em></p>}
                                    </div>
                                ))}
                            </div>
                            <button onClick={onClose} style={{ marginTop: '24px' }}>Close</button>
                        </div>
                    ) : quizData ? (
                        <div className="quiz-questions">
                            {submitError && <div className="error-message">{submitError}</div>}

                            {quizData.questions.map((q, qIndex) => (
                                <div key={qIndex} className="question-block">
                                    <p className="question-text">{qIndex + 1}. {q.question}</p>
                                    <div className="options-list">
                                        {q.options.map((opt, oIndex) => (
                                            <label key={oIndex} className="option-label">
                                                <input
                                                    type="radio"
                                                    name={`question-${qIndex}`}
                                                    value={opt}
                                                    checked={answers[qIndex] === opt}
                                                    onChange={() => handleOptionSelect(qIndex, opt)}
                                                />
                                                <span>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="quiz-footer">
                                <button onClick={submitQuiz} disabled={isSubmitted}>
                                    {isSubmitted ? 'Submitting...' : 'Submit Answers'}
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
