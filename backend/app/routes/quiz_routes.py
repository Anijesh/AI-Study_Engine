from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.quiz_service import QuizService

quiz_bp = Blueprint('quiz', __name__,url_prefix='/topics/<int:topic_id>/quiz')

@quiz_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_quiz(topic_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    try:
        attempt, accuracy = QuizService.submit_quiz(
            topic_id=topic_id,
            score=data.get("score"),
            total=data.get("total"),
            user_id=user_id
        )

        return jsonify({
            "id": attempt.id,
            "score": attempt.score,
            "total": attempt.total,
            "accuracy": round(accuracy, 2)
        }), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    
@quiz_bp.route('/attempts', methods=['GET'])
@jwt_required()
def get_attempts(topic_id):
    try:
        attempts = QuizService.get_attempts_by_topic(topic_id)
        return jsonify([{
            "id": attempt.id,
            "score": attempt.score,
            "total": attempt.total,
            "created_at": attempt.created_at.isoformat()
        } for attempt in attempts]), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400