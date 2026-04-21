/**
 * toast.js — Componente de notificação toast (snackbar)
 * Arraiá da Paz 2026
 */

let _toastTimer = null;

/**
 * Exibe um toast com a mensagem informada.
 * @param {string} msg - Texto a ser exibido no toast.
 * @param {number} [duration=2800] - Duração em ms antes de ocultar.
 */
function toast(msg, duration = 2800) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove("show"), duration);
}
