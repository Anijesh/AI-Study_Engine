import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import SubjectCard from '../components/SubjectCard';

const Dashboard = () => {
    const { logout } = useContext(AuthContext);

    const [stats, setStats] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Add Subject Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectDate, setNewSubjectDate] = useState('');
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');
            // Fetch stats and subjects concurrently
            const [statsRes, subjectsRes] = await Promise.all([
                api.get('/dashboard'),
                api.get('/subjects')
            ]);
            setStats(statsRes.data);
            setSubjects(subjectsRes.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleAddSubject = async (e) => {
        e.preventDefault();
        setAddError('');
        setAddLoading(true);
        try {
            await api.post('/subjects', {
                name: newSubjectName,
                exam_date: newSubjectDate
            });
            // Reset form and refetch data
            setShowAddForm(false);
            setNewSubjectName('');
            setNewSubjectDate('');
            fetchDashboardData();
        } catch (err) {
            setAddError(err.response?.data?.error || 'Failed to add subject');
        } finally {
            setAddLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-screen">Loading dashboard...</div>;
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="error-message">{error}</div>
                <button onClick={fetchDashboardData}>Retry</button>
            </div>
        );
    }

    return (
        <div className="page-container dashboard-page">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px', borderBottom: '1px solid var(--border-color)', paddingBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '4.5rem', fontFamily: "var(--font-display)", letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)', lineHeight: 1 }}>Welcome back.</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '16px', fontFamily: "var(--font-body)" }}>Ready to crush your study goals today? Let's check your progress.</p>
                </div>
                <button
                    onClick={logout}
                    className="logout-btn"
                    style={{
                        background: 'transparent',
                        color: 'var(--error-color)',
                        border: '1px solid var(--error-color)',
                        padding: '10px 24px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        borderRadius: 0,
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.target.style.background = 'var(--error-color)'; e.target.style.color = 'var(--bg-color)'; }}
                    onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--error-color)'; }}
                >
                    Logout
                </button>
            </div>

            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <h4>Total Subjects</h4>
                        <div className="stat-value">{stats.total_subjects}</div>
                    </div>
                    <div className="stat-card">
                        <h4>Completed Plans</h4>
                        <div className="stat-value">{stats.completed_sessions}</div>
                    </div>
                    <div className="stat-card">
                        <h4>Pending Plans</h4>
                        <div className="stat-value">{stats.pending_sessions}</div>
                    </div>
                    <div className="stat-card">
                        <h4>Avg Quiz Score</h4>
                        <div className="stat-value">{stats.average_quiz_accuracy}%</div>
                    </div>
                </div>
            )}

            <div className="subjects-section">
                <div className="section-header">
                    <h3>Your Subjects</h3>
                    <button
                        className="add-btn"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        {showAddForm ? 'Cancel' : '+ Add Subject'}
                    </button>
                </div>

                {showAddForm && (
                    <div className="auth-form-container" style={{ padding: 0, marginBottom: '32px' }}>
                        <form className="auth-form-wrapper" style={{ border: '1px solid var(--border-color)', padding: '32px', background: 'var(--panel-bg)', maxWidth: 'none' }} onSubmit={handleAddSubject}>
                            <h4 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Create New Subject</h4>
                            {addError && <div className="error-message">{addError}</div>}
                            <div className="form-group">
                                <label>Subject Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Physics 101"
                                    value={newSubjectName}
                                    onChange={e => setNewSubjectName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Exam Date</label>
                                <input
                                    type="date"
                                    value={newSubjectDate}
                                    onChange={e => setNewSubjectDate(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={addLoading}>
                                {addLoading ? 'Adding...' : 'Save Subject'}
                            </button>
                        </form>
                    </div>
                )}

                {subjects.length === 0 ? (
                    <div className="empty-state">
                        <p>You haven't added any subjects yet. Start tracking your studies now!</p>
                    </div>
                ) : (
                    <div className="subjects-grid">
                        {subjects.map(subject => (
                            <SubjectCard key={subject.id} subject={subject} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
