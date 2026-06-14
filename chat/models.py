from auth.models import db
from datetime import datetime


class Mensaje(db.Model):
    __tablename__ = 'mensajes'

    id        = db.Column(db.Integer, primary_key=True)
    autor     = db.Column(db.String(50), nullable=False)
    texto     = db.Column(db.String(500), nullable=False)
    tipo      = db.Column(db.String(10), nullable=False, default='global')   # 'global' | 'privado'
    destino   = db.Column(db.String(50), nullable=True)                      # solo para privados
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':        self.id,
            'autor':     self.autor,
            'texto':     self.texto,
            'tipo':      self.tipo,
            'destino':   self.destino,
            'timestamp': self.timestamp.strftime('%H:%M'),
        }

    def __repr__(self):
        return f'<Mensaje {self.tipo} de {self.autor}>'