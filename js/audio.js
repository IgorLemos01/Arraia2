/**
 * audio.js — Player de música flutuante
 * Arraiá da Paz 2026
 *
 * Estratégia de autoplay:
 *  - Navegadores bloqueiam áudio sem interação do usuário.
 *  - Ao primeiro clique/toque em QUALQUER lugar da página, o áudio inicia.
 *  - Um botão flutuante permite pausar/retomar e indica o estado atual.
 */

let _audioAtivado = false;
const AUDIO_SRC   = 'assets/arraia-da-paz.mp3';

/**
 * Inicializa o player após o DOM estar pronto.
 */
function initAudio() {
  const audio  = document.getElementById('bgAudio');
  const btn    = document.getElementById('musicBtn');
  const pulso  = document.getElementById('musicPulso');
  const player = document.getElementById('musicPlayer');

  if (!audio || !btn) return;

  // Tenta autoplay silencioso (funciona em alguns cenários como retorno de aba)
  audio.volume = 0.7;

  // ── Primeiro clique em qualquer lugar inicia a música ──
  function primeiraInteracao() {
    if (_audioAtivado) return;
    _audioAtivado = true;

    audio.play().then(() => {
      btn.classList.add('playing');
      if (pulso) pulso.classList.add('ativo');
      player.classList.add('show');
    }).catch(() => {
      // Bloqueio do navegador — mantém botão visível para o usuário clicar
      player.classList.add('show');
    });

    document.removeEventListener('click',     primeiraInteracao);
    document.removeEventListener('touchstart', primeiraInteracao);
    document.removeEventListener('keydown',   primeiraInteracao);
  }

  document.addEventListener('click',      primeiraInteracao, { once: false });
  document.addEventListener('touchstart', primeiraInteracao, { once: false });
  document.addEventListener('keydown',    primeiraInteracao, { once: false });

  // Mostra o player após 1s para chamar atenção
  setTimeout(() => player.classList.add('show'), 1000);
}

/**
 * Alterna play/pause quando o usuário clica no botão do player.
 */
function toggleMusic() {
  const audio = document.getElementById('bgAudio');
  const btn   = document.getElementById('musicBtn');
  const pulso = document.getElementById('musicPulso');

  if (!audio) return;

  if (audio.paused) {
    audio.play().then(() => {
      btn.classList.add('playing');
      if (pulso) pulso.classList.add('ativo');
      _audioAtivado = true;
    });
  } else {
    audio.pause();
    btn.classList.remove('playing');
    if (pulso) pulso.classList.remove('ativo');
  }
}

// Inicia quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initAudio);
