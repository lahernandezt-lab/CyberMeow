// world.js  — carga como  type="module"  en el HTML
import { GaticoFactory } from './gaticos/GaticoFactory.js';

(function () {
  const canvas    = document.getElementById('worldCanvas');
  const container = document.getElementById('worldContainer');

  // ── Renderer ──────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;

  // ── Escena ────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xF9F6F0);
  scene.fog        = new THREE.Fog(0xF9F6F0, 18, 40);

  // ── Cámara isométrica ─────────────────────────────────────────
  let zoom   = 7;
  let rotY   = Math.PI / 4;
  const camRadius = Math.sqrt(300);

  let aspect = container.clientWidth / container.clientHeight;
  const camera = new THREE.OrthographicCamera(
    -zoom * aspect, zoom * aspect,
    zoom, -zoom, 0.1, 100
  );

  const camTarget = new THREE.Vector3(0, 0, 0);

  function _updateCamera() {
    const xzDist = Math.sqrt(camRadius * camRadius - 100);
    camera.position.x = camTarget.x + Math.cos(rotY) * xzDist;
    camera.position.z = camTarget.z + Math.sin(rotY) * xzDist;
    camera.position.y = camTarget.y + 10;
    camera.lookAt(camTarget);
  }

  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    aspect = w / h;
    camera.left   = -zoom * aspect;
    camera.right  =  zoom * aspect;
    camera.top    =  zoom;
    camera.bottom = -zoom;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);
  onResize();
  _updateCamera();

  // ── Suelo ─────────────────────────────────────────────────────
  const TILE_SIZE  = 1;
  const GRID       = 10;
  const tileColors = [0xECE5DB, 0xE3DAC9];

  for (let x = -GRID / 2; x < GRID / 2; x++) {
    for (let z = -GRID / 2; z < GRID / 2; z++) {
      const geo  = new THREE.BoxGeometry(TILE_SIZE, 0.08, TILE_SIZE);
      const idx  = (Math.abs(x + z)) % 2;
      const mat  = new THREE.MeshStandardMaterial({ color: tileColors[idx], roughness: 0.9, metalness: 0.05 });
      const tile = new THREE.Mesh(geo, mat);
      tile.position.set(x + 0.5, -0.04, z + 0.5);
      tile.receiveShadow = true;
      scene.add(tile);
    }
  }

  const edgeGeo  = new THREE.EdgesGeometry(new THREE.BoxGeometry(GRID, 0.08, GRID));
  const edgeMesh = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: 0xD0C4B4 }));
  edgeMesh.position.set(0, -0.04, 0);
  scene.add(edgeMesh);

  // ── Paredes ───────────────────────────────────────────────────
  function makeWall(w, h, d, x, y, z, color = 0xDFD5C6) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0.0 })
    );
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }
  makeWall(GRID, 3, 0.15, 0,         1.5, -GRID / 2, 0xE6DFD3);
  makeWall(0.15, 3, GRID, -GRID / 2, 1.5,  0,         0xE6DFD3);

  // ── Muebles ───────────────────────────────────────────────────
  function box(w, h, d, x, y, z, color) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.1 })
    );
    mesh.position.set(x, y, z);
    mesh.castShadow    = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }
  box(4,   0.02, 4,   0,    0.01,  0,    0xFFD1DC);
  box(1.5, 0.4,  0.8, 1,    0.2,  -1,    0xCDBA96);
  box(0.5, 0.15, 0.5, 0.4,  0.075,-1,    0xBEE5B4);
  box(0.5, 0.15, 0.5, 1.6,  0.075,-1,    0xFFE4B5);
  box(2,   0.1,  0.3,-3.5,  1.5,  -4.8,  0xCDBA96);
  box(0.3, 0.4,  0.2,-3.2,  1.75, -4.8,  0xFFB37C);

  // ── Iluminación ───────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xFFF2E6, 0.7));
  const sun = new THREE.DirectionalLight(0xFFFFFF, 0.5);
  sun.position.set(6, 12, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.bias = -0.002;
  scene.add(sun);
  const floorLight = new THREE.PointLight(0xFFE4C4, 0.4, 10);
  floorLight.position.set(0, 2, 0);
  scene.add(floorLight);

  // ── Controles cámara ──────────────────────────────────────────
  document.getElementById('btnRotateLeft').addEventListener('click',  () => { rotY -= Math.PI / 8; });
  document.getElementById('btnRotateRight').addEventListener('click', () => { rotY += Math.PI / 8; });

  function applyZoom() {
    camera.left   = -zoom * aspect;
    camera.right  =  zoom * aspect;
    camera.top    =  zoom;
    camera.bottom = -zoom;
    camera.updateProjectionMatrix();
  }
  document.getElementById('btnZoomIn').addEventListener('click',  () => { zoom = Math.max(3,  zoom - 1); applyZoom(); });
  document.getElementById('btnZoomOut').addEventListener('click', () => { zoom = Math.min(12, zoom + 1); applyZoom(); });

  // ── Input teclado WASD / flechas ──────────────────────────────
  const keys = { w: false, a: false, s: false, d: false };

  function _isTyping() {
    const tag = document.activeElement?.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea';
  }

  window.addEventListener('keydown', e => {
    if (_isTyping()) return;
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp')    keys.w = true;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft')  keys.a = true;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown')  keys.s = true;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.d = true;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp')    keys.w = false;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft')  keys.a = false;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown')  keys.s = false;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.d = false;
  });

  // ── Avatares ──────────────────────────────────────────────────
  const avatarPorNombre = {};
  const allAvatars      = [];
  let   myAvatar        = null;

  function _spawnAvatar(nombre, colorName = 'naranja', sombrero = 'ninguno', collar = 'ninguno', genero = 'Macho', x = 0, z = 0) {
    if (avatarPorNombre[nombre]) return avatarPorNombre[nombre];
    const gato = GaticoFactory.crear({ nombre, color: colorName, genero, sombrero, collar, scene });
    gato.setPosition(x, 0, z);
    avatarPorNombre[nombre] = gato;
    allAvatars.push(gato);
    return gato;
  }

  // Spawn del usuario actual
  const myName     = (typeof SESSION_USERNAME   !== 'undefined') ? SESSION_USERNAME   : 'Michi';
  const myColor    = (typeof SESSION_USER_COLOR !== 'undefined') ? SESSION_USER_COLOR : 'naranja';
  const mySombrero = (typeof SESSION_SOMBRERO   !== 'undefined') ? SESSION_SOMBRERO   : 'ninguno';
  const myCollar   = (typeof SESSION_COLLAR     !== 'undefined') ? SESSION_COLLAR     : 'ninguno';
  const myGenero   = (typeof SESSION_GENERO     !== 'undefined') ? SESSION_GENERO     : 'Macho';

  myAvatar = _spawnAvatar(myName, myColor, mySombrero, myCollar, myGenero, 0, 0);

  // ── Anunciar al mundo vía socket (esperar a que chat.js lo cree) ─────────
  // chat.js se carga antes que world.js, pero world.js es módulo ES y
  // puede ejecutarse en el siguiente microtask. Esperamos al evento 'connect'.
  function _anunciarMundo() {
    const socket = window.chatSocket;
    if (!socket) return;

    const pos = myAvatar.getGroup().position;
    socket.emit('mundo_entrar', {
      color:    myColor,
      sombrero: mySombrero,
      collar:   myCollar,
      genero:   myGenero,
      x:        pos.x,
      z:        pos.z,
    });
  }

  // Si el socket ya está conectado lo anunciamos de inmediato,
  // si no, esperamos al evento 'connect'.
  if (window.chatSocket?.connected) {
    _anunciarMundo();
  } else if (window.chatSocket) {
    window.chatSocket.on('connect', _anunciarMundo);
  } else {
    // chat.js aún no corrió (edge case): reintentar en el siguiente tick
    setTimeout(function waitSocket() {
      if (window.chatSocket) {
        if (window.chatSocket.connected) _anunciarMundo();
        else window.chatSocket.on('connect', _anunciarMundo);
      } else {
        setTimeout(waitSocket, 50);
      }
    }, 0);
  }

  // ── API pública para chat.js y presencia.js ───────────────────

  window.worldSpawnAvatar = function ({ nombre, color = 'naranja', sombrero = 'ninguno', collar = 'ninguno', genero = 'Macho', x = 0, z = 0 } = {}) {
    _spawnAvatar(nombre, color, sombrero, collar, genero, x, z);
  };

  window.worldRemoveAvatar = function (nombre) {
    const gato = avatarPorNombre[nombre];
    if (!gato) return;
    gato.destroy();
    allAvatars.splice(allAvatars.indexOf(gato), 1);
    delete avatarPorNombre[nombre];
  };

  /**
   * Recibe la posición de red de otro usuario y la guarda como *target*.
   * El loop se encarga de interpolar suavemente hacia ese target cada frame,
   * y calcula la rotación a partir de la dirección de movimiento.
   */
  window.worldMoveAvatar = function (nombre, x, z) {
    const gato = avatarPorNombre[nombre];
    if (!gato) return;
    // Guardar target de red — NO mover directamente
    gato._netTarget   = { x, z };
    gato._isMoving    = true;
    gato._lastNetMove = performance.now();
  };

  // ── Emisión de posición (throttle a ~100ms) ───────────────────
  const EMIT_INTERVAL = 100;  // ms
  let   lastEmit      = 0;
  let   lastEmitX     = null;
  let   lastEmitZ     = null;

  function _emitirPosicion(x, z) {
    const now = performance.now();
    if (now - lastEmit < EMIT_INTERVAL) return;
    if (x === lastEmitX && z === lastEmitZ) return;  // no cambió
    lastEmit  = now;
    lastEmitX = x;
    lastEmitZ = z;
    if (window.chatSocket?.connected)
      window.chatSocket.emit('mover', { x, z });
  }

  // ── Loop ──────────────────────────────────────────────────────
  let t    = 0;
  let last = performance.now();

  function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const dt  = Math.min((now - last) / 1000, 0.05);
    last = now;
    t   += dt;

    // Input del jugador
    if (myAvatar) {
      myAvatar.applyInput(keys, rotY, dt);

      // Emitir posición si el jugador se movió
      if (myAvatar._isMoving) {
        const pos = myAvatar.getGroup().position;
        _emitirPosicion(pos.x, pos.z);
      }
    }

    // Animar todos los gaticos
    const LERP_SPEED = 12;  // qué tan rápido se interpola (mayor = más pegado)
    allAvatars.forEach(g => {
      if (g !== myAvatar && g._netTarget !== undefined) {
        const group  = g.getGroup();
        const prevX  = group.position.x;
        const prevZ  = group.position.z;

        // Interpolar posición hacia el target de red
        group.position.x += (g._netTarget.x - prevX) * Math.min(LERP_SPEED * dt, 1);
        group.position.z += (g._netTarget.z - prevZ) * Math.min(LERP_SPEED * dt, 1);

        // Calcular cuánto se movió este frame para saber la dirección
        const dx = group.position.x - prevX;
        const dz = group.position.z - prevZ;
        const moved = Math.sqrt(dx * dx + dz * dz);

        if (moved > 0.0005) {
          // Actualizar rotación hacia donde va (igual que applyInput del jugador)
          g._targetRotY = Math.atan2(dx, dz);
          g._isMoving   = true;
        }

        // Si lleva más de 250ms sin recibir posición nueva → idle
        if (now - g._lastNetMove > 250) g._isMoving = false;
      }
      g.update(t, dt);
    });

    // Cámara sigue al jugador
    if (myAvatar) {
      const pos = myAvatar.getGroup().position;
      camTarget.x += (pos.x - camTarget.x) * 0.08;
      camTarget.z += (pos.z - camTarget.z) * 0.08;
    }
    _updateCamera();

    renderer.render(scene, camera);
  }
  animate();
})();
