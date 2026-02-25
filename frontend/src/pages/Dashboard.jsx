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
            <div className="dashboard-header">
                <h2>Dashboard</h2>
                <button onClick={logout} className="logout-btn">Logout</button>
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
                    <form className="add-subject-form auth-card" onSubmit={handleAddSubject}>
                        <h4>Create New Subject</h4>
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
