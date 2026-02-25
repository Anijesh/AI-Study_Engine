import { useState } from 'react';
import api from '../api/axios';
import ReactMarkdown from 'react-markdown';

const DoubtBox = ({ topicId }) => {
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState('');

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        setLoading(true);
        setError('');
        setResponse(null);

        try {
            const res = await api.post(`/subjects/${topicId}/topics/${topicId}/ask`, {
                question
            });
            setResponse(res.data);
        } catch (err) {
            // Because topic API prefix is actually /api/subjects/<subject_id>/topics/<topic_id>/ask
            // Wait, let's fix the API call according to the backend routes we verified earlier.
            // In topic_routes.py we used url_prefix="/api/subjects/<int:subject_id>/topics"
            // and @topic_bp.route("/<int:topic_id>/ask", methods=["POST"])
            setResponse(null);
            setError(err.response?.data?.error || 'Failed to get an answer. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="doubt-box">
            <h4>Ask a doubt about this topic</h4>
            <form onSubmit={handleAsk}>
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="I don't understand how X works..."
                    disabled={loading}
                    required
                />
                <button type="submit" disabled={loading || !question.trim()}>
                    {loading ? 'Thinking...' : 'Ask AI'}
                </button>
            </form>

            {error && <div className="error-message" style={{ marginTop: '16px' }}>{error}</div>}

            {response && (
                <div className="doubt-response">
                    <div className="response-section">
                        <h5>Explanation</h5>
                        <div className="explanation-text">
                            {/* Use ReactMarkdown or render plain text */}
                            <ReactMarkdown>{response.explanation}</ReactMarkdown>
                        </div>
                    </div>

                    <div className="response-section">
                        <h5>Key Points</h5>
                        <ul>
                            {response.key_points.map((point, i) => (
                                <li key={i}>{point}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="response-section">
                        <h5>Suggested Resource</h5>
                        <p className="suggested-resource">{response.suggested_resource}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoubtBox;
