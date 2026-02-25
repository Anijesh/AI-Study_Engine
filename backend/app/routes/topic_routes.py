from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.topic_service import TopicService

topic_bp = Blueprint("topics", __name__, url_prefix="/api/subjects/<int:subject_id>/topics")


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
                "difficulty": t.difficulty.value,
                "is_completed": t.is_completed
            }
            for t in topics
        ])

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    
@topic_bp.route("/<int:topic_id>/generate-quiz", methods=["POST"])
@jwt_required()
def generate_quiz(subject_id,topic_id):
    user_id = get_jwt_identity()

    try:
        quiz_data = TopicService.generate_quiz(topic_id, user_id)
        return jsonify(quiz_data.model_dump()), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Failed to generate quiz. Please try again."}), 500


# Ask question
@topic_bp.route("/<int:topic_id>/ask", methods=["POST"])
@jwt_required()
def ask_question(subject_id, topic_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    question = data.get("question")

    if not question:
        return jsonify({"error": "Question is required"}), 400

    try:
        answer = TopicService.solve_doubt(topic_id, question, user_id)
        return jsonify(answer.model_dump()), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 403
    except Exception:
        return jsonify({"error": "AI service is temporarily busy"}), 500

@topic_bp.route("/<int:topic_id>", methods=["DELETE"])
@jwt_required()
def delete_topic(subject_id, topic_id):
    user_id = get_jwt_identity()
    try:
        TopicService.delete_topic(topic_id, subject_id, user_id)
        return jsonify({"message": "Topic deleted successfully"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@topic_bp.route("/<int:topic_id>/complete", methods=["PATCH"])
@jwt_required()
def toggle_topic_complete(subject_id, topic_id):
    user_id = get_jwt_identity()
    try:
        new_status = TopicService.mark_topic_complete(topic_id, subject_id, user_id)
        return jsonify({"message": "Topic status updated", "is_completed": new_status}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400