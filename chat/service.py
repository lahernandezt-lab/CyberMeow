from chat import repository


MAX_CHARS = 400   # caracteres máximos por mensaje


def enviar_global(autor: str, texto: str):
    """
    Valida y guarda un mensaje global.
    Devuelve el dict listo para emitir o lanza ValueError.
    """
    texto = texto.strip()
    _validar(autor, texto)
    msg = repository.guardar_global(autor, texto)
    return msg.to_dict()


def enviar_privado(autor: str, destino: str, texto: str):
    """
    Valida y guarda un mensaje privado.
    Devuelve el dict listo para emitir o lanza ValueError.
    """
    texto = texto.strip()
    _validar(autor, texto)
    if autor == destino:
        raise ValueError('No puedes enviarte mensajes a ti mismo.')
    msg = repository.guardar_privado(autor, destino, texto)
    return msg.to_dict()


def cargar_historial_global():
    """Devuelve lista de dicts del historial global."""
    return [m.to_dict() for m in repository.historial_global()]


def cargar_historial_privado(usuario1: str, usuario2: str):
    """Devuelve lista de dicts del historial privado entre dos usuarios."""
    return [m.to_dict() for m in repository.historial_privado(usuario1, usuario2)]


# ── helpers ──────────────────────────────────────────────────────────────────

def _validar(autor: str, texto: str):
    if not texto:
        raise ValueError('El mensaje no puede estar vacío.')
    if len(texto) > MAX_CHARS:
        raise ValueError(f'El mensaje supera los {MAX_CHARS} caracteres.')
    if not autor:
        raise ValueError('El autor no puede estar vacío.')
