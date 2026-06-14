from auth.models import db, Usuario


class UserRepository:

    def find_by_correo(self, correo):
        return Usuario.query.filter_by(correo=correo).first()

    def create_user(self, correo, password_hash, nombre_usuario):
        usuario = Usuario(
            correo=correo,
            password_hash=password_hash,
            nombre_usuario=nombre_usuario,
            verificado=False
        )
        db.session.add(usuario)
        db.session.commit()
        return usuario