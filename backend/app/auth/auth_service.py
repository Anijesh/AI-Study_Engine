from app.models.user import User
from app.extensions import db, bcrypt
from flask_jwt_extended import create_access_token
from sqlalchemy.exc import IntegrityError

class AuthService:

    @staticmethod
    def register(email: str, password: str):
        if not email or not password:
            raise ValueError("Email and password required")

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

        user = User(email=email, password_hash=hashed_password)

        try:
            db.session.add(user)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            raise ValueError("Email already registered")

        return user

    @staticmethod
    def login(email: str, password: str):
        user = User.query.filter_by(email=email).first()

        if not user:
            raise ValueError("Invalid credentials")

        if not bcrypt.check_password_hash(user.password_hash, password):
            raise ValueError("Invalid credentials")

        access_token = create_access_token(identity=user.id)

        return access_token