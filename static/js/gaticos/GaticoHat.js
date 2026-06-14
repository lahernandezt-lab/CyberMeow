export class GaticoHat {

    static create(tipo = "ninguno") {

        const group = new THREE.Group();

        switch (tipo) {
            case "cumpleanos": group.add(this._cumpleanos()); break;
            case "negro":      group.add(this._sombreroNegro()); break;
            case "paja":       group.add(this._sombreroPaja()); break;
            case "casco_militar":      group.add(this._cascoMilitar()); break;
            case "gorra":      group.add(this._gorra()); break;
        }

        return group;
    }

    // Tope cabeza = 0.94, orejas en y=0.96 → sobresalen solas

    static _cumpleanos() {
        const group = new THREE.Group();
        const cone = new THREE.Mesh(
            new THREE.ConeGeometry(0.09, 0.24, 12),
            new THREE.MeshStandardMaterial({ color: 0xff77aa })
        );
        cone.position.set(0, 1.06, 0);
        const pom = new THREE.Mesh(
            new THREE.SphereGeometry(0.025, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        pom.position.set(0, 1.19, 0);
        group.add(cone, pom);
        return group;
    }

    static _sombreroNegro() {
        const group = new THREE.Group();
        const ala = new THREE.Mesh(
            new THREE.CylinderGeometry(0.20, 0.20, 0.03, 20),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
        );
        ala.position.y = 0.94;
        const copa = new THREE.Mesh(
            new THREE.CylinderGeometry(0.10, 0.10, 0.20, 16),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
        );
        copa.position.y = 1.05;
        const banda = new THREE.Mesh(
            new THREE.CylinderGeometry(0.102, 0.102, 0.03, 16),
            new THREE.MeshStandardMaterial({ color: 0x555555 })
        );
        banda.position.y = 0.97;
        group.add(ala, copa, banda);
        return group;
    }

    static _sombreroPaja() {
        const group = new THREE.Group();
        const ala = new THREE.Mesh(
            new THREE.CylinderGeometry(0.22, 0.22, 0.03, 20),
            new THREE.MeshStandardMaterial({ color: 0xD4A843, roughness: 0.95 })
        );
        ala.position.y = 0.94;
        const copa = new THREE.Mesh(
            new THREE.CylinderGeometry(0.10, 0.11, 0.14, 20),
            new THREE.MeshStandardMaterial({ color: 0xC9983A, roughness: 0.95 })
        );
        copa.position.y = 1.02;
        const cinta = new THREE.Mesh(
            new THREE.CylinderGeometry(0.102, 0.102, 0.025, 20),
            new THREE.MeshStandardMaterial({ color: 0xff9999 })
        );
        cinta.position.y = 0.96;
        group.add(ala, copa, cinta);
        return group;
    }

static _cascoMilitar() {

    const group = new THREE.Group();

    // Casco principal
    const casco = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.18,
            16,
            12,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2
        ),
        new THREE.MeshStandardMaterial({
            color: 0x556B2F,
            roughness: 0.9
        })
    );

    casco.position.y = 1.02;
    casco.scale.z = 1.15;

    // Visera frontal
    const visera = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.03, 0.08),
        new THREE.MeshStandardMaterial({
            color: 0x4B5D23
        })
    );

    visera.position.set(0, 0.95, 0.18);
    visera.rotation.x = -0.15;

    // Correa lateral izquierda
    const correaIzq = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.12, 0.02),
        new THREE.MeshStandardMaterial({
            color: 0x3A3A3A
        })
    );

    correaIzq.position.set(-0.14, 0.90, 0);

    // Correa lateral derecha
    const correaDer = correaIzq.clone();
    correaDer.position.x = 0.14;

    group.add(
        casco,
        visera,
        correaIzq,
        correaDer
    );

    return group;
}

    static _gorra() {
        const group = new THREE.Group();
        const copa = new THREE.Mesh(
            new THREE.CylinderGeometry(0.13, 0.16, 0.16, 16),
            new THREE.MeshStandardMaterial({ color: 0xcc2222 })
        );
        copa.position.y = 1.02;
        const visera = new THREE.Mesh(
            new THREE.BoxGeometry(0.24, 0.03, 0.12),
            new THREE.MeshStandardMaterial({ color: 0xaa1111 })
        );
        visera.position.set(0, 0.94, 0.16);
        visera.rotation.x = -0.12;
        const boton = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8),
            new THREE.MeshStandardMaterial({ color: 0xaa1111 })
        );
        boton.position.y = 1.12;
        group.add(copa, visera, boton);
        return group;
    }
}