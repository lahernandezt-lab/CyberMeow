from flask import Blueprint, jsonify, session, abort
from chat import service

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/')
def index():
    """
    Página principal del chat.
    El template chat.html carga chat-global.js y chat-privado.js.
    """
    if 'usuario' not in session:
        abort(401)
    from flask import render_template
    return render_template('chat.html', usuario=session['usuario'])


@chat_bp.route('/historial/global')
def historial_global():
    """Devuelve el historial global en JSON (útil para debug o futuras features)."""
    if 'usuario' not in session:
        abort(401)
    return jsonify(service.cargar_historial_global())


@chat_bp.route('/historial/privado/<destino>')
def historial_privado(destino):
    """Devuelve el historial privado entre el usuario actual y <destino>."""
    autor = session.get('usuario')
    if not autor:
        abort(401)
    return jsonify(service.cargar_historial_privado(autor, destino))