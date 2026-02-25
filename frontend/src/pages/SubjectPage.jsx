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

            <div className="subject-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h2>{subject.name}</h2>
                    <button className="delete-btn" onClick={handleDeleteSubject}>Delete Subject</button>
                </div>
                <span className="exam-date-badge">
                    Exam: {new Date(subject.exam_date).toLocaleDateString()}
                </span>
            </div>

            <div className="content-grid two-column">
                {/* Left Column: Topics */}
                <div className="content-column">
                    <div className="section-header">
                        <h3>Topics</h3>
                        <button className="small-add-btn" onClick={() => setShowAddTopic(!showAddTopic)}>
                            {showAddTopic ? 'Cancel' : '+ Add'}
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
                        <div className="empty-sub-state">
                            <p>No topics listed. Add some to get started.</p>
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
                        <div className="section-header">
                            <h3>Study Plan</h3>
                        </div>
                        <p className="sidebar-description">
                            Generate an AI-powered study schedule based on your exam date, selected topics, and their difficulty levels.
                        </p>
                        <button
                            className="generate-btn"
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
