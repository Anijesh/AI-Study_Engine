import { useState } from 'react';
import DoubtBox from './DoubtBox';
import QuizModal from './QuizModal';
import api from '../api/axios';

const TopicCard = ({ topic, subjectId, onTopicChanged }) => {
    const [showDoubtBox, setShowDoubtBox] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);

    const handleDeleteTopic = async () => {
        if (!window.confirm('Delete this topic permanently?')) return;
        try {
            await api.delete(`/subjects/${subjectId}/topics/${topic.id}`);
            if (onTopicChanged) onTopicChanged();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete topic');
        }
    };

    const handleToggleComplete = async () => {
        try {
            await api.patch(`/subjects/${subjectId}/topics/${topic.id}/complete`);
            if (onTopicChanged) onTopicChanged();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update topic status');
        }
    };

    return (
        <div className={`topic-card ${topic.is_completed ? 'completed' : ''}`} style={{ transition: 'all 0.3s ease', cursor: 'default' }}>
            <div className="topic-header" style={{ alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ textDecoration: topic.is_completed ? 'line-through' : 'none', color: topic.is_completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{topic.name}</h4>
                    <span className={`difficulty-badge ${topic.difficulty.toLowerCase()}`} style={{ width: 'fit-content' }}>
                        {topic.difficulty}
                    </span>
                </div>
                <div className="topic-actions" style={{ alignItems: 'center' }}>
                    <button className="icon-btn" onClick={handleToggleComplete} title={topic.is_completed ? "Mark Incomplete" : "Mark Complete"}>
                        {topic.is_completed ? '↩️' : '✅ Done'}
                    </button>
                    <button
                        className="secondary-btn"
                        onClick={() => setShowDoubtBox(!showDoubtBox)}
                    >
                        {showDoubtBox ? 'Close' : 'Ask Doubt'}
                    </button>
                    <button onClick={() => setShowQuizModal(true)} style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                        Take Quiz
                    </button>
                    <button className="icon-btn danger" onClick={handleDeleteTopic} title="Delete Topic" style={{ backgroundColor: 'transparent', padding: '0 8px', fontSize: '1.2rem', color: '#ef4444', border: 'none' }}>
                        🗑️
                    </button>
                </div>
            </div>

            {showDoubtBox && (
                <div className="topic-expanded-section">
                    <DoubtBox topicId={topic.id} subjectId={subjectId} />
                </div>
            )}

            {showQuizModal && (
                <QuizModal
                    topic={topic}
                    subjectId={subjectId}
                    onClose={() => setShowQuizModal(false)}
                />
            )}
        </div>
    );
};

export default TopicCard;
