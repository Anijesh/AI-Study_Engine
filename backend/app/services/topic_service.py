from app.models.topic import Topic, Difficulty
from app.models.subject import Subject
from app.extensions import db
from sqlalchemy.exc import IntegrityError
from app.ai.study_agent import StudyAgent


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
    
    @staticmethod
    def generate_quiz(topic_id, user_id):
        topic = (
            Topic.query
            .join(Topic.subject)
            .filter(Topic.id == topic_id, Topic.subject.has(user_id=user_id))
            .first()
        )

        if not topic:
            raise ValueError("Topic not found or access denied")

        agent = StudyAgent()
        quiz = agent.generate_quiz(
            topic_name=topic.name
        )

        return quiz
    
    @staticmethod
    def solve_doubt(topic_id, question, user_id):
        topic = (
            Topic.query
            .join(Topic.subject)
            .filter(Topic.id == topic_id, Topic.subject.has(user_id=user_id))
            .first()
        )

        if not topic:
            raise ValueError("Access denied or topic not found")

        agent = StudyAgent()
        return agent.answer_doubt(topic.name, question)

    @staticmethod
    def delete_topic(topic_id, subject_id, user_id):
        topic = Topic.query.join(Subject).filter(Topic.id == topic_id, Topic.subject_id == subject_id, Subject.user_id == user_id).first()
        if not topic:
            raise ValueError("Topic not found or access denied")
        try:
            db.session.delete(topic)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise ValueError(f"Failed to delete topic: {str(e)}")

    @staticmethod
    def mark_topic_complete(topic_id, subject_id, user_id):
        topic = Topic.query.join(Subject).filter(Topic.id == topic_id, Topic.subject_id == subject_id, Subject.user_id == user_id).first()
        if not topic:
            raise ValueError("Topic not found or access denied")
        topic.is_completed = not topic.is_completed
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            raise ValueError(f"Failed to update topic status: {str(e)}")
        return topic.is_completed