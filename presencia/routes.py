from flask import Blueprint, jsonify, session
from datetime import datetime, timedelta
from auth.models import db, PresenciaUsuario

presencia_bp = Blueprint('presencia', __name__)

TIMEOUT_SEGUNDOS = 40


def _limpiar_inactivos():
    """Elimina registros de usuarios que dejaron de hacer ping."""
    limite = datetime.utcnow() - timedelta(seconds=TIMEOUT_SEGUNDOS)
    PresenciaUsuario.query.filter(PresenciaUsuario.ultimo_ping < limite).delete()
    db.session.commit()


@presencia_bp.route('/ping', methods=['POST'])
def ping():
    if 'usuario' not in session:
        return jsonify({'error': 'No autenticado'}), 401

    nombre = session['usuario']
    ahora  = datetime.utcnow()

    presencia = PresenciaUsuario.query.filter_by(nombre_usuario=nombre).first()
    if presencia:
        presencia.ultimo_ping = ahora
    else:
        presencia = PresenciaUsuario(nombre_usuario=nombre, ultimo_ping=ahora)
        db.session.add(presencia)

    db.session.commit()
    return jsonify({'ok': True}), 200


@presencia_bp.route('/usuarios-activos', methods=['GET'])
def usuarios_activos():
    if 'usuario' not in session:
        return jsonify({'error': 'No autenticado'}), 401

    _limpiar_inactivos()

    activos = PresenciaUsuario.query.order_by(PresenciaUsuario.ultimo_ping.desc()).all()
    nombres = [p.nombre_usuario for p in activos]

    # FIX: Incluir datos del gatico de cada usuario para que el mundo 3D los use
    from gaticos.models import GaticoModel
    usuarios_con_gatico = []
    for nombre in nombres:
        gatico = GaticoModel.query.filter_by(username=nombre).first()
        usuarios_con_gatico.append({
            'nombre':   nombre,
            'color':    gatico.color    if gatico else 'naranja',
            'sombrero': gatico.sombrero if gatico else 'ninguno',
            'collar':   gatico.collar   if gatico else 'ninguno',
            'genero':   gatico.genero   if gatico else 'Macho',
        })

    return jsonify({
        'total':    len(nombres),
        'usuarios': nombres,                  # compatibilidad con código existente
        'usuarios_data': usuarios_con_gatico  # datos completos para el mundo 3D
    }), 200


@presencia_bp.route('/desconectar', methods=['POST'])
def desconectar():
    if 'usuario' not in session:
        return jsonify({'ok': True}), 200

    PresenciaUsuario.query.filter_by(nombre_usuario=session['usuario']).delete()
    db.session.commit()
    return jsonify({'ok': True}), 200

