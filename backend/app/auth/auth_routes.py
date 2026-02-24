from flask import Blueprint, request, jsonify
from app.auth.auth_service import AuthService

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        user = AuthService.register(
            email=data["email"],
            password=data["password"]
        )
        return jsonify({"message": "User created"}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        token = AuthService.login(
            email=data["email"],
            password=data["password"]
        )
        return jsonify({"access_token": token}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 401