export class GaticoEars {

    static create(furMesh) {

        const group = new THREE.Group();

        const earGeo = new THREE.ConeGeometry(0.07, 0.13, 4);
        earGeo.rotateY(Math.PI / 4);

        // Tope cabeza = 0.94 → orejas arrancan ahí
        const leftEar = furMesh(earGeo);
        leftEar.position.set(-0.10, 0.96, 0.02);
        group.add(leftEar);

        const rightEar = furMesh(earGeo.clone());
        rightEar.position.set(0.10, 0.96, 0.02);
        group.add(rightEar);

        return group;
    }
}