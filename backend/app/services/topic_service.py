from app.models.topic import Topic, Difficulty
from app.models.subject import Subject
from app.extensions import db
from sqlalchemy.exc import IntegrityError


class TopicService:

    @staticmethod
    def create_topic(name: str, difficulty: str, subject_id: int, user_id: int):

        if not name or name.strip() == "":
            raise ValueError("Topic name required")

        try:
            difficulty_enum = Difficulty[difficulty.upper()]
        except KeyError:
            raise ValueError("Invalid difficulty level")

        subject = Subject.query.filter_by(id=subject_id, user_id=user_id).first()

        if not subject:
            raise ValueError("Subject not found or access denied")

        topic = Topic(
            name=name.strip(),
            difficulty=difficulty_enum,
            subject_id=subject_id
        )

        try:
            db.session.add(topic)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            raise ValueError("Topic already exists")

        return topic

    @staticmethod
    def get_topics(subject_id: int, user_id: int):
        subject = Subject.query.filter_by(id=subject_id, user_id=user_id).first()

        if not subject:
            raise ValueError("Subject not found or access denied")

        return subject.topics