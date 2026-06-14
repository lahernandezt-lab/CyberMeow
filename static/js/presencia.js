/**
 * static/js/presencia.js
 * ────────────────────────────────────────────────────────────
 * Heartbeat + polling de usuarios activos.
 * Actualiza chips del panel de chat y sincroniza avatares 3D.
 * Los chips son clicables para abrir un DM con ese usuario.
 */

(function () {

  const PING_INTERVALO = 20_000;
  const POLL_INTERVALO = 20_000;

  const elChips = document.getElementById('usersOnline');
  const elCount = document.getElementById('chatOnlineCount');
  const elWorld = document.getElementById('worldUserCount');

  let usuariosPrevios = [];
  let mapaDataPrevio  = {};

  // ── 1. Heartbeat ─────────────────────────────────────────────

  async function ping() {
    try {
      await fetch('/api/presencia/ping', { method: 'POST' });
    } catch (_) { /* red caída, ignorar */ }
  }

  // ── 2. Consultar usuarios activos ────────────────────────────

  async function actualizarUsuarios() {
    try {
      const res = await fetch('/api/presencia/usuarios-activos');
      if (!res.ok) return;
      const data = await res.json();

      const actuales = data.usuarios;
      const total    = data.total;

      // Mapa nombre → datos del gatico
      const mapaData = {};
      (data.usuarios_data || []).forEach(u => { mapaData[u.nombre] = u; });

      // Contadores
      if (elCount) elCount.textContent = `${total} conectado${total !== 1 ? 's' : ''}`;
      if (elWorld) elWorld.textContent = total;

      // Chips clicables
      renderChips(actuales);

      // Avatares 3D
      sincronizarAvatares(usuariosPrevios, actuales, mapaData);

      usuariosPrevios = actuales;
      mapaDataPrevio  = mapaData;

    } catch (_) { /* ignorar */ }
  }

  // ── 3. Chips de usuarios (clicables para DM) ─────────────────

  function renderChips(usuarios) {
    if (!elChips) return;
    elChips.innerHTML = '';

    usuarios.forEach(nombre => {
      const chip = document.createElement('div');
      chip.className = 'user-chip' + (nombre === SESSION_USERNAME ? ' active' : '');

      const dot = document.createElement('span');
      dot.className = 'dot';

      const label = document.createElement('span');
      label.textContent = nombre;

      chip.appendChild(dot);
      chip.appendChild(label);

      // Click en otro usuario → abrir DM
      if (nombre !== SESSION_USERNAME) {
        chip.style.cursor = 'pointer';
        chip.title = `Mensaje privado a ${nombre}`;
        chip.addEventListener('click', function () {
          if (typeof window.chatPrivado?.abrir === 'function') {
            window.chatPrivado.abrir(nombre);
          }
        });
      }

      elChips.appendChild(chip);
    });
  }

  // ── 4. Sincronizar avatares 3D ───────────────────────────────

  function sincronizarAvatares(anteriores, actuales, mapaData) {
    const entrados = actuales.filter(n => !anteriores.includes(n));
    const salidos  = anteriores.filter(n => !actuales.includes(n));

    entrados.forEach(nombre => {
      if (typeof window.worldSpawnAvatar !== 'function') return;
      const x    = (Math.random() - 0.5) * 6;
      const z    = (Math.random() - 0.5) * 6;
      const info = mapaData[nombre] || {};
      window.worldSpawnAvatar({
        nombre,
        color:    info.color    || 'naranja',
        sombrero: info.sombrero || 'ninguno',
        collar:   info.collar   || 'ninguno',
        genero:   info.genero   || 'Macho',
        x, z,
      });
    });

    salidos.forEach(nombre => {
      if (typeof window.worldRemoveAvatar === 'function')
        window.worldRemoveAvatar(nombre);
    });
  }

  // ── 5. Desconectar al cerrar pestaña ─────────────────────────

  window.addEventListener('beforeunload', () => {
    navigator.sendBeacon('/api/presencia/desconectar');
  });

  // ── Arranque ─────────────────────────────────────────────────

  ping();
  actualizarUsuarios();

  setInterval(ping,               PING_INTERVALO);
  setInterval(actualizarUsuarios, POLL_INTERVALO);

})();
