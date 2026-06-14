from auth.models import db
from chat.models import Mensaje

MAX_GLOBAL  = 100
MAX_PRIVADO = 100


def guardar_global(autor: str, texto: str) -> Mensaje:
    """Guarda un mensaje global y elimina los más antiguos si se pasa del límite."""
    msg = Mensaje(autor=autor, texto=texto, tipo='global')
    db.session.add(msg)
    db.session.flush()   # obtiene el id sin cerrar la transacción

    # Cuántos mensajes globales hay ahora
    total = Mensaje.query.filter_by(tipo='global').count()
    if total > MAX_GLOBAL:
        # Borra los más viejos (los que sobran)
        ids_viejos = (
            Mensaje.query
            .filter_by(tipo='global')
            .order_by(Mensaje.id.asc())
            .limit(total - MAX_GLOBAL)
            .with_entities(Mensaje.id)
            .all()
        )
        Mensaje.query.filter(Mensaje.id.in_([r.id for r in ids_viejos])).delete(synchronize_session=False)

    db.session.commit()
    return msg


def guardar_privado(autor: str, destino: str, texto: str) -> Mensaje:
    """Guarda un mensaje privado entre dos usuarios y mantiene el límite por pareja."""
    msg = Mensaje(autor=autor, texto=texto, tipo='privado', destino=destino)
    db.session.add(msg)
    db.session.flush()

    # La sala privada es la misma sin importar quién escribe a quién
    sala_ids = _ids_sala_privada(autor, destino)
    total = len(sala_ids)
    if total > MAX_PRIVADO:
        sobran = total - MAX_PRIVADO
        ids_borrar = sala_ids[:sobran]   # los más viejos están al inicio (asc)
        Mensaje.query.filter(Mensaje.id.in_(ids_borrar)).delete(synchronize_session=False)

    db.session.commit()
    return msg


def historial_global(limit: int = MAX_GLOBAL):
    """Devuelve los últimos N mensajes globales ordenados cronológicamente."""
    return (
        Mensaje.query
        .filter_by(tipo='global')
        .order_by(Mensaje.id.desc())
        .limit(limit)
        .all()[::-1]   # invertir para mostrar del más viejo al más nuevo
    )


def historial_privado(usuario1: str, usuario2: str, limit: int = MAX_PRIVADO):
    """Devuelve los últimos N mensajes privados entre dos usuarios."""
    msgs = (
        Mensaje.query
        .filter_by(tipo='privado')
        .filter(
            db.or_(
                db.and_(Mensaje.autor == usuario1, Mensaje.destino == usuario2),
                db.and_(Mensaje.autor == usuario2, Mensaje.destino == usuario1),
            )
        )
        .order_by(Mensaje.id.desc())
        .limit(limit)
        .all()
    )
    return msgs[::-1]


# ── helpers ──────────────────────────────────────────────────────────────────

def _ids_sala_privada(u1: str, u2: str):
    """IDs de todos los mensajes de la sala privada, ordenados de más viejo a más nuevo."""
    rows = (
        Mensaje.query
        .filter_by(tipo='privado')
        .filter(
            db.or_(
                db.and_(Mensaje.autor == u1, Mensaje.destino == u2),
                db.and_(Mensaje.autor == u2, Mensaje.destino == u1),
            )
        )
        .order_by(Mensaje.id.asc())
        .with_entities(Mensaje.id)
        .all()
    )
    return [r.id for r in rows]