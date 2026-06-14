// static/js/gaticos/GaticoNameTag.js

export class GaticoNameTag {

    static create(nombre) {

        const canvas = document.createElement('canvas');
        canvas.width  = 256;
        canvas.height = 64;

        const ctx = canvas.getContext('2d');

        // Fondo semitransparente
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.roundRect(4, 4, 248, 56, 12);
        ctx.fill();

        // Texto del nombre
        ctx.fillStyle = '#3d3d3a';
        ctx.font = 'bold 28px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(nombre, 128, 32);

        const texture = new THREE.CanvasTexture(canvas);

        const mat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
        });

        const geo  = new THREE.PlaneGeometry(0.7, 0.175);
        const mesh = new THREE.Mesh(geo, mat);

        // Posición encima de la cabeza
        mesh.position.set(0, 1.25, 0);

        return mesh;
    }
}