from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import Resource
from database import db

bp = Blueprint('resources', __name__, url_prefix='/api/resources')

@bp.route('/', methods=['GET'])
@jwt_required()
def get_resources():
    resources = Resource.query.all()
    return jsonify([{
        'id': r.id,
        'nome': r.nome,
        'tipo': r.tipo,
        'descricao': r.descricao,
        'criado_em': r.criado_em.isoformat()
    } for r in resources])

@bp.route('/', methods=['POST'])
@jwt_required()
def create_resource():
    data = request.json
    new_resource = Resource(
        nome=data['nome'],
        tipo=data.get('tipo'),
        descricao=data.get('descricao')
    )
    db.session.add(new_resource)
    db.session.commit()
    return jsonify({'message': 'Recurso criado com sucesso!'})
