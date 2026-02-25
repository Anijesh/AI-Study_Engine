import { useState } from 'react';
import DoubtBox from './DoubtBox';
import QuizModal from './QuizModal';

const TopicCard = ({ topic, subjectId }) => {
    const [showDoubtBox, setShowDoubtBox] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);

    return (
        <div className="topic-card">
            <div className="topic-header">
                <div>
                    <h4>{topic.name}</h4>
                    <span className={`difficulty-badge ${topic.difficulty.toLowerCase()}`}>
                        {topic.difficulty}
                    </span>
                </div>
                <div className="topic-actions">
                    <button
                        className="secondary-btn"
                        onClick={() => setShowDoubtBox(!showDoubtBox)}
                    >
                        {showDoubtBox ? 'Close Doubt' : 'Ask Doubt'}
                    </button>
                    <button onClick={() => setShowQuizModal(true)}>
                        Take Quiz
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
