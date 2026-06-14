export class GaticoFace {

    static create() {

        const group = new THREE.Group();

        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
        const eyeGeo = new THREE.BoxGeometry(0.05, 0.05, 0.02);

        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.08, 0.82, 0.18);
        group.add(leftEye);

        const rightEye = leftEye.clone();
        rightEye.position.x = 0.08;
        group.add(rightEye);

        const nose = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.03, 0.02),
            new THREE.MeshBasicMaterial({ color: 0xFFB7B2 })
        );
        nose.position.set(0, 0.76, 0.18);
        group.add(nose);

        return group;
    }
}