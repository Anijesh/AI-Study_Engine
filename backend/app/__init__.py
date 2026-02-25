from flask import Flask
from flask_cors import CORS

from .extensions import db, jwt, bcrypt
from app.routes.subject_routes import subject_bp
from app.routes.topic_routes import topic_bp
from app.routes.session_routes import session_bp
from app.routes.quiz_routes import quiz_bp
from app.routes.dashboard_routes import dashboard_bp


def create_app():
    app = Flask(__name__)
    CORS(app) # Enable Cross-Origin Resource Sharing for all domains
    app.config.from_object('app.config.Config')
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)

    from app.auth.auth_routes import auth_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(subject_bp)
    app.register_blueprint(topic_bp)
    app.register_blueprint(session_bp)
    app.register_blueprint(quiz_bp)
    app.register_blueprint(dashboard_bp)
    return app