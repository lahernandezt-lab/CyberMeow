export class GaticoHead {

    static create(furMesh) {

        const head = furMesh(
            new THREE.BoxGeometry(0.34, 0.30, 0.32)
        );
        head.position.set(0, 0.79, 0.02);
        return head;
    }
}