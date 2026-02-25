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
        <div className={`topic-card ${topic.is_completed ? 'completed' : ''}`}>
            <div className="topic-header">
                <div>
                    <h4 style={{ textDecoration: topic.is_completed ? 'line-through' : 'none' }}>{topic.name}</h4>
                    <span className={`difficulty-badge ${topic.difficulty.toLowerCase()}`}>
                        {topic.difficulty}
                    </span>
                </div>
                <div className="topic-actions">
                    <button className="icon-btn" onClick={handleToggleComplete} title={topic.is_completed ? "Mark Incomplete" : "Mark Complete"}>
                        {topic.is_completed ? '↩️ Undo' : '✅ Done'}
                    </button>
                    <button
                        className="secondary-btn"
                        onClick={() => setShowDoubtBox(!showDoubtBox)}
                    >
                        {showDoubtBox ? 'Close Doubt' : 'Ask Doubt'}
                    </button>
                    <button onClick={() => setShowQuizModal(true)}>
                        Take Quiz
                    </button>
                    <button className="icon-btn danger" onClick={handleDeleteTopic} title="Delete Topic" style={{ backgroundColor: 'transparent', padding: '0 8px', fontSize: '1.2rem', color: '#ef4444' }}>
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
