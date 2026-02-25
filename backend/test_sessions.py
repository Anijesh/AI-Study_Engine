from app import create_app
from app.extensions import db
from app.models.session import Session

app = create_app()
with app.app_context():
    try:
        from app.models.topic import Topic
        from app.models.subject import Subject
        
        sessions = (
            db.session.query(Session)
            .join(Topic, Session.topic_id == Topic.id)
            .join(Subject, Topic.subject_id == Subject.id)
            .all()
        )
        print("Success:", len(sessions))
    except Exception as e:
        import traceback
        traceback.print_exc()
