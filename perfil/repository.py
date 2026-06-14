from auth.models    import db, Usuario, PresenciaUsuario
from gaticos.models import GaticoModel
from perfil.models  import Amistad
from chat.models    import Mensaje
from datetime       import datetime, timedelta
from sqlalchemy     import or_, and_


class PerfilRepository:

    @staticmethod
    def obtener_usuario(username: str):
        return Usuario.query.filter_by(nombre_usuario=username).first()

    @staticmethod
    def obtener_gatico(username: str):
        return GaticoModel.query.filter_by(username=username).first()

    @staticmethod
    def esta_online(username: str) -> bool:
        """True si el usuario hizo ping en los últimos 15 segundos."""
        presencia = PresenciaUsuario.query.filter_by(nombre_usuario=username).first()
        if not presencia:
            return False
        return (datetime.utcnow() - presencia.ultimo_ping) < timedelta(seconds=15)

    @staticmethod
    def contar_mensajes(username: str) -> int:
        try:
            return Mensaje.query.filter_by(username=username).count()
        except Exception:
            return 0

    @staticmethod
    def obtener_amigos(user_id: int):
        """Devuelve lista de Usuario que son amigos confirmados."""
        relaciones = Amistad.query.filter(
            and_(
                or_(
                    Amistad.solicitante_id == user_id,
                    Amistad.receptor_id   == user_id
                ),
                Amistad.estado == 'aceptada'
            )
        ).all()

        amigos = []
        for rel in relaciones:
            otro_id = rel.receptor_id if rel.solicitante_id == user_id else rel.solicitante_id
            usuario = Usuario.query.get(otro_id)
            if usuario:
                amigos.append(usuario)
        return amigos

    @staticmethod
    def relacion_entre(user_id: int, otro_id: int):
        """
        Devuelve la Amistad entre dos usuarios (en cualquier dirección) o None.
        """
        return Amistad.query.filter(
            or_(
                and_(Amistad.solicitante_id == user_id, Amistad.receptor_id == otro_id),
                and_(Amistad.solicitante_id == otro_id, Amistad.receptor_id == user_id),
            )
        ).first()

    @staticmethod
    def enviar_solicitud(solicitante_id: int, receptor_id: int):
        if solicitante_id == receptor_id:
            raise ValueError("No puedes enviarte una solicitud a ti mismo")
        existente = PerfilRepository.relacion_entre(solicitante_id, receptor_id)
        if existente:
            raise ValueError("Ya existe una relación entre estos usuarios")
        nueva = Amistad(solicitante_id=solicitante_id, receptor_id=receptor_id)
        db.session.add(nueva)
        db.session.commit()
        return nueva

    @staticmethod
    def aceptar_solicitud(amistad_id: int, receptor_id: int):
        rel = Amistad.query.get(amistad_id)
        if not rel or rel.receptor_id != receptor_id:
            raise ValueError("Solicitud no encontrada")
        rel.estado = 'aceptada'
        db.session.commit()
        return rel

    @staticmethod
    def eliminar_amistad(user_id: int, otro_id: int):
        rel = PerfilRepository.relacion_entre(user_id, otro_id)
        if rel:
            db.session.delete(rel)
            db.session.commit()

    @staticmethod
    def solicitudes_pendientes(user_id: int):
        """Solicitudes que otros le enviaron a este usuario y aún no acepta."""
        return Amistad.query.filter_by(receptor_id=user_id, estado='pendiente').all()