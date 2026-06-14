/**
 * static/js/chat/chat-global.js
 * ────────────────────────────────────────────────────────────
 * Maneja el chat global de la sala.
 * Depende de: chat.js  (window.chatSocket, window.chatUtils)
 */

(function () {

  const input    = document.getElementById('chatInput');
  const sendBtn  = document.getElementById('chatSend');
  const messages = document.getElementById('chatMessages');

  if (!input || !sendBtn || !messages) return;

  const MY_NAME = window.SESSION_USERNAME || 'Yo';

  // ── Helpers locales ──────────────────────────────────────────

  function addMessage(m) {
    window.chatUtils.renderMsg(messages, {
      ...m,
      own: m.autor === MY_NAME,
    });
  }

  function sendMessage() {
    const texto = input.value.trim();
    if (!texto) return;
    window.chatSocket.emit('mensaje_global', { texto });
    input.value = '';
    input.focus();
  }

  // ── Eventos Socket.IO ────────────────────────────────────────

  // Historial al conectar
  window.chatSocket.on('historial_global', function (mensajes) {
    messages.innerHTML = '';
    mensajes.forEach(m => addMessage(m));
  });

  // Nuevo mensaje en tiempo real
  window.chatSocket.on('mensaje_global', function (m) {
    addMessage(m);
  });

  // Error del servidor
  window.chatSocket.on('chat_error', function (data) {
    addMessage({ system: true, texto: '⚠ ' + data.error });
  });

  // ── Eventos del DOM ──────────────────────────────────────────

  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  input.focus();

})();