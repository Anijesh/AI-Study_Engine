from app.models.quiz import QuizAttempt
from app.models.topic import Topic
from app.extensions import db

class QuizService:
    @staticmethod
    def submit_quiz(topic_id: int, score: int, total: int, user_id):
        from app.models.subject import Subject
        uid = int(user_id)

        topic = (
            Topic.query
            .join(Subject, Topic.subject_id == Subject.id)
            .filter(Topic.id == topic_id)
            .filter(Subject.user_id == uid)
            .first()
        )
        if not topic:
            raise ValueError("Topic not found or access denied")
        if score < 0 or total <= 0 or score > total:
            raise ValueError("Invalid score or total")
            
        attempt = QuizAttempt(topic_id=topic_id, score=score, total=total)
        db.session.add(attempt)
        db.session.commit()
        
        accuracy = (score / total) * 100
        print(f"Quiz Attempt Recorded: {score}/{total} ({accuracy:.2f}%)")
        return attempt, accuracy
    
    @staticmethod
    def get_attempts_by_topic(topic_id: int):
        # Validate topic exists
        topic = Topic.query.get(topic_id)
        if not topic:
            raise ValueError("Topic not found")

        attempts = QuizAttempt.query.filter_by(topic_id=topic_id).all()
        return attempts