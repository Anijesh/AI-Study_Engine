from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.subject_service import SubjectService

subject_bp = Blueprint("subjects", __name__, url_prefix="/api/subjects")

@subject_bp.route("/", methods=["POST"])
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
    

@subject_bp.route("/", methods=["GET"])
@jwt_required()
def get_subjects():
    usr_id = get_jwt_identity()
    subjects = SubjectService.get_subjects(usr_id)
    return jsonify([{"id": s.id, "name": s.name, "exam_date": s.exam_date.isoformat()} for s in subjects]), 200
