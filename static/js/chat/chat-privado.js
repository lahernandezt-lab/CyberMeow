/**
 * static/js/chat/chat-privado.js
 * ────────────────────────────────────────────────────────────
 * Maneja los chats privados 1-a-1.
 * Depende de: chat.js  (window.chatSocket, window.chatUtils)
 *
 * API pública:
 *   window.chatPrivado.abrir(nombre)  — abre DM con ese usuario
 *   window.chatPrivado.cerrar()       — cierra el panel
 */

(function () {

  const MY_NAME = window.SESSION_USERNAME || 'Yo';

  // ── Estado ───────────────────────────────────────────────────
  let destinatario = null;   // con quién está abierto el DM ahora

  // ── Referencias al DOM ───────────────────────────────────────
  const panel     = document.getElementById('privateChatPanel');
  const titulo    = document.getElementById('privateChatTitle');
  const container = document.getElementById('privateMessages');
  const input     = document.getElementById('privateInput');
  const sendBtn   = document.getElementById('privateSend');
  const closeBtn  = document.getElementById('privateClose');

  // ── Abrir DM ─────────────────────────────────────────────────

  function abrir(destino) {
    if (!destino || destino === MY_NAME) return;

    // Si ya había uno abierto, salir de esa sala primero
    if (destinatario && destinatario !== destino) {
      window.chatSocket.emit('cerrar_privado', { destino: destinatario });
    }

    destinatario = destino;

    // Pedir historial al servidor (también une al cliente a la sala)
    window.chatSocket.emit('abrir_privado', { destino });

    // Actualizar UI
    if (titulo)    titulo.textContent = '💬 ' + destino;
    if (container) container.innerHTML = '';
    if (panel)     panel.classList.remove('hidden');
    if (input)     input.focus();
  }

  // ── Cerrar DM ────────────────────────────────────────────────

  function cerrar() {
    if (destinatario)
      window.chatSocket.emit('cerrar_privado', { destino: destinatario });
    destinatario = null;
    if (panel) panel.classList.add('hidden');
  }

  // ── Enviar mensaje privado ────────────────────────────────────

  function enviar() {
    if (!destinatario || !input) return;
    const texto = input.value.trim();
    if (!texto) return;
    window.chatSocket.emit('mensaje_privado', { destino: destinatario, texto });
    input.value = '';
    input.focus();
  }

  // ── Eventos Socket.IO ────────────────────────────────────────

  // Historial al abrir
  window.chatSocket.on('historial_privado', function (data) {
    if (!container) return;
    container.innerHTML = '';
    (data.mensajes || []).forEach(m =>
      window.chatUtils.renderMsg(container, m)
    );
  });

  // Mensaje en tiempo real (solo mostrar si es la conv. activa)
  window.chatSocket.on('mensaje_privado', function (m) {
    if (!container) return;
    const esMio      = m.autor === MY_NAME;
    const esActivo   = m.autor === destinatario || m.destino === destinatario;
    if (!esActivo && !esMio) return;
    window.chatUtils.renderMsg(container, m);
  });

  // Error
  window.chatSocket.on('chat_error', function (data) {
    if (!container) return;
    window.chatUtils.renderMsg(container, { system: true, texto: '⚠ ' + data.error });
  });

  // ── Eventos del DOM ──────────────────────────────────────────

  if (sendBtn)  sendBtn.addEventListener('click', enviar);
  if (closeBtn) closeBtn.addEventListener('click', cerrar);
  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        enviar();
      }
    });
  }

  // ── API pública ───────────────────────────────────────────────
  window.chatPrivado = { abrir, cerrar };

})();