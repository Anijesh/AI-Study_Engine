import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

import TopicCard from '../components/TopicCard';
import SessionList from '../components/SessionList';

const SubjectPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Data State
    const [subject, setSubject] = useState(null);
    const [topics, setTopics] = useState([]);
    const [sessions, setSessions] = useState([]);

    // Form State
    const [showAddTopic, setShowAddTopic] = useState(false);
    const [newTopicName, setNewTopicName] = useState('');
    const [newTopicDifficulty, setNewTopicDifficulty] = useState('MEDIUM');
    const [topicLoading, setTopicLoading] = useState(false);

    // Plan Generation State
    const [planLoading, setPlanLoading] = useState(false);

    useEffect(() => {
        fetchSubjectData();
    }, [id]);

    const fetchSubjectData = async () => {
        try {
            setLoading(true);
            setError('');

            // We don't have a GET /api/subjects/:id route natively in the backend design from before
            // But we can get ALL subjects and filter to get the name/date
            const subRes = await api.get('/subjects');
            const foundSub = subRes.data.find(s => s.id === Number(id));

            if (!foundSub) throw new Error('Subject not found');
            setSubject(foundSub);

            // Fetch Topics
            const topRes = await api.get(`/subjects/${id}/topics`);
            setTopics(topRes.data);

            // Fetch Sessions currently mapped to this subject
            const sessionRes = await api.get(`/subjects/${id}/sessions`);
            setSessions(sessionRes.data);

        } catch (err) {
            setError(err.message || 'Failed to load subject details.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTopic = async (e) => {
        e.preventDefault();
        if (!newTopicName) return;

        setTopicLoading(true);
        try {
            await api.post(`/subjects/${id}/topics`, {
                name: newTopicName,
                difficulty: newTopicDifficulty
            });
            setShowAddTopic(false);
            setNewTopicName('');
            setNewTopicDifficulty('MEDIUM');
            fetchSubjectData(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to add topic');
        } finally {
            setTopicLoading(false);
        }
    };

    const handleDeleteSubject = async () => {
        if (!window.confirm('Are you sure you want to delete this subject? All topics and sessions will be permanently lost.')) return;
        try {
            await api.delete(`/subjects/${id}`);
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete subject');
        }
    };

    const handleGeneratePlan = async () => {
        if (topics.length === 0) {
            alert("Please add at least one topic before generating a study plan.");
            return;
        }
        setPlanLoading(true);
        try {
            // Backend: POST /api/subjects/<id>/generate-plan
            const res = await api.post(`/subjects/${id}/generate-plan`);
            setSessions(res.data.sessions);
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to generate plan.");
        } finally {
            setPlanLoading(false);
        }
    };

    if (loading) return <div className="loading-screen">Loading Subject...</div>;

    if (error) {
        return (
            <div className="page-container">
                <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="page-container subject-page">
            <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="subject-header" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '16px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', fontFamily: "'Outfit', sans-serif", letterSpacing: '-1px', margin: 0, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        {subject.name}
                    </h2>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span className="exam-date-badge" style={{ background: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.3)', color: '#a78bfa' }}>
                            Target: {new Date(subject.exam_date).toLocaleDateString()}
                        </span>
                        <button className="delete-btn" onClick={handleDeleteSubject}>Delete Subject</button>
                    </div>
                </div>
            </div>

            <div className="content-grid two-column">
                {/* Left Column: Topics */}
                <div className="content-column">
                    <div className="section-header" style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '16px' }}>
                        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', margin: 0 }}>Topics</h3>
                        <button className="small-add-btn" onClick={() => setShowAddTopic(!showAddTopic)} style={{ background: showAddTopic ? 'rgba(255, 255, 255, 0.1)' : 'var(--accent-gradient)' }}>
                            {showAddTopic ? 'Cancel' : '+ Add Topic'}
                        </button>
                    </div>

                    {showAddTopic && (
                        <form className="add-topic-form" onSubmit={handleCreateTopic}>
                            <input
                                type="text"
                                placeholder="Topic Name"
                                value={newTopicName}
                                onChange={e => setNewTopicName(e.target.value)}
                                required
                            />
                            <select
                                value={newTopicDifficulty}
                                onChange={e => setNewTopicDifficulty(e.target.value)}
                            >
                                <option value="EASY">EASY</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HARD">HARD</option>
                            </select>
                            <button type="submit" disabled={topicLoading}>
                                {topicLoading ? '...' : 'Add'}
                            </button>
                        </form>
                    )}

                    {topics.length === 0 ? (
                        <div className="empty-sub-state" style={{ padding: '40px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px dashed var(--panel-border)', color: 'var(--text-secondary)' }}>
                            <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>No Topics Yet</h4>
                            <p style={{ margin: 0 }}>Add the chapters or subjects you need to cover for the exam.</p>
                        </div>
                    ) : (
                        <div className="topic-list">
                            {topics.map(topic => (
                                <TopicCard key={topic.id} topic={topic} subjectId={subject.id} onTopicChanged={fetchSubjectData} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Study Plan & Sessions */}
                <div className="content-column right-sidebar">
                    <div className="study-plan-section">
                        <div className="section-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '16px' }}>
                            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', margin: 0 }}>Study Plan</h3>
                        </div>
                        <p className="sidebar-description" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
                            Generate an AI-powered study schedule based on your exam date, selected topics, and their difficulty levels.
                        </p>
                        <button
                            className="generate-btn"
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '1.1rem',
                                fontFamily: "'Outfit', sans-serif",
                                background: topics.length === 0 ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(45deg, #8b5cf6, #ec4899, #8b5cf6)',
                                backgroundSize: '200% auto',
                                animation: topics.length > 0 ? 'gradientMove 3s linear infinite' : 'none',
                                color: topics.length === 0 ? 'var(--text-secondary)' : '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: topics.length === 0 || planLoading ? 'not-allowed' : 'pointer',
                                boxShadow: topics.length > 0 && !planLoading ? '0 8px 20px rgba(139, 92, 246, 0.4)' : 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onClick={handleGeneratePlan}
                            disabled={planLoading || topics.length === 0}
                        >
                            {planLoading ? 'Generating Plan...' : 'Generate New Plan'}
                        </button>

                        <div className="session-container mt-4">
                            <SessionList
                                sessions={sessions}
                                onSessionComplete={fetchSubjectData}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubjectPage;
