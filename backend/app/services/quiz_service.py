from app.models.quiz import QuizAttempt
from app.models.topic import Topic
from app.extensions import db

class QuizService:
    @staticmethod
    def submit_quiz(topic_id: int, score: int, total: int,user_id: int):
        topic = Topic.query.get(topic_id)
        if not topic:
            raise ValueError("Topic not found")
        if score < 0 or total <= 0 or score > total:
            raise ValueError("Invalid score or total")
        attempt = QuizAttempt(topic_id=topic_id, score=score, total=total)
        db.session.add(attempt)
        db.session.commit()
        accuracy=(score / total) * 100
        print(f"Quiz Attempt Recorded: {score}/{total} ({accuracy:.2f}%)")
        return attempt,accuracy
    
    @staticmethod
    def get_attempts_by_topic(topic_id: int):
        # Validate topic exists
        topic = Topic.query.get(topic_id)
        if not topic:
            raise ValueError("Topic not found")

        attempts = QuizAttempt.query.filter_by(topic_id=topic_id).all()
        return attempts