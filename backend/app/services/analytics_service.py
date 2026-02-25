from sqlalchemy import func
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.session import StudySession, SessionStatus
from app.models.quiz import QuizAttempt
from app.extensions import db


class AnalyticsService:

    @staticmethod
    def get_dashboard(user_id: int):

        total_subjects = Subject.query.filter_by(user_id=user_id).count()

        total_topics = (
            Topic.query
            .join(Topic.subject)
            .filter(Subject.user_id == user_id)
            .count()
        )

        total_sessions = (
            StudySession.query
            .join(StudySession.topic)
            .join(Topic.subject)
            .filter(Subject.user_id == user_id)
            .count()
        )

        completed_sessions = (
            StudySession.query
            .join(StudySession.topic)
            .join(Topic.subject)
            .filter(Subject.user_id == user_id)
            .filter(StudySession.status == SessionStatus.COMPLETED)
            .count()
        )

        completion_rate = (
            (completed_sessions / total_sessions) * 100
            if total_sessions > 0 else 0
        )

        quiz_attempts = (
            QuizAttempt.query
            .join(QuizAttempt.topic)
            .join(Topic.subject)
            .filter(Subject.user_id == user_id)
        )

        total_quiz_attempts = quiz_attempts.count()

        avg_accuracy = (
            db.session.query(
                func.avg(QuizAttempt.score * 1.0 / QuizAttempt.total)
            )
            .join(QuizAttempt.topic)
            .join(Topic.subject)
            .filter(Subject.user_id == int(user_id))
            .scalar()
        )

        avg_accuracy = round(avg_accuracy * 100, 2) if avg_accuracy is not None else 0

        weakest = (
            db.session.query(
                Topic.name,
                func.avg(QuizAttempt.score * 1.0 / QuizAttempt.total).label("accuracy")
            )
            .join(QuizAttempt, QuizAttempt.topic_id == Topic.id)
            .join(Topic.subject)
            .filter(Subject.user_id == user_id)
            .group_by(Topic.id)
            .order_by("accuracy")
            .first()
        )

        weakest_topic = weakest[0] if weakest else None

        return {
            "total_subjects": total_subjects,
            "total_topics": total_topics,
            "total_study_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "completion_rate": round(completion_rate, 2),
            "total_quiz_attempts": total_quiz_attempts,
            "average_quiz_accuracy": avg_accuracy,
            "weakest_topic": weakest_topic
        }