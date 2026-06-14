from flask import Blueprint, request, jsonify, render_template, session, redirect, url_for
from gaticos.service import GaticoService
from gaticos.models import GaticoModel
from auth.models import db

gaticos_bp = Blueprint('gaticos', __name__, url_prefix='/api/gaticos')


@gaticos_bp.route('/creador', methods=['GET'])
def crear_personaje_page():
    """
    FIX: Esta página SOLO se muestra si el usuario NO tiene gatico todavía.
    Si ya tiene gatico, lo mandamos al editor o al index.
    """
    if 'usuario' not in session:
        return redirect(url_for('auth.login_page'))

    gatico_existente = GaticoModel.query.filter_by(username=session['usuario']).first()
    if gatico_existente:
        # Ya tiene gatico → no puede volver a crear, va al mundo
        return redirect(url_for('index'))

    return render_template('crear_gatico.html', usuario=session['usuario'], user_id=session.get('user_id'))


@gaticos_bp.route('/crear', methods=['POST'])
def crear_gatico_route():
    if 'usuario' not in session:
        return jsonify({"error": "No autenticado"}), 401

    data     = request.get_json() or {}
    user_id  = data.get('user_id') or session.get('user_id')
    username = data.get('username') or session.get('usuario')
    color    = data.get('color')
    genero   = data.get('genero')
    sombrero = data.get('sombrero', 'ninguno')
    collar   = data.get('collar', 'ninguno')

    if not all([user_id, username, color, genero]):
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    try:
        nuevo_gatico = GaticoService.registrar_gatico(user_id, username, color, genero, sombrero, collar)

        # FIX: Guardar TODOS los datos del gatico en sesión al crearlos
        session['color_gato'] = nuevo_gatico.color
        session['sombrero']   = nuevo_gatico.sombrero
        session['collar']     = nuevo_gatico.collar
        session['genero']     = nuevo_gatico.genero

        return jsonify({
            "success": True,
            "message": "¡Gatico creado con éxito!",
            "gatico": nuevo_gatico.to_dict(),
            "redirect_to": "/"
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@gaticos_bp.route('/editar', methods=['PUT'])
def editar_gatico_route():
    if 'usuario' not in session:
        return jsonify({"error": "No autenticado"}), 401

    data    = request.get_json() or {}
    user_id = session.get('user_id')

    gatico = GaticoModel.query.filter_by(user_id=user_id).first()
    if not gatico:
        return jsonify({"error": "No tienes un gatico creado"}), 404

    if 'color'    in data: gatico.color    = data['color'].lower()
    if 'genero'   in data: gatico.genero   = data['genero']
    if 'sombrero' in data: gatico.sombrero = data['sombrero']
    if 'collar'   in data: gatico.collar   = data['collar']

    db.session.commit()

    # FIX: Actualizar TODOS los datos del gatico en sesión
    session['color_gato'] = gatico.color
    session['sombrero']   = gatico.sombrero
    session['collar']     = gatico.collar
    session['genero']     = gatico.genero

    return jsonify({"success": True, "gatico": gatico.to_dict()})


@gaticos_bp.route('/mi-gatico', methods=['GET'])
def mi_gatico():
    """Endpoint para que el frontend pueda consultar los datos del gatico del usuario actual."""
    if 'usuario' not in session:
        return jsonify({"error": "No autenticado"}), 401

    gatico = GaticoModel.query.filter_by(username=session['usuario']).first()
    if not gatico:
        return jsonify({"tiene_gatico": False}), 200

    return jsonify({"tiene_gatico": True, "gatico": gatico.to_dict()}), 200
