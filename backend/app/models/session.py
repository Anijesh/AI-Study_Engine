from datetime import datetime
from app.extensions import db
import enum


class SessionStatus(enum.Enum):
    PLANNED = "PLANNED"
    COMPLETED = "COMPLETED"


class StudySession(db.Model):
    __tablename__ = "study_sessions"

    id = db.Column(db.Integer, primary_key=True)

    topic_id = db.Column(
        db.Integer,
        db.ForeignKey("topics.id"),
        nullable=False
    )

    scheduled_date = db.Column(db.Date, nullable=False)

    duration_minutes = db.Column(db.Integer, nullable=False)
    
    subtopics = db.Column(db.Text, nullable=True)

    status = db.Column(
        db.Enum(SessionStatus),
        default=SessionStatus.PLANNED,
        nullable=False
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.CheckConstraint(
            "duration_minutes > 0",
            name="check_positive_duration"
        ),
    )