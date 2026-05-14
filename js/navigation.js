// navigation.js — Arraiá da Paz 2026

let paginaAtual = 'p1'; // 'p1' | 'p2' | 'p3'

/** Redireciona para o novo link de evento */
function irParaPlanos() {
  window.location.href = 'https://evento.agendacatolica.com/arraia-da-paz-aracaju-2026';
}

/** p2 → p3 (Formulário) com tipo de ingresso pré-definido */
function irParaFormulario(tipo) {
  configurarFluxo(tipo);
  document.getElementById('p2').classList.remove('active');
  setTimeout(() => {
    document.getElementById('p3').classList.add('active');
    window.scrollTo(0, 0);
  }, 50);
  paginaAtual = 'p3';
}

/** Qualquer página → p1 (Landing) */
function voltarLanding() {
  document.getElementById('p2').classList.remove('active');
  document.getElementById('p3').classList.remove('active');
  document.getElementById('btnBack').classList.remove('show');
  setTimeout(() => {
    document.getElementById('p1').classList.add('active');
    window.scrollTo(0, 0);
  }, 50);
  paginaAtual = 'p1';
  resetForm();
}

/** p3 → p2 (Planos) */
function voltarPlanos() {
  document.getElementById('p3').classList.remove('active');
  setTimeout(() => {
    document.getElementById('p2').classList.add('active');
    window.scrollTo(0, 0);
  }, 50);
  paginaAtual = 'p2';
  resetForm();
}

/** Botão fixo "Voltar" — inteligente conforme página atual */
function voltarPaginaAnterior() {
  if (paginaAtual === 'p2') voltarLanding();
  else if (paginaAtual === 'p3') voltarPlanos();
}
