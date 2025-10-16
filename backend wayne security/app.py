# app.py - Backend Wayne Security
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os

# Configurações
app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'supersecretkey'  # troque para algo seguro
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///wayne_security.db'  # para teste local
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
jwt = JWTManager(app)

# Modelos
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class Area(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(80), nullable=False)
    restricted = db.Column(db.Boolean, default=True)

class Resource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    identifier = db.Column(db.String(80), unique=True, nullable=False)
    name = db.Column(db.String(80), nullable=False)
    location = db.Column(db.String(120))

class AccessLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    action = db.Column(db.String(80))
    area_id = db.Column(db.Integer)
    timestamp = db.Column(db.String(80))

# Inicialização do banco e seed
def init_db():
    db.create_all()
    # Seed usuário admin
    if not User.query.filter_by(username="bruce").first():
        admin = User(
            username="bruce",
            password=generate_password_hash("wayne123")
        )
        db.session.add(admin)
        db.session.commit()

# Rotas de autenticação
@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"msg": "Usuário ou senha incorretos"}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({"access_token": access_token})

# Dashboard summary
@app.route("/dashboard/summary")
@jwt_required()
def dashboard_summary():
    total_users = User.query.count()
    total_resources = Resource.query.count()
    devices_online = 0  # placeholder
    recent_logs = AccessLog.query.order_by(AccessLog.id.desc()).limit(5).all()
    logs_list = [
        {"user_id": log.user_id, "action": log.action, "area_id": log.area_id, "timestamp": log.timestamp}
        for log in recent_logs
    ]
    return jsonify({
        "total_users": total_users,
        "total_resources": total_resources,
        "devices_online": devices_online,
        "recent_access_logs": logs_list
    })

# Áreas
@app.route("/api/areas", methods=["GET", "POST"])
@jwt_required()
def areas():
    if request.method == "GET":
        all_areas = Area.query.all()
        return jsonify([{"id": a.id, "code": a.code, "name": a.name, "restricted": a.restricted} for a in all_areas])
    elif request.method == "POST":
        data = request.get_json()
        area = Area(code=data["code"], name=data["name"], restricted=data.get("restricted", True))
        db.session.add(area)
        db.session.commit()
        return jsonify({"msg": "Área criada"}), 201

@app.route("/api/areas/<int:area_id>/request", methods=["POST"])
@jwt_required()
def request_area_access(area_id):
    current_user = get_jwt_identity()
    # Apenas simulação
    return jsonify({"msg": "Solicitação registrada"}), 202

# Recursos
@app.route("/api/resources", methods=["GET", "POST"])
@jwt_required()
def resources():
    if request.method == "GET":
        all_res = Resource.query.all()
        return jsonify([{"id": r.id, "identifier": r.identifier, "name": r.name, "location": r.location} for r in all_res])
    elif request.method == "POST":
        data = request.get_json()
        res = Resource(identifier=data["identifier"], name=data["name"], location=data.get("location"))
        db.session.add(res)
        db.session.commit()
        return jsonify({"msg": "Recurso criado"}), 201

# Inicialização do app
if __name__ == "__main__":
    with app.app_context():
        init_db()
    app.run(debug=True)
