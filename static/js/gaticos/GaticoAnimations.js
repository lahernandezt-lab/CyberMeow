export class GaticoAnimations {

    static idle(gatico, t, bones) {

        gatico.position.y =
            Math.sin(t * 2.0 + gatico.userData.phaseOffset) * 0.02;

        gatico.rotation.z =
            Math.sin(t * 1.0 + gatico.userData.phaseOffset) * 0.02;

        // Volver los huesos al reposo suavemente
        if (!bones) return;
        bones.armL.rotation.x = _lerp(bones.armL.rotation.x, 0, 0.12);
        bones.armR.rotation.x = _lerp(bones.armR.rotation.x, 0, 0.12);
        bones.legL.rotation.x = _lerp(bones.legL.rotation.x, 0, 0.12);
        bones.legR.rotation.x = _lerp(bones.legR.rotation.x, 0, 0.12);
    }

    /**
     * Caminar: ciclo de marcha con oscilación de huesos.
     * @param {THREE.Group} gatico
     * @param {number}      t
     * @param {object}      bones
     */
    static caminar(gatico, t, bones) {

        // Pequeño bobbing vertical
        gatico.position.y = Math.abs(Math.sin(t * 10.0)) * 0.03;
        gatico.rotation.z = 0;

        if (!bones) return;

        const swing = 0.45;   // amplitud de oscilación (radianes)
        const freq  = 10.0;   // frecuencia del ciclo

        // Brazos y piernas alternan: izquierda adelante / derecha atrás
        bones.armL.rotation.x =  Math.sin(t * freq) * swing;
        bones.armR.rotation.x = -Math.sin(t * freq) * swing;
        bones.legL.rotation.x = -Math.sin(t * freq) * swing;
        bones.legR.rotation.x =  Math.sin(t * freq) * swing;
    }

    /**
     * Saltar: piernas dobladas hacia arriba.
     * @param {THREE.Group} gatico
     * @param {number}      t
     * @param {object}      bones
     */
    static saltar(gatico, t, bones) {

        gatico.position.y = Math.abs(Math.sin(t * 6.0)) * 0.25;
        gatico.rotation.z = 0;

        if (!bones) return;

        const fold = -Math.abs(Math.sin(t * 6.0)) * 0.6;
        bones.legL.rotation.x = fold;
        bones.legR.rotation.x = fold;
        bones.armL.rotation.x = fold * 0.5;
        bones.armR.rotation.x = fold * 0.5;
    }
}

function _lerp(a, b, t) {
    return a + (b - a) * t;
}