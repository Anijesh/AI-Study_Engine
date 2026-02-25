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

    // Plan Generation & Display State
    const [planLoading, setPlanLoading] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);

    useEffect(() => {
        fetchSubjectData();
    }, [id]);

    const fetchSubjectData = async () => {
        try {
            setLoading(true);
            setError('');

            const subRes = await api.get('/subjects');
            const foundSub = subRes.data.find(s => s.id === Number(id));

            if (!foundSub) throw new Error('Subject not found');
            setSubject(foundSub);

            const topRes = await api.get(`/subjects/${id}/topics`);
            setTopics(topRes.data);

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
            fetchSubjectData();
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

            <div className="subject-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '32px', marginBottom: '48px', flexWrap: 'wrap', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h2 style={{ fontSize: '4.5rem', fontFamily: "var(--font-display)", letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)', lineHeight: 1 }}>
                        {subject.name}
                    </h2>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span className="exam-date-badge" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: 0, padding: '8px 16px', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 600 }}>
                            Target • {new Date(subject.exam_date).toLocaleDateString()}
                        </span>
                        <button className="delete-btn" onClick={handleDeleteSubject} style={{ background: 'transparent', color: 'var(--error-color)', border: '1px solid var(--error-color)', borderRadius: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', width: 'auto', padding: '8px 16px' }}>Delete Subject</button>
                    </div>
                </div>

                <button
                    className="view-plan-btn"
                    onClick={() => setShowPlanModal(true)}
                    style={{
                        background: 'var(--text-primary)',
                        color: 'var(--bg-color)',
                        border: '1px solid var(--text-primary)',
                        padding: '16px 32px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderRadius: 0,
                        transition: 'all 0.2s ease',
                        width: 'auto',
                        whiteSpace: 'nowrap'
                    }}
                >
                    View Study Plan
                </button>
            </div>

            {/* Topics Section (Full Width) */}
            <div className="topics-section" style={{ marginBottom: '64px' }}>
                <div className="section-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '24px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <h3 style={{ fontFamily: "var(--font-display)", fontSize: '2.5rem', margin: 0 }}>Syllabus Topics</h3>
                        <span style={{ color: 'var(--text-secondary)', fontFamily: "var(--font-body)", textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}>{topics.length} Declared</span>
                    </div>
                    <button className="small-add-btn" onClick={() => setShowAddTopic(!showAddTopic)} style={{ background: showAddTopic ? 'var(--panel-bg)' : 'var(--text-primary)', color: showAddTopic ? 'var(--text-primary)' : 'var(--bg-color)', border: '1px solid var(--text-primary)', borderRadius: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem', fontWeight: 600 }}>
                        {showAddTopic ? 'Cancel' : '+ Add Topic'}
                    </button>
                </div>

                {showAddTopic && (
                    <form className="add-topic-form" onSubmit={handleCreateTopic} style={{ marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--panel-bg)', padding: '24px', border: '1px solid var(--border-color)' }}>
                        <input
                            type="text"
                            placeholder="Topic Name"
                            value={newTopicName}
                            onChange={e => setNewTopicName(e.target.value)}
                            required
                            style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: '1rem', borderRadius: 0 }}
                        />
                        <select
                            value={newTopicDifficulty}
                            onChange={e => setNewTopicDifficulty(e.target.value)}
                            style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: '1rem', borderRadius: 0 }}
                        >
                            <option value="EASY" style={{ color: '#000' }}>EASY</option>
                            <option value="MEDIUM" style={{ color: '#000' }}>MEDIUM</option>
                            <option value="HARD" style={{ color: '#000' }}>HARD</option>
                        </select>
                        <button type="submit" disabled={topicLoading} style={{ width: 'auto', background: 'var(--accent-color)', color: 'var(--bg-color)', border: 'none', padding: '12px 32px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                            {topicLoading ? '...' : 'Add'}
                        </button>
                    </form>
                )}

                {topics.length === 0 ? (
                    <div className="empty-sub-state" style={{ padding: '64px 40px', textAlign: 'center', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontFamily: "var(--font-display)", fontSize: '1.5rem' }}>No Topics Declared</h4>
                        <p style={{ margin: 0, fontFamily: "var(--font-body)" }}>Define the parameters of your study structure.</p>
                    </div>
                ) : (
                    <div className="topic-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {topics.map(topic => (
                            <TopicCard key={topic.id} topic={topic} subjectId={subject.id} onTopicChanged={fetchSubjectData} />
                        ))}
                    </div>
                )}
            </div>

            {/* Study Plan Modal Overlay */}
            {showPlanModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 5, 5, 0.9)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
                    <div className="modal-content" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: 0, boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}>

                        <div className="modal-header" style={{ padding: '32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontFamily: "var(--font-display)", fontSize: '2.5rem', margin: '0 0 12px 0', color: 'var(--accent-color)' }}>Curriculum Algorithm</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0, fontFamily: "var(--font-body)" }}>
                                    AI-generated study protocol based on your exam date and topics.
                                </p>
                            </div>
                            <button onClick={() => setShowPlanModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer', padding: '8px', width: 'auto' }}>✕</button>
                        </div>

                        <div className="modal-body" style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
                                <button
                                    className="generate-btn"
                                    style={{
                                        width: 'auto',
                                        padding: '16px 32px',
                                        fontSize: '1rem',
                                        fontFamily: "var(--font-body)",
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        fontWeight: 700,
                                        background: topics.length === 0 ? 'transparent' : 'var(--accent-color)',
                                        color: topics.length === 0 ? 'var(--text-secondary)' : 'var(--bg-color)',
                                        border: topics.length === 0 ? '1px solid var(--border-color)' : '1px solid var(--accent-color)',
                                        borderRadius: 0,
                                        cursor: topics.length === 0 || planLoading ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onClick={handleGeneratePlan}
                                    disabled={planLoading || topics.length === 0}
                                    onMouseEnter={(e) => { if (topics.length > 0 && !planLoading) { e.target.style.background = 'var(--text-primary)'; e.target.style.color = 'var(--bg-color)'; e.target.style.borderColor = 'var(--text-primary)'; } }}
                                    onMouseLeave={(e) => { if (topics.length > 0 && !planLoading) { e.target.style.background = 'var(--accent-color)'; e.target.style.color = 'var(--bg-color)'; e.target.style.borderColor = 'var(--accent-color)'; } }}
                                >
                                    {planLoading ? 'Computing...' : 'Generate Algorithm'}
                                </button>
                            </div>

                            <SessionList
                                sessions={sessions}
                                onSessionComplete={fetchSubjectData}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectPage;
