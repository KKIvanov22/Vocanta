from flask import Blueprint, request, jsonify, current_app
import os
import jwt
from datetime import datetime, timedelta
from data.auth.auth import Auth

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret")
JWT_ALGORITHM = "HS256"
JWT_EXP_DELTA_SECONDS = 3600



def get_auth():
	return Auth()

def generate_token(user):
	payload = {
		"user_id": user["id"],
		"username": user["username"],
		"email": user["email"],
		"exp": datetime.utcnow() + timedelta(seconds=JWT_EXP_DELTA_SECONDS)
	}
	return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

@auth_bp.route("/register", methods=["POST"])
def register():
	data = request.get_json()
	username = data.get("username")
	email = data.get("email")
	password = data.get("password")
	if not username or not email or not password:
		return jsonify({"error": "Missing required fields"}), 400
	auth = get_auth()
	try:
		user = auth.register(username, email, password)
		token = generate_token(user)
		return jsonify({"user": user, "token": token}), 201
	except Exception as e:
		return jsonify({"error": str(e)}), 400

@auth_bp.route("/login", methods=["POST"])
def login():
	data = request.get_json()
	email = data.get("email")
	password = data.get("password")
	if not email or not password:
		return jsonify({"error": "Missing email or password"}), 400
	auth = get_auth()
	user = auth.login(email, password)
	if not user:
		return jsonify({"error": "Invalid credentials"}), 401
	token = generate_token(user)
	return jsonify({"user": user, "token": token}), 200

@auth_bp.route("/user/<int:user_id>", methods=["GET"])
def get_user(user_id):
	auth = get_auth()
	user = auth.user_get(user_id)
	if not user:
		return jsonify({"error": "User not found"}), 404
	return jsonify({"user": user}), 200
