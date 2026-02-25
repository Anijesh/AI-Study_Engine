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
                    <h4>{topic.name}</h4>
                    <span className={`difficulty-badge ${topic.difficulty.toLowerCase()}`}>
                        {topic.difficulty}
                    </span>
                </div>
                <div className="topic-actions">
                    <button className="icon-btn" onClick={handleToggleComplete} title={topic.is_completed ? "Mark Incomplete" : "Mark Complete"}>
                        {topic.is_completed ? '↩️' : '✅ Done'}
                    </button>
                    <button
                        className="secondary-btn"
                        onClick={() => setShowDoubtBox(!showDoubtBox)}
                    >
                        {showDoubtBox ? 'Close' : 'Ask Doubt'}
                    </button>
                    <button onClick={() => setShowQuizModal(true)} style={{ background: 'var(--text-primary)', color: 'var(--bg-color)' }}>
                        Take Quiz
                    </button>
                    <button className="icon-btn danger" onClick={handleDeleteTopic} title="Delete Topic">
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
