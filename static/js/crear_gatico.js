(function () {

  const canvas    = document.getElementById('previewCanvas');
  const renderer  = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);   // fondo transparente

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }


  const scene = new THREE.Scene();


  const shadowGeo = new THREE.CircleGeometry(0.35, 32);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0xE8DDD5, transparent: true, opacity: 0.5 });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -0.01;
  scene.add(shadowMesh);


  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 20);
  camera.position.set(1.4, 1.2, 2.2);
  camera.lookAt(0, 0.4, 0);


  scene.add(new THREE.AmbientLight(0xFFF2E6, 0.9));

  const keyLight = new THREE.DirectionalLight(0xFFFFFF, 0.6);
  keyLight.position.set(3, 5, 3);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xFFE4C4, 0.3);
  fillLight.position.set(-3, 2, -1);
  scene.add(fillLight);


  const nombre = (typeof PREVIEW_USERNAME !== 'undefined') ? PREVIEW_USERNAME : 'Michi';
  const gato   = new GaticoAvatar(nombre, 'naranja', scene);
  gato.setPosition(0, 0, 0);


  let rotY = -0.4;   // ángulo inicial ligeramente de lado


  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.016;

    // Rotación lenta continua
    rotY += 0.008;
    gato.getGroup().rotation.y = rotY;

    gato.update(t);
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', resize);
  resize();
  animate();


  /** Llamar desde los botones de color del formulario */
  window.previewSetColor = function (colorName) {
    gato.setColor(colorName);
  };

})();