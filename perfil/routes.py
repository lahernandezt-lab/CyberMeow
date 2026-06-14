from flask          import request, jsonify, render_template, session, redirect, url_for
from perfil         import perfil_bp
from perfil.repository import PerfilRepository
from gaticos.models import GaticoModel
from datetime       import datetime


def _login_required():
    if 'usuario' not in session:
        return redirect(url_for('auth.login_page'))


# ── Página de perfil ──────────────────────────────────────────────────────────

@perfil_bp.route('/<username>')
def ver_perfil(username):
    redir = _login_required()
    if redir:
        return redir

    usuario = PerfilRepository.obtener_usuario(username)
    if not usuario:
        return "Usuario no encontrado", 404

    gatico  = PerfilRepository.obtener_gatico(username)
    online  = PerfilRepository.esta_online(username)
    mensajes = PerfilRepository.contar_mensajes(username)
    amigos  = PerfilRepository.obtener_amigos(usuario.id)

    # Gaticos de los amigos (para mostrar mini-avatar con su color)
    amigos_data = []
    for amigo in amigos:
        g = GaticoModel.query.filter_by(username=amigo.nombre_usuario).first()
        amigos_data.append({
            'username': amigo.nombre_usuario,
            'color':    g.color if g else 'gris',
            'online':   PerfilRepository.esta_online(amigo.nombre_usuario),
        })

    # Relación del usuario en sesión con este perfil
    es_propio = (session['usuario'] == username)
    relacion  = None
    yo_id     = None

    if not es_propio:
        yo = PerfilRepository.obtener_usuario(session['usuario'])
        if yo:
            yo_id = yo.id
            rel = PerfilRepository.relacion_entre(yo.id, usuario.id)
            if rel:
                if rel.estado == 'aceptada':
                    relacion = 'amigos'
                elif rel.solicitante_id == yo.id:
                    relacion = 'pendiente_enviada'
                else:
                    relacion = 'pendiente_recibida'
                    relacion_id = rel.id
            else:
                relacion = 'ninguna'

    return render_template('perfil.html',
        perfil_usuario  = usuario,
        gatico          = gatico,
        online          = online,
        total_mensajes  = mensajes,
        amigos          = amigos_data,
        es_propio       = es_propio,
        relacion        = relacion,
        yo_id           = yo_id,
        yo_username     = session['usuario'],
        now             = datetime.utcnow(),
    )


# ── API: amistades ─────────────────────────────────────────────────────────────

@perfil_bp.route('/api/solicitud', methods=['POST'])
def enviar_solicitud():
    if 'usuario' not in session:
        return jsonify({'error': 'No autenticado'}), 401
    data       = request.get_json() or {}
    receptor   = PerfilRepository.obtener_usuario(data.get('receptor_username', ''))
    yo         = PerfilRepository.obtener_usuario(session['usuario'])
    if not receptor or not yo:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    try:
        PerfilRepository.enviar_solicitud(yo.id, receptor.id)
        return jsonify({'ok': True})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400


@perfil_bp.route('/api/aceptar', methods=['POST'])
def aceptar_solicitud():
    if 'usuario' not in session:
        return jsonify({'error': 'No autenticado'}), 401
    data   = request.get_json() or {}
    yo     = PerfilRepository.obtener_usuario(session['usuario'])
    try:
        PerfilRepository.aceptar_solicitud(data.get('amistad_id'), yo.id)
        return jsonify({'ok': True})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400


@perfil_bp.route('/api/eliminar', methods=['POST'])
def eliminar_amistad():
    if 'usuario' not in session:
        return jsonify({'error': 'No autenticado'}), 401
    data  = request.get_json() or {}
    yo    = PerfilRepository.obtener_usuario(session['usuario'])
    otro  = PerfilRepository.obtener_usuario(data.get('otro_username', ''))
    if not otro or not yo:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    PerfilRepository.eliminar_amistad(yo.id, otro.id)
    return jsonify({'ok': True})


@perfil_bp.route('/api/pendientes')
def solicitudes_pendientes():
    if 'usuario' not in session:
        return jsonify({'error': 'No autenticado'}), 401
    yo  = PerfilRepository.obtener_usuario(session['usuario'])
    pendientes = PerfilRepository.solicitudes_pendientes(yo.id)
    result = []
    for p in pendientes:
        sol = PerfilRepository.obtener_usuario.__func__ if False else None
        from auth.models import Usuario
        sol_usuario = Usuario.query.get(p.solicitante_id)
        if sol_usuario:
            result.append({'amistad_id': p.id, 'username': sol_usuario.nombre_usuario})
    return jsonify(result)