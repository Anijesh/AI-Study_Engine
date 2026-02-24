from datetime import datetime
from app.extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    subjects = db.relationship(
    "Subject",
    backref="user",
    cascade="all, delete-orphan"
)

    def __repr__(self):
        return f"<User {self.email}>"