from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        # SQLite dialect syntax to add boolean column
        db.session.execute(text("ALTER TABLE topics ADD COLUMN is_completed BOOLEAN DEFAULT 0 NOT NULL;"))
        db.session.commit()
        print("Successfully migrated topics table.")
    except Exception as e:
        db.session.rollback()
        print("Migration note:", str(e))
