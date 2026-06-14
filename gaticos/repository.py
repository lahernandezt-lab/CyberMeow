from gaticos.models import GaticoModel, db


class GaticoRepository:

    @staticmethod
    def crear_gatico(user_id, username, color, genero, sombrero='ninguno', collar='ninguno'):
        nuevo_gatico = GaticoModel(
            user_id=user_id,
            username=username,
            color=color,
            genero=genero,
            sombrero=sombrero,
            collar=collar
        )
        db.session.add(nuevo_gatico)
        db.session.commit()
        return nuevo_gatico

    @staticmethod
    def obtener_por_usuario(user_id):
        return GaticoModel.query.filter_by(user_id=user_id).first()

    @staticmethod
    def guardar_cambios():
        db.session.commit()