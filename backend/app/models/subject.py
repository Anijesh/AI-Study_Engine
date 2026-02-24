from datetime import datetime
from app.extensions import db

class Subject(db.Model):
    __tablename__ = "subjects"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    exam_date = db.Column(db.Date, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    topics = db.relationship(
    "Topic",
    backref="subject",
    cascade="all, delete-orphan"
)

    __table_args__ = (
        db.UniqueConstraint("name", "user_id", name="unique_subject_per_user"),
    )

    def __repr__(self):
        return f"<Subject {self.name}>"