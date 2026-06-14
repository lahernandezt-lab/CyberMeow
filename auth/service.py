import hashlib
from auth.repository import UserRepository


class AuthService:

    @staticmethod
    def hash_password(password):
        """SHA-512 — misma lógica del proyecto anterior."""
        return hashlib.sha512(password.encode('utf-8')).hexdigest()

    @staticmethod
    def login(correo, password):
        repo    = UserRepository()
        usuario = repo.find_by_correo(correo)

        if not usuario:
            return {'success': False, 'message': 'Usuario no encontrado', 'code': 'NOT_FOUND'}

        if AuthService.hash_password(password) != usuario.password_hash:
            return {'success': False, 'message': 'Contraseña incorrecta', 'code': 'WRONG_PASSWORD'}

        if not usuario.verificado:
            return {'success': False, 'message': 'Debes verificar tu correo antes de entrar', 'code': 'NOT_VERIFIED', 'correo': usuario.correo}

        return {
            'success': True,
            'message': 'Login exitoso',
            'data': {
                'correo':         usuario.correo,
                'nombre_usuario': usuario.nombre_usuario
            }
        }

    @staticmethod
    def register(correo, password, nombre_usuario):
        repo = UserRepository()

        if repo.find_by_correo(correo):
            return {'success': False, 'message': 'Este correo ya está registrado', 'code': 'ALREADY_EXISTS'}

        password_hash = AuthService.hash_password(password)
        usuario = repo.create_user(correo, password_hash, nombre_usuario)

        return {
            'success': True,
            'message': 'Cuenta creada. Revisa tu correo para verificarla.',
            'data': {'id': usuario.id, 'correo': usuario.correo, 'nombre_usuario': usuario.nombre_usuario}
        }

    @staticmethod
    def marcar_verificado(correo):
        repo    = UserRepository()
        usuario = repo.find_by_correo(correo)
        if not usuario:
            return False
        usuario.verificado = True
        from auth.models import db
        db.session.commit()
        return True

    @staticmethod
    def cambiar_password(correo, nueva_password):
        repo    = UserRepository()
        usuario = repo.find_by_correo(correo)
        if not usuario:
            return False
        usuario.password_hash = AuthService.hash_password(nueva_password)
        from auth.models import db
        db.session.commit()
        return True
        repo    = UserRepository()
        usuario = repo.find_by_correo(correo)
        if not usuario:
            return {'success': False, 'message': 'Correo no registrado'}
        if usuario.verificado:
            return {'success': False, 'message': 'Esta cuenta ya está verificada'}
        return {'success': True, 'nombre_usuario': usuario.nombre_usuario}