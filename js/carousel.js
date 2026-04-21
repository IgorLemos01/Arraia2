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

    document.querySelectorAll(".atracoes-dots .carousel-dot").forEach((dot, i) => {
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

/* ─────────────────────────────────────────────────────────────
   Carrossel de REALIZAÇÃO — independente do carrossel de atrações
───────────────────────────────────────────────────────────── */
(function () {
  let curR  = 0;
  const totalR = 3;
  let timerR;

  /** Atualiza posição e dots do carrossel de realização. */
  function updateR() {
    const track = document.getElementById("realizacaoTrack");
    if (!track) return;
    track.style.transform = `translateX(-${curR * 100}%)`;

    document.querySelectorAll(".realizacao-dots .carousel-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === curR);
      dot.setAttribute("aria-selected", i === curR ? "true" : "false");
    });
  }

  /** Move o carrossel de realização. */
  window.realizacaoMove = function (dir) {
    curR = (curR + dir + totalR) % totalR;
    updateR();
    resetTimerR();
  };

  /** Vai diretamente para um slide de realização. */
  window.realizacaoGo = function (i) {
    curR = i;
    updateR();
    resetTimerR();
  };

  /** Reinicia o auto-play do carrossel de realização. */
  function resetTimerR() {
    clearInterval(timerR);
    timerR = setInterval(() => {
      curR = (curR + 1) % totalR;
      updateR();
    }, 4000);
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", resetTimerR);
  } else {
    resetTimerR();
  }
})();

