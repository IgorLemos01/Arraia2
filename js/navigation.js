/**
 * navigation.js — Controle de navegação entre páginas
 * Arraiá da Paz 2026
 */

/**
 * Navega da landing page para o formulário de inscrição.
 */
function irParaForm() {
  document.getElementById("p1").classList.remove("active");

  setTimeout(() => {
    document.getElementById("p2").classList.add("active");
    document.getElementById("btnBack").classList.add("show");
    window.scrollTo(0, 0);
  }, 50);
}

/**
 * Volta do formulário para a landing page e reseta o form.
 */
function voltarLanding() {
  document.getElementById("p2").classList.remove("active");
  document.getElementById("btnBack").classList.remove("show");

  setTimeout(() => {
    document.getElementById("p1").classList.add("active");
    window.scrollTo(0, 0);
  }, 50);

  resetForm();
}
