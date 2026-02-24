from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.analytics_service import AnalyticsService

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


@dashboard_bp.route("", methods=["GET"])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()

    data = AnalyticsService.get_dashboard(user_id)

    return jsonify(data)