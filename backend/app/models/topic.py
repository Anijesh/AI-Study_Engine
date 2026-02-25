from datetime import datetime
from app.extensions import db
import enum


class Difficulty(enum.Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"


class Topic(db.Model):
    __tablename__ = "topics"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)

    difficulty = db.Column(
        db.Enum(Difficulty),
        nullable=False
    )

    subject_id = db.Column(
        db.Integer,
        db.ForeignKey("subjects.id"),
        nullable=False
    )
    
    is_completed = db.Column(db.Boolean, default=False, nullable=False, server_default='0')
    
    sessions = db.relationship(
    "StudySession",
    backref="topic",
    cascade="all, delete-orphan")
    quiz_attempts = db.relationship(
    "QuizAttempt",
    backref="topic",
    cascade="all, delete-orphan")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("name", "subject_id", name="unique_topic_per_subject"),
    )