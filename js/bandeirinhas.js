/**
 * bandeirinhas.js — Renderização das bandeirinhas de festa no canvas
 * Arraiá da Paz 2026
 */

(function () {
  const canvas = document.getElementById("bCanvas");
  const W = window.innerWidth;
  const H = 52;

  canvas.width  = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");

  // Barbante
  ctx.strokeStyle = "rgba(30,20,5,.6)";
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(W, 10);
  ctx.stroke();

  // Bandeirinhas
  const cores = ["#C0392B","#F5C518","#27AE60","#E67E22","#1e5f8e","#F5C518","#C0392B"];
  const tam   = 55;
  const total = Math.ceil(W / tam) + 2;

  for (let i = 0; i < total; i++) {
    const x   = i * tam;
    const cor = cores[i % cores.length];

    ctx.beginPath();
    ctx.moveTo(x,      10);
    ctx.lineTo(x + 22, 10);
    ctx.lineTo(x + 11, 42);
    ctx.closePath();

    ctx.fillStyle   = cor;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,.2)";
    ctx.lineWidth   = 0.5;
    ctx.stroke();
  }
})();
