from datetime import datetime
from app.extensions import db
from app.models.session import StudySession, SessionStatus
from app.models.topic import Topic
from sqlalchemy.exc import IntegrityError

class SessionService:

    @staticmethod
    def create_session(topic_id: int, scheduled_date: datetime.date, duration_minutes: int,user_id: int):
        topic = (
            Topic.query
            .join(Topic.subject)
            .filter(Topic.id == topic_id)
            .filter_by(user_id=user_id)
            .first()
        )

        if not topic:
            raise ValueError("Topic not found or access denied")

        if duration_minutes <= 0:
            raise ValueError("Duration must be positive")


        if not topic:
            raise ValueError("Topic not found")

        session = StudySession(
            topic_id=topic_id,
            scheduled_date=scheduled_date,
            duration_minutes=duration_minutes,
            status=SessionStatus.PLANNED
        )

        try:
            db.session.add(session)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            raise ValueError("Failed to create session")

        return session
    
    @staticmethod
    def mark_session_completed(session_id: int, user_id):
        from app.models.subject import Subject
        uid = int(user_id)
        
        session = (
            StudySession.query
            .join(Topic, StudySession.topic_id == Topic.id)
            .join(Subject, Topic.subject_id == Subject.id)
            .filter(StudySession.id == session_id)
            .filter(Subject.user_id == uid)
            .first()
        )

        if not session:
            raise ValueError("Session not found or access denied")

        session.status = SessionStatus.COMPLETED

        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            raise ValueError("Failed to update session status")

        return session