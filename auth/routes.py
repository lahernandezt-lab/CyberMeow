from flask import Blueprint, render_template, request, redirect, url_for, session, jsonify, current_app
from auth.service import AuthService

auth_bp = Blueprint('auth', __name__)


# ══════════════════════════════════════════════════════════════
#  HELPERS — JWT y correo
# ══════════════════════════════════════════════════════════════

def _enviar_verificacion(correo, nombre_usuario):
    """Genera el JWT y manda el correo de verificación."""
    import jwt
    from datetime import datetime, timedelta
    from redmail import gmail

    token  = jwt.encode(
        {'email_address': correo, 'exp': datetime.utcnow() + timedelta(minutes=15)},
        current_app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    enlace = url_for('auth.confirmar_email', token=token, _external=True)

    gmail.send(
        subject='Verifica tu cuenta en Nuestro Espacio',
        receivers=[correo],
        text=f"""Hola {nombre_usuario}.

Bienvenido a Nuestro Espacio.

Para activar tu cuenta, abre este enlace:

{enlace}

Este enlace vence en 15 minutos."""
    )


def _verificar_jwt(token):
    """Decodifica el JWT. Devuelve el correo o None si falla."""
    import jwt
    try:
        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return data['email_address']
    except Exception:
        return None


# ══════════════════════════════════════════════════════════════
#  HELPERS — Verificación de cuenta
# ══════════════════════════════════════════════════════════════

def _buscar_usuario(correo):
    """Devuelve el Usuario de la BD o None."""
    from auth.models import Usuario
    return Usuario.query.filter_by(correo=correo).first()


def _marcar_verificado(user_db):
    """Pone verificado=True y hace commit."""
    from auth.models import db
    user_db.verificado = True
    db.session.commit()


def _iniciar_sesion(user_db):
    """Escribe los datos del usuario en la sesión de Flask."""
    session['usuario']    = user_db.nombre_usuario
    session['correo']     = user_db.correo
    session['user_id']    = user_db.id
    session['verificado'] = True


def _respuesta_confirmacion(exito, mensaje):
    """Renderiza confirmar_correo.html con el resultado."""
    return render_template('confirmar_correo.html', exito=exito, mensaje=mensaje)


# ══════════════════════════════════════════════════════════════
#  PÁGINAS ESTÁTICAS
# ══════════════════════════════════════════════════════════════

@auth_bp.route('/login', methods=['GET'])
def login_page():
    if 'usuario' in session and session.get('verificado'):
        return redirect(url_for('index'))
    return render_template('login.html')


@auth_bp.route('/register', methods=['GET'])
def register_page():
    if 'usuario' in session and session.get('verificado'):
        return redirect(url_for('index'))
    return render_template('register.html')


@auth_bp.route('/revisar-correo', methods=['GET'])
def revisar_correo_page():
    return render_template('revisar_correo.html')


@auth_bp.route('/bienvenida', methods=['GET'])
def bienvenida_page():
    if 'usuario' not in session:
        return redirect(url_for('auth.login_page'))
    # FIX: Si ya tiene gatico, no tiene nada que hacer en bienvenida
    from gaticos.models import GaticoModel
    gatico = GaticoModel.query.filter_by(username=session['usuario']).first()
    if gatico:
        return redirect(url_for('index'))
    return render_template('bienvenida.html', usuario=session['usuario'])


# ══════════════════════════════════════════════════════════════
#  API — LOGIN
# ══════════════════════════════════════════════════════════════

@auth_bp.route('/login', methods=['POST'])
def login():
    data     = request.get_json() or {}
    correo   = data.get('correo', '').strip()
    password = data.get('password', '')

    if not correo or not password:
        return jsonify({'success': False, 'message': 'Completa todos los campos'}), 400

    result = AuthService.login(correo, password)
    if not result['success']:
        return jsonify(result), 401

    from gaticos.models import GaticoModel
    user_db = _buscar_usuario(correo)

    if not user_db.verificado:
        session['correo_pendiente_verificacion'] = correo
        try:
            _enviar_verificacion(correo, user_db.nombre_usuario)
        except Exception as e:
            return jsonify({'success': False, 'message': f'Cuenta no verificada. Error al reenviar: {str(e)}'}), 500
        return jsonify({
            'success': True,
            'message': 'Cuenta no verificada. Te reenviamos el enlace.',
            'redirect_to': url_for('auth.revisar_correo_page')
        }), 200

    _iniciar_sesion(user_db)

    gatico = GaticoModel.query.filter_by(user_id=user_db.id).first()
    if gatico:
        session['color_gato']    = gatico.color
        result['redirect_to']    = url_for('index')
    else:
        result['redirect_to'] = url_for('auth.bienvenida_page')

    return jsonify(result), 200


# ══════════════════════════════════════════════════════════════
#  API — REGISTER
# ══════════════════════════════════════════════════════════════

@auth_bp.route('/register', methods=['POST'])
def register():
    data           = request.get_json() or {}
    correo         = data.get('correo', '').strip()
    password       = data.get('password', '')
    nombre_usuario = data.get('nombre_usuario', '').strip()

    if not correo or not password or not nombre_usuario:
        return jsonify({'success': False, 'message': 'Completa todos los campos'}), 400

    result = AuthService.register(correo, password, nombre_usuario)
    if not result['success']:
        return jsonify(result), 400

    session['correo_pendiente_verificacion'] = correo

    try:
        _enviar_verificacion(correo, nombre_usuario)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Cuenta creada pero no se pudo enviar el correo: {str(e)}'}), 500

    result['redirect_to'] = url_for('auth.revisar_correo_page')
    return jsonify(result), 201


# ══════════════════════════════════════════════════════════════
#  VERIFICACIÓN DE CORREO
# ══════════════════════════════════════════════════════════════

@auth_bp.route('/confirmar/<token>', methods=['GET'])
def confirmar_email(token):
    correo = _verificar_jwt(token)
    if not correo:
        return _respuesta_confirmacion(False, 'El enlace expiró o es inválido.')

    user_db = _buscar_usuario(correo)
    if not user_db:
        return _respuesta_confirmacion(False, 'No encontramos una cuenta con ese correo.')

    _marcar_verificado(user_db)

    return _respuesta_confirmacion(True, 'Correo verificado')


@auth_bp.route('/estado-verificacion', methods=['GET'])
def estado_verificacion():
    correo = session.get('correo_pendiente_verificacion')
    if not correo:
        return jsonify({'verificado': False}), 200

    from gaticos.models import GaticoModel
    user_db = _buscar_usuario(correo)
    if not user_db or not user_db.verificado:
        return jsonify({'verificado': False}), 200

    _iniciar_sesion(user_db)
    session.pop('correo_pendiente_verificacion', None)

    gatico      = GaticoModel.query.filter_by(user_id=user_db.id).first()
    redirect_to = url_for('index') if gatico else url_for('auth.bienvenida_page')
    return jsonify({'verificado': True, 'redirect_to': redirect_to}), 200


@auth_bp.route('/reenviar-verificacion', methods=['POST'])
def reenviar_verificacion():
    data   = request.get_json() or {}
    correo = data.get('correo', '').strip() or session.get('correo_pendiente_verificacion', '')

    if not correo:
        return jsonify({'success': False, 'message': 'No se encontró el correo'}), 400

    user_db = _buscar_usuario(correo)
    if not user_db:
        return jsonify({'success': False, 'message': 'Correo no registrado'}), 404
    if user_db.verificado:
        return jsonify({'success': False, 'message': 'Esta cuenta ya está verificada'}), 400

    try:
        _enviar_verificacion(correo, user_db.nombre_usuario)
        return jsonify({'success': True, 'message': 'Correo reenviado'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error al enviar: {str(e)}'}), 500


# ══════════════════════════════════════════════════════════════
#  RESTABLECER CONTRASEÑA
# ══════════════════════════════════════════════════════════════

@auth_bp.route('/olvide-contrasena', methods=['GET'])
def olvide_contrasena_page():
    return render_template('olvide_contrasena.html')


@auth_bp.route('/olvide-contrasena', methods=['POST'])
def olvide_contrasena():
    from itsdangerous import URLSafeTimedSerializer
    from redmail import gmail
    from auth.models import Usuario

    data   = request.get_json() or {}
    correo = data.get('correo', '').strip()

    if not correo:
        return jsonify({'success': False, 'message': 'El correo es obligatorio'}), 400

    usuario = _buscar_usuario(correo)
    if not usuario:
        return jsonify({
            'success': False,
            'message': 'No hay ninguna cuenta asociada a la dirección de correo que has introducido'
        }), 404

    s      = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    token  = s.dumps(correo, salt='reset-password')
    enlace = url_for('auth.nueva_contrasena_page', token=token, _external=True)

    try:
        gmail.send(
            subject='Restablece tu contraseña en Nuestro Espacio',
            receivers=[correo],
            text=f"""Hola {usuario.nombre_usuario}.

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

Abre este enlace para crear una nueva contraseña:

{enlace}

Este enlace vence en 30 minutos.
Si no solicitaste esto, ignora este mensaje."""
        )
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error al enviar el correo: {str(e)}'}), 500

    return jsonify({'success': True, 'message': 'Te enviamos un enlace al correo'}), 200


@auth_bp.route('/nueva-contrasena/<token>', methods=['GET'])
def nueva_contrasena_page(token):
    from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
    s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        s.loads(token, salt='reset-password', max_age=1800)
    except SignatureExpired:
        return render_template('reset_resultado.html', mensaje='El enlace expiró. Solicita uno nuevo.')
    except BadSignature:
        return render_template('reset_resultado.html', mensaje='El enlace es inválido.')
    return render_template('nueva_contrasena.html', token=token)


@auth_bp.route('/nueva-contrasena', methods=['POST'])
def nueva_contrasena():
    from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature

    data      = request.get_json() or {}
    token     = data.get('token', '')
    nueva     = data.get('password', '')
    confirmar = data.get('confirmar', '')

    if not nueva or not confirmar:
        return jsonify({'success': False, 'message': 'Completa todos los campos'}), 400
    if len(nueva) < 6:
        return jsonify({'success': False, 'message': 'La contraseña debe tener al menos 6 caracteres'}), 400
    if nueva != confirmar:
        return jsonify({'success': False, 'message': 'Las contraseñas no coinciden'}), 400

    s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        correo = s.loads(token, salt='reset-password', max_age=1800)
    except (SignatureExpired, BadSignature):
        return jsonify({'success': False, 'message': 'El enlace expiró o es inválido'}), 400

    if not AuthService.cambiar_password(correo, nueva):
        return jsonify({'success': False, 'message': 'Usuario no encontrado'}), 404

    return jsonify({'success': True, 'message': 'Contraseña actualizada correctamente'}), 200


# ══════════════════════════════════════════════════════════════
#  LOGOUT
# ══════════════════════════════════════════════════════════════

@auth_bp.route('/logout')
def logout():
    if 'usuario' in session:
        from auth.models import db, PresenciaUsuario
        db.session.query(PresenciaUsuario).filter_by(nombre_usuario=session['usuario']).delete()
        db.session.commit()
    session.clear()
    return redirect(url_for('auth.login_page'))