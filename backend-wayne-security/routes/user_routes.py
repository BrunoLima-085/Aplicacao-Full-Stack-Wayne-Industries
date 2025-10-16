from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import User

bp = Blueprint('users', __name__, url_prefix='/api/users')

@bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'nome': u.nome,
        'email': u.email,
        'cargo': u.cargo,
        'criado_em': u.criado_em.isoformat()
    } for u in users])
