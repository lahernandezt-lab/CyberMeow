from flask import session
from flask_socketio import SocketIO, emit, join_room, leave_room
from chat import service

socketio = SocketIO()

# ── Estado en memoria: posición de cada usuario ──────────────────────────────
# { nombre: { x, z, color, sombrero, collar, genero } }
_estado_mundo = {}


def init_socketio(app):
    """Inicializa SocketIO con la app de Flask."""
    socketio.init_app(app, cors_allowed_origins='*')
    return socketio


# ── Conexión ──────────────────────────────────────────────────────────────────

@socketio.on('connect')
def on_connect():
    usuario = session.get('usuario')
    if not usuario:
        return False  # rechaza la conexión si no hay sesión

    join_room('global')

    # 1. Historial del chat global solo para el recién llegado
    historial = service.cargar_historial_global()
    emit('historial_global', historial)

    # 2. Estado actual del mundo: todos los que ya están conectados
    emit('mundo_estado', list(_estado_mundo.values()))

    # 3. Avisar a TODOS los demás que este usuario llegó
    #    (include_self=False para no enviárselo a sí mismo)
    if usuario in _estado_mundo:
        emit('usuario_entro', _estado_mundo[usuario], to='global', include_self=False)


@socketio.on('disconnect')
def on_disconnect():
    usuario = session.get('usuario')
    if usuario and usuario in _estado_mundo:
        del _estado_mundo[usuario]
        emit('usuario_salio', {'nombre': usuario}, to='global', include_self=False)
    leave_room('global')


# ── Presencia: el cliente anuncia sus datos al entrar al mundo ────────────────

@socketio.on('mundo_entrar')
def on_mundo_entrar(data):
    """
    El cliente envía sus datos de gatico al conectarse al mundo.
    Espera: { color, sombrero, collar, genero, x, z }
    """
    usuario = session.get('usuario')
    if not usuario:
        return

    estado = {
        'nombre':   usuario,
        'color':    data.get('color',    'naranja'),
        'sombrero': data.get('sombrero', 'ninguno'),
        'collar':   data.get('collar',   'ninguno'),
        'genero':   data.get('genero',   'Macho'),
        'x':        float(data.get('x', 0)),
        'z':        float(data.get('z', 0)),
    }
    _estado_mundo[usuario] = estado

    # Avisar a todos los demás que llegó este usuario
    emit('usuario_entro', estado, to='global', include_self=False)


# ── Movimiento en tiempo real ─────────────────────────────────────────────────

@socketio.on('mover')
def on_mover(data):
    """
    El cliente envía su posición actualizada mientras se mueve.
    Espera: { x: float, z: float }
    Solo se rebroadcastea a los demás (include_self=False).
    """
    usuario = session.get('usuario')
    if not usuario or usuario not in _estado_mundo:
        return

    x = float(data.get('x', 0))
    z = float(data.get('z', 0))

    # Actualizar estado en memoria
    _estado_mundo[usuario]['x'] = x
    _estado_mundo[usuario]['z'] = z

    # Rebroadcast a los demás en la sala global
    emit('usuario_movio', {'nombre': usuario, 'x': x, 'z': z},
         to='global', include_self=False)


# ── Chat Global ───────────────────────────────────────────────────────────────

@socketio.on('mensaje_global')
def on_mensaje_global(data):
    """
    Espera: { texto: str }
    Emite a todos en 'global': mensaje_global con el dict del mensaje.
    """
    autor = session.get('usuario')
    if not autor:
        return

    try:
        msg = service.enviar_global(autor, data.get('texto', ''))
        emit('mensaje_global', msg, to='global')
    except ValueError as e:
        emit('chat_error', {'error': str(e)})


# ── Chat Privado ──────────────────────────────────────────────────────────────

@socketio.on('abrir_privado')
def on_abrir_privado(data):
    """
    Espera: { destino: str }
    Une al cliente a la sala privada y envía el historial.
    """
    autor   = session.get('usuario')
    destino = data.get('destino', '').strip()
    if not autor or not destino:
        return

    sala = _sala_privada(autor, destino)
    join_room(sala)

    historial = service.cargar_historial_privado(autor, destino)
    emit('historial_privado', {'destino': destino, 'mensajes': historial})


@socketio.on('mensaje_privado')
def on_mensaje_privado(data):
    """
    Espera: { destino: str, texto: str }
    Emite a la sala privada de los dos usuarios.
    """
    autor   = session.get('usuario')
    destino = data.get('destino', '').strip()
    if not autor or not destino:
        return

    try:
        msg  = service.enviar_privado(autor, destino, data.get('texto', ''))
        sala = _sala_privada(autor, destino)
        emit('mensaje_privado', msg, to=sala)
    except ValueError as e:
        emit('chat_error', {'error': str(e)})


@socketio.on('cerrar_privado')
def on_cerrar_privado(data):
    autor   = session.get('usuario')
    destino = data.get('destino', '').strip()
    if autor and destino:
        leave_room(_sala_privada(autor, destino))


# ── Helpers ───────────────────────────────────────────────────────────────────

def _sala_privada(u1: str, u2: str) -> str:
    """Nombre de sala privada determinista sin importar el orden."""
    return 'priv__' + '__'.join(sorted([u1, u2]))