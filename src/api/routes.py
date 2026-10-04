import re
from flask import Blueprint, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash
from api.models import db, User

api = Blueprint('api', __name__)
CORS(api)

def credentials():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return None, None
    email, password = data.get('email'), data.get('password')
    if not isinstance(email, str) or not isinstance(password, str):
        return None, None
    return email.strip().lower(), password

@api.route('/signup', methods=['POST'])
def signup():
    email, password = credentials()
    if not email or len(email) > 120 or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email):
        return jsonify(message='Introduce un correo electrónico válido.'), 400
    if not password or not 8 <= len(password) <= 128:
        return jsonify(message='La contraseña debe tener entre 8 y 128 caracteres.'), 400
    # La columna conserva su nombre para reutilizar la migración de la plantilla.
    user = User(email=email, password=generate_password_hash(password), is_active=True)
    db.session.add(user)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify(message='Este correo ya está registrado. Inicia sesión.'), 409
    return jsonify(message='Cuenta creada. Ya puedes iniciar sesión.', user=user.serialize()), 201

@api.route('/token', methods=['POST'])
@api.route('/login', methods=['POST'])
def login():
    email, password = credentials()
    if not email or not password or len(password) > 128:
        return jsonify(message='Correo o contraseña incorrectos.'), 401
    user = db.session.execute(db.select(User).where(User.email == email)).scalar_one_or_none()
    valid = False
    if user and user.is_active:
        try:
            valid = check_password_hash(user.password, password)
        except (ValueError, TypeError):
            valid = False
    if not valid:
        return jsonify(message='Correo o contraseña incorrectos.'), 401
    return jsonify(access_token=create_access_token(identity=str(user.id)), user=user.serialize()), 200

@api.route('/private', methods=['GET'])
@jwt_required()
def private():
    identity = get_jwt_identity()
    if not isinstance(identity, str) or not identity.isdecimal():
        return jsonify(message='Sesión no válida.'), 401
    user = db.session.get(User, int(identity))
    if not user or not user.is_active:
        return jsonify(message='La sesión ya no es válida.'), 401
    return jsonify(message='Este contenido solo se entrega con un token válido.', user=user.serialize()), 200
