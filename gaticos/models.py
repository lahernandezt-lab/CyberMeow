from auth.models import db

from gaticos.validators import (
    validar_color,
    validar_genero,
    validar_sombrero,
    validar_collar
)


class GaticoModel(db.Model):
    __tablename__ = 'gaticos'

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('usuarios.id'),
        nullable=False,
        unique=True
    )

    username  = db.Column(db.String(50), nullable=False)
    color     = db.Column(db.String(20), nullable=False)
    genero    = db.Column(db.String(20), nullable=False)
    sombrero  = db.Column(db.String(30), nullable=False, default='ninguno')
    collar    = db.Column(db.String(30), nullable=False, default='ninguno')

    # Se deja para no romper nada
    ropa_equipada = db.Column(db.String(255), default="")

    def __init__(self, user_id, username, color, genero, sombrero='ninguno', collar='ninguno'):
        self.user_id  = user_id
        self.username = username

        validar_color(color)
        validar_genero(genero)
        validar_sombrero(sombrero)
        validar_collar(collar)

        self.color    = color.lower()
        self.genero   = genero
        self.sombrero = sombrero
        self.collar   = collar

    def to_dict(self):
        return {
            "id":       self.id,
            "username": self.username,
            "color":    self.color,
            "genero":   self.genero,
            "sombrero": self.sombrero,
            "collar":   self.collar,
            "ropa":     self.ropa_equipada.split(',') if self.ropa_equipada else []
        }