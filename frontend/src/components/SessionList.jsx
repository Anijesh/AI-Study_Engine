import api from '../api/axios';

const SessionList = ({ sessions, onSessionComplete }) => {
    const handleComplete = async (sessionId) => {
        try {
            // API Backend Route: PUT /api/sessions/<session_id>/complete
            await api.put(`/sessions/${sessionId}/complete`);
            onSessionComplete(); // trigger refresh in parent
        } catch (err) {
            alert("Failed to complete session.");
        }
    };

    if (!sessions || sessions.length === 0) {
        return (
            <div className="empty-state">
                <p>No study sessions generated yet. Click "Generate Plan" above.</p>
            </div>
        );
    }

    // Group sessions by status or sort chronologically
    const sortedSessions = [...sessions].sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));

    return (
        <div className="sessions-list">
            {sortedSessions.map(session => {
                const isCompleted = session.status === 'COMPLETED';
                const dateObj = new Date(session.scheduled_date);
                const formattedDate = dateObj.toLocaleDateString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric'
                });

                return (
                    <div key={session.id} className={`session-item ${isCompleted ? 'completed-session' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <div className="session-details">
                                <strong>{formattedDate}</strong>
                                <span>({session.duration_minutes} min)</span>
                                {session.topic_name && <span style={{ marginLeft: '8px', color: 'var(--primary-color)', fontWeight: '600' }}>{session.topic_name}</span>}
                            </div>

                            <div className="session-actions">
                                {isCompleted ? (
                                    <span className="status-badge completed">Done</span>
                                ) : (
                                    <button
                                        className="small-btn"
                                        onClick={() => handleComplete(session.id)}
                                    >
                                        Mark Complete
                                    </button>
                                )}
                            </div>
                        </div>
                        {session.subtopics && session.subtopics.length > 0 && (
                            <div className="subtopics-list" style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                <h5 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Focus Areas:</h5>
                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
                                    {session.subtopics.map((sub, idx) => (
                                        <li key={idx} style={{ marginBottom: '4px' }}>{sub}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default SessionList;
