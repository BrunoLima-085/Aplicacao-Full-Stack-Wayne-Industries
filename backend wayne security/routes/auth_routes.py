from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models import User
from database import db
from utils.security import hash_password, verify_password

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email já cadastrado'}), 400

    user = User(
        nome=data['nome'],
        email=data['email'],
        senha_hash=hash_password(data['senha']),
        cargo=data.get('cargo', 'funcionario')
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Usuário criado com sucesso!'})

@bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not verify_password(data['senha'], user.senha_hash):
        return jsonify({'error': 'Credenciais inválidas'}), 401
    token = create_access_token(identity={'id': user.id, 'cargo': user.cargo})
    return jsonify({'token': token, 'user': {'nome': user.nome, 'cargo': user.cargo}})
