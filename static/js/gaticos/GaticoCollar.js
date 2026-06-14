export class GaticoCollar {

    static create(tipo = "ninguno") {

        const group = new THREE.Group();

        switch (tipo) {
            case "rojo":         group.add(this._collar(0xdd2222)); break;
            case "azul":         group.add(this._collar(0x2255dd)); break;
            case "corbata_roja": group.add(this._corbata(0xcc1111)); break;
            case "corbata_azul": group.add(this._corbata(0x1133bb)); break;
        }

        return group;
    }

    static _collar(color) {
        const banda = new THREE.Mesh(
            new THREE.BoxGeometry(0.30, 0.08, 0.26),
            new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
        );
        banda.position.y = 0.60;
        return banda;
    }

    static _corbata(color) {
        const mat   = new THREE.MeshStandardMaterial({ color, roughness: 0.5 });
        const group = new THREE.Group();

        // Nudo bajado al pecho
        const nudo = new THREE.Mesh(
            new THREE.BoxGeometry(0.10, 0.09, 0.06), mat
        );
        nudo.position.set(0, 0.50, 0.19);

        // Cuerpo más abajo
        const cuerpo = new THREE.Mesh(
            new THREE.BoxGeometry(0.09, 0.22, 0.04), mat
        );
        cuerpo.position.set(0, 0.33, 0.19);

        // Punta
        const punta = new THREE.Mesh(
            new THREE.ConeGeometry(0.05, 0.08, 4), mat
        );
        punta.rotation.y = Math.PI / 4;
        punta.position.set(0, 0.21, 0.19);

        group.add(nudo, cuerpo, punta);
        return group;
    }
}