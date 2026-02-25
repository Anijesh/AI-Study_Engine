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
        <div className="sessions-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px', alignItems: 'start' }}>
            {sortedSessions.map(session => {
                const isCompleted = session.status === 'COMPLETED';
                const dateObj = new Date(session.scheduled_date);
                const formattedDate = dateObj.toLocaleDateString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric'
                });

                return (
                    <div key={session.id} className={`session-item ${isCompleted ? 'completed-session' : ''}`} style={{ display: 'flex', flexDirection: 'column', padding: '24px', border: '1px solid var(--border-color)', borderRadius: '0', background: isCompleted ? 'rgba(204, 255, 0, 0.05)' : 'transparent', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                            <div className="session-details" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontFamily: "var(--font-display)", fontWeight: 500, letterSpacing: '-0.02em' }}>{formattedDate}</strong>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{session.duration_minutes} MIN</span>
                                {session.topic_name && <span style={{ color: 'var(--accent-color)', fontWeight: '600', fontSize: '1rem', marginTop: '4px' }}>{session.topic_name}</span>}
                            </div>

                            <div className="session-actions">
                                {isCompleted ? (
                                    <span className="status-badge completed" style={{ background: 'var(--accent-color)', color: 'var(--bg-color)', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', border: 'none' }}>Done</span>
                                ) : (
                                    <button
                                        className="small-btn"
                                        style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--text-primary)', padding: '8px 16px', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s', width: 'auto' }}
                                        onClick={() => handleComplete(session.id)}
                                        onMouseEnter={(e) => { e.target.style.background = 'var(--accent-color)'; e.target.style.color = 'var(--bg-color)'; e.target.style.borderColor = 'var(--accent-color)'; }}
                                        onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-primary)'; e.target.style.borderColor = 'var(--text-primary)'; }}
                                    >
                                        Mark Complete
                                    </button>
                                )}
                            </div>
                        </div>
                        {session.subtopics && session.subtopics.length > 0 && (
                            <div className="subtopics-list" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--panel-border)' }}>
                                <h5 style={{ margin: '0 0 16px 0', fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "var(--font-body)" }}>Focus Areas</h5>
                                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.95rem', color: 'var(--text-primary)', display: 'grid', gap: '12px', fontFamily: "var(--font-body)" }}>
                                    {session.subtopics.map((sub, idx) => (
                                        <li key={idx} style={{ lineHeight: '1.5' }}>{sub}</li>
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
