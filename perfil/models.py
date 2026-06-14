from auth.models import db
from datetime import datetime


class Amistad(db.Model):
    """
    Relación entre dos usuarios.
    - estado: 'pendiente' | 'aceptada'
    - solicitante_id envía la solicitud a receptor_id
    """
    __tablename__ = 'amistades'

    id              = db.Column(db.Integer, primary_key=True)
    solicitante_id  = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    receptor_id     = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    estado          = db.Column(db.String(20), nullable=False, default='pendiente')
    creado_en       = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('solicitante_id', 'receptor_id', name='uq_amistad'),
    )

    def to_dict(self):
        return {
            'id':             self.id,
            'solicitante_id': self.solicitante_id,
            'receptor_id':    self.receptor_id,
            'estado':         self.estado,
            'creado_en':      self.creado_en.isoformat() if self.creado_en else None,
        }