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
            <div className="empty-state" style={{ background: 'rgba(255,255,255,0.02)', padding: '32px', textAlign: 'center', borderRadius: '16px', border: '1px dashed var(--panel-border)' }}>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No study sessions generated yet. Click "Generate Plan" above.</p>
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
                    <div key={session.id} className={`session-item ${isCompleted ? 'completed-session' : ''}`} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', border: '1px solid var(--panel-border)', padding: '20px', borderRadius: '16px', transition: 'transform 0.2s, box-shadow 0.2s', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <div className="session-details">
                                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>{formattedDate}</strong>
                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>({session.duration_minutes} min)</span>
                                {session.topic_name && <span style={{ marginLeft: '8px', color: '#c4b5fd', fontWeight: '500' }}>{session.topic_name}</span>}
                            </div>

                            <div className="session-actions">
                                {isCompleted ? (
                                    <span className="status-badge completed" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.2)' }}>Done</span>
                                ) : (
                                    <button
                                        className="small-btn"
                                        style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onClick={() => handleComplete(session.id)}
                                    >
                                        Mark Complete
                                    </button>
                                )}
                            </div>
                        </div>
                        {session.subtopics && session.subtopics.length > 0 && (
                            <div className="subtopics-list" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                                <h5 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Outfit', sans-serif" }}>Focus Areas:</h5>
                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'grid', gap: '8px' }}>
                                    {session.subtopics.map((sub, idx) => (
                                        <li key={idx} style={{ lineHeight: '1.4' }}>{sub}</li>
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
