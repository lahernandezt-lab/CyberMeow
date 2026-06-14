from flask import Flask, render_template, session, redirect, url_for
from redmail import gmail
from auth.models import db
from auth.routes import auth_bp
from presencia.routes import presencia_bp
from gaticos.routes import gaticos_bp
from chat.routes import chat_bp
from chat.sockets import init_socketio
from perfil.routes import perfil_bp

app = Flask(__name__)

app.secret_key = 'nuestro-espacio-secret-key-2026'
app.config['SECRET_KEY'] = 'nuestro-espacio-secret-key-2026'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///nuestro_espacio.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

gmail.username = "lauritatorrea0512@gmail.com"
gmail.password = "sdhs uagn ljmg ajzn"

db.init_app(app)

# ── SocketIO ──────────────────────────────────────────────────────────────────
socketio = init_socketio(app)

# ── Blueprints ────────────────────────────────────────────────────────────────
app.register_blueprint(auth_bp,      url_prefix='/auth')
app.register_blueprint(presencia_bp, url_prefix='/api/presencia')
app.register_blueprint(gaticos_bp,   url_prefix='/api/gaticos')
app.register_blueprint(chat_bp,      url_prefix='/chat')
app.register_blueprint(perfil_bp,    url_prefix='/perfil')

# ── Tablas ────────────────────────────────────────────────────────────────────
with app.app_context():
    from auth.models import Usuario, PresenciaUsuario
    from gaticos.models import GaticoModel
    from chat.models import Mensaje
    from perfil.models import Amistad
    db.create_all()


@app.route('/')
def index():
    if 'usuario' not in session:
        return redirect(url_for('auth.login_page'))
    if not session.get('verificado', False):
        return redirect(url_for('auth.revisar_correo_page'))

    from gaticos.models import GaticoModel
    gatico = GaticoModel.query.filter_by(username=session['usuario']).first()

    # FIX: Si el usuario no tiene gatico, redirigir a bienvenida para crearlo
    if not gatico:
        return redirect(url_for('auth.bienvenida_page'))

    # FIX: Guardar TODOS los datos del gatico en sesión para que el mundo los use
    session['color_gato'] = gatico.color
    session['sombrero']   = gatico.sombrero
    session['collar']     = gatico.collar
    session['genero']     = gatico.genero

    data = {
        'titulo':     'Nuestro Espacio',
        'usuario':    session['usuario'],
        'color_gato': gatico.color,
        'sombrero':   gatico.sombrero,
        'collar':     gatico.collar,
        'genero':     gatico.genero,
    }
    return render_template('index.html', data=data)


if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
