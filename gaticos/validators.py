from gaticos.catalogos import (
    COLORES,
    GENEROS,
    SOMBREROS,
    COLLARES
)


def validar_color(color):
    if color.lower() not in COLORES:
        raise ValueError(
            f"Color no permitido: {color}"
        )


def validar_genero(genero):
    if genero not in GENEROS:
        raise ValueError(
            f"Género no permitido: {genero}"
        )


def validar_sombrero(sombrero):
    if sombrero not in SOMBREROS:
        raise ValueError(
            f"Sombrero no permitido: {sombrero}"
        )


def validar_collar(collar):
    if collar not in COLLARES:
        raise ValueError(
            f"Collar no permitido: {collar}"
        )