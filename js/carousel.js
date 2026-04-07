/**
 * carousel.js — Controle do carrossel de atrações
 * Arraiá da Paz 2026
 *
 * Características:
 *  - Auto-play a cada 5 segundos
 *  - Navegação por setas e dots
 *  - Loop infinito
 */

(function () {
  let cur   = 0;
  const total = 4;
  let timer;

  /** Atualiza a posição do carrossel e os dots indicadores. */
  function update() {
    document.getElementById("carouselTrack").style.transform =
      `translateX(-${cur * 100}%)`;

    document.querySelectorAll(".carousel-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === cur);
    });
  }

  /** Move o carrossel em uma direção (+1 ou -1). */
  window.carouselMove = function (dir) {
    cur = (cur + dir + total) % total;
    update();
    resetTimer();
  };

  /** Navega diretamente para um slide pelo índice. */
  window.carouselGo = function (i) {
    cur = i;
    update();
    resetTimer();
  };

  /** Reinicia o timer de auto-play. */
  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
      cur = (cur + 1) % total;
      update();
    }, 5000);
  }

  // Inicializa o auto-play
  resetTimer();
})();
