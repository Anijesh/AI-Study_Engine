from datetime import datetime,date
from app.extensions import db
from app.models.subject import Subject
from sqlalchemy.exc import IntegrityError
from app.models.topic import Topic
from app.models.session import StudySession
from app.ai.study_agent import StudyAgent

class SubjectService:
    @staticmethod
    def create_subject(name, exam_date, user_id):
        if not name or name.strip() == "":
            raise ValueError("Subject name required")
        
        try:
            parsed_date = datetime.strptime(exam_date, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            raise ValueError("Invalid date format, expected YYYY-MM-DD")

        if parsed_date <= date.today():
            raise ValueError("Exam date cannot be in the past")
        subject = Subject(name=name.strip(), exam_date=parsed_date, user_id=user_id)
        try:
            db.session.add(subject)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            raise ValueError("Subject already exists")
        return subject
    @staticmethod
    def get_subjects(user_id):
        return Subject.query.filter_by(user_id=user_id).all()
    
    @staticmethod
    def generate_plan(subject_id, user_id):
        subject = Subject.query.filter_by(id=subject_id, user_id=user_id).first()
        if not subject:
            raise ValueError("Subject not found or access denied")
        
        topics = subject.topics
        if not topics:
            raise ValueError("No topics available for planning. Please add topics first.")
        
        topic_names = [t.name for t in topics]

    
        agent = StudyAgent() 
        plan = agent.generate_plan(
            topics_list=topic_names, 
            exam_date=subject.exam_date.isoformat()
        )

        try:
            from app.models.session import SessionStatus
            topic_ids = [t.id for t in topics]
            
            # Only delete PLANNED sessions, preserve COMPLETED historical data
            StudySession.query.filter(
                StudySession.topic_id.in_(topic_ids),
                StudySession.status == SessionStatus.PLANNED
            ).delete(synchronize_session=False)

            created_sessions = []
            for item in plan.sessions:
            
                topic_obj = next((t for t in topics if t.name == item.topic_name), None)
                
                if not topic_obj:
                
                    continue

                session = StudySession(
                    topic_id=topic_obj.id,
                    scheduled_date=item.scheduled_date,
                    duration_minutes=item.duration_minutes,
                    status="PLANNED" 
                )

                db.session.add(session)
                created_sessions.append(session)

            db.session.commit()
            return created_sessions

        except Exception as e:
            db.session.rollback()
            raise Exception(f"Failed to save study plan: {str(e)}")