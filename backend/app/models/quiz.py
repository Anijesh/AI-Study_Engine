from datetime import datetime
from app.extensions import db


class QuizAttempt(db.Model):
    __tablename__ = "quiz_attempts"

    id = db.Column(db.Integer, primary_key=True)

    topic_id = db.Column(
        db.Integer,
        db.ForeignKey("topics.id"),
        nullable=False
    )

    score = db.Column(db.Integer, nullable=False)
    total = db.Column(db.Integer, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.CheckConstraint("score >= 0", name="check_score_non_negative"),
        db.CheckConstraint("total > 0", name="check_total_positive"),
        db.CheckConstraint("score <= total", name="check_score_valid"),
    )