from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.subject_service import SubjectService

subject_bp = Blueprint("subjects", __name__, url_prefix="/api/subjects")

@subject_bp.route("", methods=["POST"])
@jwt_required()
def create_subject():   
    usr_id = get_jwt_identity()
    data = request.get_json()
    name = data.get("name")
    exam_date = data.get("exam_date")   
    try:
        subject = SubjectService.create_subject(name, exam_date, usr_id)
        return jsonify({"id": subject.id, "name": subject.name, "exam_date": subject.exam_date.isoformat()}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    

@subject_bp.route("", methods=["GET"])
@jwt_required()
def get_subjects():
    usr_id = get_jwt_identity()
    subjects = SubjectService.get_subjects(usr_id)
    return jsonify([{"id": s.id, "name": s.name, "exam_date": s.exam_date.isoformat()} for s in subjects]), 200

@subject_bp.route("/<int:subject_id>/generate-plan", methods=["POST"])
@jwt_required()
def generate_plan(subject_id):
    user_id = get_jwt_identity()

    try:
        sessions = SubjectService.generate_plan(subject_id, user_id)

        return jsonify({
            "message": "Study plan generated successfully",
            "sessions": [
                {
                    "id": s.id,
                    "topic_id": s.topic_id,
                    "scheduled_date": s.scheduled_date.isoformat(),
                    "duration_minutes": s.duration_minutes,
                    "status": s.status.value
                }
                for s in sessions
            ]
        }), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred during plan generation"}), 500

@subject_bp.route("/<int:subject_id>/sessions", methods=["GET"])
@jwt_required()
def get_subject_sessions(subject_id):
    user_id = get_jwt_identity()
    from app.models.session import StudySession
    from app.models.topic import Topic
    from app.models.subject import Subject
    from app.extensions import db
    
    sessions = (
        db.session.query(StudySession)
        .join(Topic, StudySession.topic_id == Topic.id)
        .join(Subject, Topic.subject_id == Subject.id)
        .filter(Subject.id == subject_id)
        .filter(Subject.user_id == int(user_id))
        .all()
    )

    return jsonify([
        {
            "id": s.id,
            "topic_id": s.topic_id,
            "scheduled_date": s.scheduled_date.isoformat(),
            "duration_minutes": s.duration_minutes,
            "status": s.status.value
        }
        for s in sessions
    ]), 200
