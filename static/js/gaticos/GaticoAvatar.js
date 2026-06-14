import { getColorHex }      from "./GaticoColors.js";
import { GaticoBody }       from "./GaticoBody.js";
import { GaticoHead }       from "./GaticoHead.js";
import { GaticoEars }       from "./GaticoEars.js";
import { GaticoFace }       from "./GaticoFace.js";
import { GaticoHat }        from "./GaticoHat.js";
import { GaticoCollar }     from "./GaticoCollar.js";
import { GaticoNameTag }    from "./GaticoNameTag.js";
import { GaticoAnimations } from "./GaticoAnimations.js";

const SPEED      = 3.5;   // unidades/segundo
const BOUNDS     = 4.5;   // límite del suelo (grid de 10, centro en 0)
const TURN_SPEED = 10;    // rapidez con la que el gatico gira hacia donde va

export class GaticoAvatar {

    constructor(nombre, color, genero, sombrero, collar, scene = null) {

        this.nombre   = nombre;
        this.color    = color;
        this.genero   = genero;
        this.sombrero = sombrero;
        this.collar   = collar;
        this.scene    = scene;

        // Estado de movimiento
        this._isMoving   = false;
        this._targetRotY = 0;

        this._group = new THREE.Group();
        this._group.userData.phaseOffset = Math.random() * Math.PI * 2;

        this._furMat = new THREE.MeshStandardMaterial({
            color: getColorHex(color),
            roughness: 0.85
        });

        this._build();

        if (scene) scene.add(this._group);
    }



    getGroup() { return this._group; }

    setPosition(x, y, z) { this._group.position.set(x, y, z); }

    setColor(color) {
        this.color = color;
        const hex  = getColorHex(color);
        this._group.traverse(child => {
            if (child.isMesh && child.userData.isFur)
                child.material.color.setHex(hex);
        });
    }

    // ── Input WASD (solo para el avatar del jugador) ─────────────

    /**
     * Calcula y aplica el movimiento a partir de las teclas presionadas.
     * @param {{ w, a, s, d }} keys    - estado del teclado
     * @param {number}         camRotY - ángulo Y actual de la cámara
     * @param {number}         dt      - delta time en segundos
     */
    applyInput(keys, camRotY, dt) {

        let dx = 0, dz = 0;
        if (keys.w) dz -= 1;
        if (keys.s) dz += 1;
        if (keys.a) dx -= 1;
        if (keys.d) dx += 1;

        if (dx === 0 && dz === 0) {
            this._isMoving = false;
            return;
        }

        // Normalizar en diagonal
        const len = Math.sqrt(dx * dx + dz * dz);
        dx /= len;
        dz /= len;

        // Convertir dirección de espacio-cámara a espacio-mundo
        const cos =  Math.cos(camRotY);
        const sin =  Math.sin(camRotY);
        const wx  =  cos * dx + sin * dz;
        const wz  = -sin * dx + cos * dz;

        // Mover y limitar al suelo
        const pos = this._group.position;
        pos.x = THREE.MathUtils.clamp(pos.x + wx * SPEED * dt, -BOUNDS, BOUNDS);
        pos.z = THREE.MathUtils.clamp(pos.z + wz * SPEED * dt, -BOUNDS, BOUNDS);

        // Orientar el gatico hacia donde camina
        this._targetRotY = Math.atan2(wx, wz);
        this._isMoving   = true;
    }

    // ── Update (loop) ────────────────────────────────────────────

    /**
     * @param {number} t  - tiempo acumulado
     * @param {number} dt - delta time
     */
    update(t, dt = 0.016) {

        // Giro suave hacia la dirección de movimiento
        if (this._isMoving) {
            const cur      = this._group.rotation.y;
            const diff     = this._targetRotY - cur;
            // Camino más corto alrededor del círculo
            const shortest = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI;
            this._group.rotation.y += shortest * Math.min(TURN_SPEED * dt, 1);
        }

        if (this._isMoving) {
            GaticoAnimations.caminar(this._group, t, this._bones);
        } else {
            GaticoAnimations.idle(this._group, t, this._bones);
        }
    }

    destroy() {
        if (this.scene) this.scene.remove(this._group);
    }

    // ── Construcción ─────────────────────────────────────────────

    _build() {
        const bodyGroup = GaticoBody.create(this._furMesh.bind(this));
        this._bones     = bodyGroup.userData.bones;   // huesos para animación
        this._group.add(bodyGroup);

        this._group.add(GaticoHead.create(this._furMesh.bind(this)));
        this._group.add(GaticoEars.create(this._furMesh.bind(this)));
        this._group.add(GaticoFace.create());
        this._group.add(GaticoHat.create(this.sombrero));
        this._group.add(GaticoCollar.create(this.collar));
        this._group.add(GaticoNameTag.create(this.nombre));
    }

    _furMesh(geometry) {
        const mesh = new THREE.Mesh(geometry, this._furMat.clone());
        mesh.userData.isFur = true;
        mesh.castShadow     = true;
        return mesh;
    }
}