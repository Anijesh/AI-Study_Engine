from datetime import datetime,date
from app.extensions import db
from app.models.subject import Subject

class SubjectService:
    @staticmethod
    def create_subject(name, exam_date, user_id):
        if not name or name.strip() == "":
            raise ValueError("Subject name required")
        
        try:
            parsed_date = datetime.strptime(exam_date, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            raise ValueError("Invalid date format, expected YYYY-MM-DD")

        if parsed_date < date.today():
            raise ValueError("Exam date cannot be in the past")
        subject = Subject(name=name.strip(), exam_date=parsed_date, user_id=user_id)
        db.session.add(subject)
        db.session.commit()
        return subject
    @staticmethod
    def get_subjects(user_id):
        return Subject.query.filter_by(user_id=user_id).all()
        