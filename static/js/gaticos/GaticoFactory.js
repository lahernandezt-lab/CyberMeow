import { GaticoAvatar } from "./GaticoAvatar.js";

export class GaticoFactory {

    static crear({
        nombre,
        color = "naranja",
        genero = "Macho",
        sombrero = "ninguno",
        collar = "ninguno",
        scene = null
    }) {

        return new GaticoAvatar(
            nombre,
            color,
            genero,
            sombrero,
            collar,
            scene
        );
    }

}