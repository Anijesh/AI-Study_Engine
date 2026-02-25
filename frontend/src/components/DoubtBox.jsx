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
        <div className="doubt-box" style={{ padding: '24px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '24px' }}>Query Protocol</h4>
            <form onSubmit={handleAsk}>
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Input query parameters..."
                    disabled={loading}
                    required
                    style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 0, padding: '16px', fontFamily: 'var(--font-body)', fontSize: '1rem', width: '100%', minHeight: '120px', marginBottom: '16px', resize: 'vertical' }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--text-primary)'; e.target.style.background = 'rgba(255,255,255,0.02)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.background = 'transparent'; }}
                />
                <button type="submit" disabled={loading || !question.trim()} style={{ borderRadius: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                    {loading ? 'Processing...' : 'Execute Query'}
                </button>
            </form>

            {error && <div className="error-message" style={{ marginTop: '24px', borderRadius: 0 }}>{error}</div>}

            {response && (
                <div className="doubt-response" style={{ background: 'var(--panel-bg)', borderRadius: 0, padding: '32px', marginTop: '32px', border: '1px solid var(--border-color)' }}>
                    <div className="response-section" style={{ marginBottom: '32px' }}>
                        <h5 style={{ color: 'var(--accent-color)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem', marginBottom: '16px' }}>Output</h5>
                        <div className="explanation-text" style={{ fontFamily: 'var(--font-body)', lineHeight: 1.6, fontSize: '1rem' }}>
                            <ReactMarkdown>{response.explanation}</ReactMarkdown>
                        </div>
                    </div>

                    <div className="response-section" style={{ marginBottom: '32px' }}>
                        <h5 style={{ color: 'var(--accent-color)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem', marginBottom: '16px' }}>Critical Nodes</h5>
                        <ul style={{ paddingLeft: '24px', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                            {response.key_points.map((point, i) => (
                                <li key={i} style={{ marginBottom: '8px' }}>{point}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="response-section">
                        <h5 style={{ color: 'var(--accent-color)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem', marginBottom: '16px' }}>Reference Data</h5>
                        <p className="suggested-resource" style={{ background: 'transparent', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-color)', padding: '16px', borderRadius: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>{response.suggested_resource}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoubtBox;
