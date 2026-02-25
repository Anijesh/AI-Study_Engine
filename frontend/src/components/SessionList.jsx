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
                    <div key={session.id} className={`session-item ${isCompleted ? 'completed-session' : ''}`}>
                        <div className="session-details">
                            <strong>{formattedDate}</strong>
                            <span>({session.duration_minutes} min)</span>
                            {/* Finding the topic name requires correlating topic_id, handled in parent or displayed generically */}
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
                );
            })}
        </div>
    );
};

export default SessionList;
