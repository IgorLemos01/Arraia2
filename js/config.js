/**
 * config.js — Configurações globais da aplicação
 * Arraiá da Paz 2026
 */

const CFG = {
  WEBHOOK:  "https://script.google.com/macros/s/AKfycbz_Sz_tc06wopqbjYbv-gn0yA4o9htEHHNNS5l5bPLjwcWcCQ7Sc7IvUGjLAQ2ADrlf/exec",
  PIX_KEY:  "nossacasanossochao@comshalom.org",   // Centralizado — altere só aqui
  WHATSAPP: "5579999695288",                        // Número para comprovante

  // Proteção anti-spam (rate limiting client-side)
  MAX_SUBMISSOES: 2,        // máx. envios permitidos por janela de tempo
  JANELA_MS:      600_000,  // 10 minutos em milissegundos
};
