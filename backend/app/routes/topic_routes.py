from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.topic_service import TopicService

topic_bp = Blueprint("topics", __name__, url_prefix="/subjects/<int:subject_id>/topics")


@topic_bp.route("", methods=["POST"])
@jwt_required()
def create_topic(subject_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    try:
        topic = TopicService.create_topic(
            name=data.get("name"),
            difficulty=data.get("difficulty"),
            subject_id=subject_id,
            user_id=user_id
        )

        return jsonify({
            "id": topic.id,
            "name": topic.name,
            "difficulty": topic.difficulty.value
        }), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@topic_bp.route("", methods=["GET"])
@jwt_required()
def list_topics(subject_id):
    user_id = get_jwt_identity()

    try:
        topics = TopicService.get_topics(subject_id, user_id)

        return jsonify([
            {
                "id": t.id,
                "name": t.name,
                "difficulty": t.difficulty.value
            }
            for t in topics
        ])

    except ValueError as e:
        return jsonify({"error": str(e)}), 400