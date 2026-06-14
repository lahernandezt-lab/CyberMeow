from gaticos.repository import GaticoRepository


class GaticoService:

    @staticmethod
    def registrar_gatico(user_id, username, color, genero, sombrero='ninguno', collar='ninguno'):
        gatico_existente = GaticoRepository.obtener_por_usuario(user_id)
        if gatico_existente:
            raise Exception("Este usuario ya tiene un gatico asignado.")

        return GaticoRepository.crear_gatico(user_id, username, color, genero, sombrero, collar)

    @staticmethod
    def obtener_gatico(user_id):
        gatico = GaticoRepository.obtener_por_usuario(user_id)
        if not gatico:
            raise Exception("Gatico no encontrado.")
        return gatico

    @staticmethod
    def equipar_prenda(user_id, prenda):
        gatico = GaticoRepository.obtener_por_usuario(user_id)
        if not gatico:
            raise Exception("Gatico no encontrado.")
        gatico.asociar_ropa(prenda)
        GaticoRepository.guardar_cambios()
        return gatico
