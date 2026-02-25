from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        db.session.execute(text("ALTER TABLE study_sessions ADD COLUMN subtopics TEXT;"))
        db.session.commit()
        print("Successfully migrated study_sessions table.")
    except Exception as e:
        db.session.rollback()
        print("Migration note:", str(e))
