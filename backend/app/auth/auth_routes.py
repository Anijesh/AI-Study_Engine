from flask import Blueprint, request, jsonify
from app.auth.auth_service import AuthService

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    user = AuthService.register(
        email=data["email"],
        password=data["password"]
    )

    return jsonify({"message": "User created"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    token = AuthService.login(
        email=data["email"],
        password=data["password"]
    )

    return jsonify({"access_token": token}), 200