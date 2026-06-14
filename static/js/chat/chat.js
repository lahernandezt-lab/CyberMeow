/**
 * static/js/chat/chat.js
 * ────────────────────────────────────────────────────────────
 * Crea la conexión Socket.IO compartida y maneja todos los
 * eventos de presencia del mundo (llegada, salida, movimiento).
 *
 * Expone:
 *   window.chatSocket  — el socket compartido
 *   window.chatUtils   — utilidades de render de mensajes
 */

(function () {

  // ── Conexión única ───────────────────────────────────────────
  const socket = io({ transports: ['websocket', 'polling'] });
  window.chatSocket = socket;

  // ── Utilidades de mensajes ───────────────────────────────────
  const PALETTE = ['#4f6fff','#ff6ef7','#6ef7ff','#f7e66e',
                   '#6effa0','#ff9f6e','#c06fff','#6effcf'];

  window.chatUtils = {

    nameToColor(name) {
      let hash = 0;
      for (let i = 0; i < name.length; i++)
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      return PALETTE[Math.abs(hash) % PALETTE.length];
    },

    renderMsg(container, m) {
      const div = document.createElement('div');
      if (m.system) {
        div.className   = 'msg msg-system';
        div.textContent = m.texto;
      } else {
        const own = m.own ?? (m.autor === window.SESSION_USERNAME);
        div.className = 'msg' + (own ? ' msg-own' : '');

        const authorSpan       = document.createElement('span');
        authorSpan.className   = 'msg-author';
        authorSpan.style.color = own ? '#7090ff' : window.chatUtils.nameToColor(m.autor);
        authorSpan.textContent = m.autor;

        const textSpan       = document.createElement('span');
        textSpan.className   = 'msg-text';
        textSpan.textContent = m.texto;

        const timeSpan       = document.createElement('span');
        timeSpan.className   = 'msg-time';
        timeSpan.textContent = m.timestamp || '';

        div.appendChild(authorSpan);
        div.appendChild(textSpan);
        div.appendChild(timeSpan);
      }
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    },
  };

  // ── Eventos de presencia del mundo ───────────────────────────

  /**
   * Al conectarse: el servidor manda el estado completo del mundo.
   * Spawneamos todos los gaticos que ya estaban conectados.
   */
  socket.on('mundo_estado', function (usuarios) {
    usuarios.forEach(function (u) {
      if (u.nombre === window.SESSION_USERNAME) return; // no duplicar al propio jugador
      _spawnOtro(u);
    });
  });

  /**
   * Alguien entró al mundo mientras ya estábamos conectados.
   */
  socket.on('usuario_entro', function (u) {
    if (u.nombre === window.SESSION_USERNAME) return;
    _spawnOtro(u);
  });

  /**
   * Alguien se desconectó.
   */
  socket.on('usuario_salio', function (data) {
    if (typeof window.worldRemoveAvatar === 'function')
      window.worldRemoveAvatar(data.nombre);
  });

  /**
   * Alguien se movió — actualizar su posición en el mundo 3D.
   */
  socket.on('usuario_movio', function (data) {
    if (typeof window.worldMoveAvatar === 'function')
      window.worldMoveAvatar(data.nombre, data.x, data.z);
  });

  // ── Helper interno ────────────────────────────────────────────

  function _spawnOtro(u) {
    if (typeof window.worldSpawnAvatar === 'function') {
      window.worldSpawnAvatar({
        nombre:   u.nombre,
        color:    u.color    || 'naranja',
        sombrero: u.sombrero || 'ninguno',
        collar:   u.collar   || 'ninguno',
        genero:   u.genero   || 'Macho',
        x:        u.x        ?? (Math.random() - 0.5) * 6,
        z:        u.z        ?? (Math.random() - 0.5) * 6,
      });
    }
  }

  // ── Log de conexión ──────────────────────────────────────────
  socket.on('connect',       () => console.log('[chat] conectado:', socket.id));
  socket.on('disconnect',    () => console.log('[chat] desconectado'));
  socket.on('connect_error', e  => console.warn('[chat] error:', e.message));

})();
