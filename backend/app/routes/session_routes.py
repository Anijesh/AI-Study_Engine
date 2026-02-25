from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app.services.session_service import SessionService

session_bp = Blueprint("sessions", __name__, url_prefix="/api")


@session_bp.route("/topics/<int:topic_id>/sessions", methods=["POST"])
@jwt_required()
def create_session(topic_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    try:
        scheduled_date = datetime.strptime(
            data.get("scheduled_date"),
            "%Y-%m-%d"
        ).date()

        session = SessionService.create_session(
            topic_id=topic_id,
            scheduled_date=scheduled_date,
            duration_minutes=data.get("duration_minutes"),
            user_id=user_id
        )

        return jsonify({
            "id": session.id,
            "scheduled_date": session.scheduled_date.isoformat(),
            "duration_minutes": session.duration_minutes,
            "status": session.status.value
        }), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@session_bp.route("/sessions/<int:session_id>/complete", methods=["PUT"])
@jwt_required()
def complete_session(session_id):
    user_id = get_jwt_identity()
    try:
        session = SessionService.mark_session_completed(session_id, user_id)
        return jsonify({"message": "Session marked as completed", "status": session.status.value}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400