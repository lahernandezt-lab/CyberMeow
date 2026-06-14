export class GaticoBody {

    static create(furMesh) {

        const group = new THREE.Group();

        // ── Cuerpo ────────────────────────────────────────────
        const body = furMesh(new THREE.BoxGeometry(0.38, 0.45, 0.35));
        body.position.y = 0.35;
        body.receiveShadow = true;
        group.add(body);

        // ── Cuello ────────────────────────────────────────────
        const neck = furMesh(new THREE.CylinderGeometry(0.10, 0.12, 0.08, 10));
        neck.position.y = 0.60;
        group.add(neck);

        // ── Brazos (pivot en el hombro y=0.53) ────────────────
        const armL = GaticoBody._hueso(furMesh, new THREE.BoxGeometry(0.08, 0.28, 0.08));
        armL.position.set(-0.26, 0.53, 0);
        group.add(armL);

        const armR = GaticoBody._hueso(furMesh, new THREE.BoxGeometry(0.08, 0.28, 0.08));
        armR.position.set(0.26, 0.53, 0);
        group.add(armR);

        // ── Piernas (pivot en la cadera y=0.22) ───────────────
        const legL = GaticoBody._hueso(furMesh, new THREE.BoxGeometry(0.13, 0.22, 0.14));
        legL.position.set(-0.11, 0.22, 0);
        group.add(legL);

        const legR = GaticoBody._hueso(furMesh, new THREE.BoxGeometry(0.13, 0.22, 0.14));
        legR.position.set(0.11, 0.22, 0);
        group.add(legR);

        // ── Pies (hijos de las piernas, heredan su rotación) ──
        const footL = furMesh(new THREE.BoxGeometry(0.12, 0.07, 0.18));
        footL.position.set(0, -0.15, 0.04);
        legL.add(footL);

        const footR = furMesh(new THREE.BoxGeometry(0.12, 0.07, 0.18));
        footR.position.set(0, -0.15, 0.04);
        legR.add(footR);

        // Exponer los huesos para la animación
        group.userData.bones = { armL, armR, legL, legR };

        return group;
    }

    /**
     * Crea un Group-hueso: el pivot queda en (0,0,0) y la malla
     * se desplaza la mitad de su altura hacia abajo.
     */
    static _hueso(furMesh, geometry) {
        const bone = new THREE.Group();
        const mesh = furMesh(geometry);
        mesh.position.y = -(geometry.parameters.height / 2);
        bone.add(mesh);
        return bone;
    }
}