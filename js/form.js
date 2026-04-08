/**
 * form.js — Lógica completa do formulário de inscrição
 * Arraiá da Paz 2026
 *
 * Responsabilidades:
 *  - Controle de steps (etapas)
 *  - Validações por etapa
 *  - Seleção de comunidade e pagamento
 *  - Cópia da chave Pix
 *  - Envio via webhook (Google Apps Script)
 *  - Exibição da tela de sucesso
 *  - Reset completo do formulário
 *  - Máscaras de CPF e Telefone
 */

/* ── Estado do formulário ── */
let svAtual = 1;
let comSelecionada = null;
let tipoIngresso = null;  // 'individual' | 'mesa'
let pagSelecionado = null;

/* ── Rate Limiting (anti-spam client-side) ── */
const RL_KEY = 'arraia_submissoes';

/**
 * Verifica se o usuário está dentro do limite de envios permitidos.
 * @returns {boolean} true se pode enviar, false se bloqueado.
 */
function _rateLimitOk() {
  const agora = Date.now();
  const raw = localStorage.getItem(RL_KEY);
  const registro = raw ? JSON.parse(raw) : { count: 0, inicio: agora };

  // Reseta a janela se já passou o tempo
  if (agora - registro.inicio > CFG.JANELA_MS) {
    localStorage.setItem(RL_KEY, JSON.stringify({ count: 0, inicio: agora }));
    return true;
  }

  if (registro.count >= CFG.MAX_SUBMISSOES) return false;

  registro.count++;
  localStorage.setItem(RL_KEY, JSON.stringify(registro));
  return true;
}

/* ════════════════════════════════════════
   STEPS
   ════════════════════════════════════════ */

/**
 * Navega para um step específico do formulário.
 * @param {number} n - Número do step destino (1, 2, 3 ou 4).
 */
function irSv(n) {
  document.getElementById("sv" + svAtual).classList.remove("active");
  document.getElementById("si" + svAtual).classList.remove("active");

  if (svAtual < n) {
    document.getElementById("si" + svAtual).classList.add("done");
  } else {
    // Voltando: remove o “done” do step que está sendo reativado
    document.getElementById("si" + n).classList.remove("done");
  }

  svAtual = n;

  document.getElementById("sv" + svAtual).classList.add("active");
  document.getElementById("si" + svAtual).classList.add("active");
  document.querySelector(".form-container").scrollTop = 0;
}

/** Avança para o step 2 após validar o step 1. */
function irSv2() {
  if (!validar1()) return;
  irSv(2);
}

/** Avança para o step 3 (ingresso) após validar o step 2 (participação). */
function irSv3() {
  if (!validar2()) return;
  irSv(3);
}

/** Avança para o step 4 (pagamento) após validar o step 3 (ingresso). */
function irSv4() {
  if (tipoIngresso === null) {
    toast("⚠️ Selecione o tipo de ingresso.");
    return;
  }
  irSv(4);
}

/* ════════════════════════════════════════
   VALIDAÇÕES
   ════════════════════════════════════════ */

/**
 * Marca um campo como inválido, exibe toast e agenda remoção do erro.
 * @param {HTMLElement} el - O elemento de input.
 * @param {string} msg - Mensagem de erro para o toast.
 */
function _erroField(el, msg) {
  el.classList.add("err");
  toast(msg);
  el.focus();
  setTimeout(() => el.classList.remove("err"), 2500);
}

/**
 * Valida os campos do step 1 (dados pessoais).
 * Inclui verificações de formato real para e-mail, CPF e telefone.
 * @returns {boolean} true se válido, false caso contrário.
 */
function validar1() {
  const nome = document.getElementById("f_nome");
  const email = document.getElementById("f_email");
  const tel = document.getElementById("f_tel");
  const cpf = document.getElementById("f_cpf");
  const rg = document.getElementById("f_rg");

  // Nome: mínimo 2 palavras
  if (!nome.value.trim() || nome.value.trim().split(" ").length < 2) {
    _erroField(nome, "⚠️ Informe seu nome completo (nome e sobrenome).");
    return false;
  }

  // E-mail: formato básico via regex
  const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!reEmail.test(email.value.trim())) {
    _erroField(email, "⚠️ Informe um e-mail válido.");
    return false;
  }

  // Telefone: 14 ou 15 caracteres com máscara (ex: (85) 99999-9999)
  const telLimpo = tel.value.replace(/\D/g, "");
  if (telLimpo.length < 10 || telLimpo.length > 11) {
    _erroField(tel, "⚠️ Informe um telefone válido com DDD.");
    return false;
  }

  // CPF: deve ter 11 dígitos e passar na validação matemática
  const cpfLimpo = cpf.value.replace(/\D/g, "");
  if (cpfLimpo.length !== 11 || !_cpfValido(cpfLimpo)) {
    _erroField(cpf, "⚠️ Informe um CPF válido.");
    return false;
  }

  // RG: apenas presença
  if (!rg.value.trim()) {
    _erroField(rg, "⚠️ Preencha o RG.");
    return false;
  }

  return true;
}

/**
 * Valida o CPF matematicamente (algoritmo oficial).
 * @param {string} c - String com 11 dígitos numéricos.
 * @returns {boolean}
 */
function _cpfValido(c) {
  if (/^(\d)\1{10}$/.test(c)) return false; // sequências repetidas (ex: 111.111.111-11)
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(c[i]) * (10 - i);
  let r = (soma * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(c[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(c[i]) * (11 - i);
  r = (soma * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(c[10]);
}

/**
 * Valida os campos do step 2 (participação / comunidade).
 * @returns {boolean} true se válido, false caso contrário.
 */
function validar2() {
  if (comSelecionada === null) {
    toast("⚠️ Selecione sua participação.");
    return false;
  }
  if (comSelecionada === false) {
    const ind = document.getElementById("f_indicacao");
    if (!ind.value.trim()) {
      ind.classList.add("err");
      toast("⚠️ Informe quem te indicou.");
      setTimeout(() => ind.classList.remove("err"), 2500);
      return false;
    }
  }
  return true;
}

/* ════════════════════════════════════════
   COMUNIDADE
   ════════════════════════════════════════ */

/**
 * Registra a seleção de comunidade e exibe/oculta campo condicional.
 * @param {boolean} sim - true = pertence à comunidade, false = não pertence.
 */
function selecionarCom(sim) {
  comSelecionada = sim;

  document.getElementById("rbSim").classList.toggle("selected", sim === true);
  document.getElementById("rbNao").classList.toggle("selected", sim === false);

  const cond = document.getElementById("condIndicacao");
  if (sim === false) {
    cond.classList.add("show");
  } else {
    cond.classList.remove("show");
    document.getElementById("f_indicacao").value = "";
  }
}

/* ════════════════════════════════════════
   TIPO DE INGRESSO
   ════════════════════════════════════════ */

/**
 * Seleciona o tipo de ingresso e adapta o card de cartão dinamicamente.
 * @param {'individual'|'mesa'} tipo
 */
function selecionarIngresso(tipo) {
  tipoIngresso = tipo;

  const cardInd = document.getElementById('ingressoIndividual');
  const cardMesa = document.getElementById('ingressoMesa');
  const btn = document.getElementById('btnStep3');

  cardInd.classList.toggle('selected', tipo === 'individual');
  cardInd.setAttribute('aria-pressed', tipo === 'individual');
  cardMesa.classList.toggle('selected', tipo === 'mesa');
  cardMesa.setAttribute('aria-pressed', tipo === 'mesa');

  // Habilita botão de avançar
  btn.disabled = false;
  btn.removeAttribute('aria-disabled');

  // Adapta descrição do pagamento por cartão
  const titulo = document.getElementById('cartaoTitulo');
  const desc = document.getElementById('cartaoDesc');
  if (titulo && desc) {
    if (tipo === 'individual') {
      titulo.textContent = '💳 Pagamento por Cartão — Individual';
      desc.innerHTML = 'Ao finalizar, você será redirecionado de forma segura para o pagamento na Cielo.';
    } else {
      titulo.textContent = '💳 Pagamento por Cartão — Mesa';
      desc.innerHTML = 'Ao finalizar, você será redirecionado para o ambiente seguro da Cielo para efetuar o pagamento da Mesa.<br>Aceitamos Visa, Mastercard, Elo e Amex.';
    }
  }

  // Reseta seleção de pagamento ao mudar ingresso
  pagSelecionado = null;
  document.getElementById('pixCard').classList.remove('selected');
  document.getElementById('cartaoCard').classList.remove('selected');
  document.getElementById('pdPix').classList.remove('show');
  document.getElementById('pdCartao').classList.remove('show');
  document.getElementById('btnFinalizar').disabled = true;
}

/* ════════════════════════════════════════
   PAGAMENTO
   ════════════════════════════════════════ */

/**
 * Seleciona o método de pagamento e habilita o botão finalizar.
 * @param {"pix"|"cartao"} tipo - Método de pagamento.
 */
function selecionarPag(tipo) {
  pagSelecionado = tipo;

  document.getElementById('pixCard').classList.toggle('selected', tipo === 'pix');
  document.getElementById('cartaoCard').classList.toggle('selected', tipo === 'cartao');
  document.getElementById('pdPix').classList.toggle('show', tipo === 'pix');
  document.getElementById('pdCartao').classList.toggle('show', tipo === 'cartao');

  // Habilita Finalizar apenas se LGPD também estiver marcado
  const chk = document.getElementById('chkLGPD');
  document.getElementById('btnFinalizar').disabled = !(chk && chk.checked);
}

/** Copia a chave Pix para a área de transferência. */
function copiarPix() {
  navigator.clipboard
    .writeText(CFG.PIX_KEY)   // Fonte única: config.js
    .then(() => toast('✅ Chave Pix copiada!'));
}

/**
 * Controla o botão Finalizar com base no checkbox de consentimento LGPD.
 * O botão só fica ativo quando o usuário:
 *  a) marcou o checkbox de consentimento, E
 *  b) já selecionou um método de pagamento.
 */
function toggleLGPD() {
  const chk = document.getElementById('chkLGPD');
  const btn = document.getElementById('btnFinalizar');
  // Só habilita se AMBAS as condições são verdadeiras
  btn.disabled = !(chk.checked && pagSelecionado !== null);
}

/* ════════════════════════════════════════
   FINALIZAR / ENVIO
   ════════════════════════════════════════ */

/**
 * Coleta os dados do formulário, envia ao webhook e exibe confirmação.
 * Proteções: honeypot anti-bot + rate limiting client-side.
 */
async function finalizar() {
  // ── Proteção 1: Honeypot anti-bot ──
  // Bots preenchem campos ocultos; humanos não vêem nem tocam neles
  const honeypot = document.getElementById('f_website');
  if (honeypot && honeypot.value.trim() !== '') {
    // Bot detectado — simula sucesso para não revelar a proteção
    console.warn('[Security] Submissão bloqueada: honeypot preenchido.');
    _mostrarSucesso('Bot', 'bot@bloqueado.invalid');
    return;
  }

  // ── Proteção 2: Rate Limiting ──
  if (!_rateLimitOk()) {
    toast('❌ Muitas tentativas. Aguarde alguns minutos e tente novamente.', 5000);
    return;
  }

  const btn = document.getElementById('btnFinalizar');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  const dados = {
    nome: document.getElementById('f_nome').value.trim(),
    email: document.getElementById('f_email').value.trim(),
    telefone: document.getElementById('f_tel').value.trim(),
    cpf: document.getElementById('f_cpf').value.trim(),
    rg: document.getElementById('f_rg').value.trim(),
    comunidade: comSelecionada ? 'Sim' : 'Não',
    indicacao: document.getElementById('f_indicacao').value.trim() || '-',
    tipo_ingresso: tipoIngresso === 'individual' ? 'Individual' : 'Mesa',
    pagamento: pagSelecionado === 'pix' ? 'Pix' : 'Cartão',
    status_pagamento: 'Aguardando',
    data_inscricao: new Date().toLocaleString('pt-BR'),
  };

  try {
    await fetch(CFG.WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(dados),
      mode: 'no-cors',
    });
    // OBS: modo no-cors nunca lança erro mesmo com falha HTTP;
    // tratamos apenas erros de rede (offline, DNS, timeout).
  } catch (e) {
    console.warn("Erro ao enviar webhook:", e);

    // Se a pessoa selecionou Cartão, NUNCA podemos impedir o redirecionamento de 
    // pagamento caso a internet ou Adblock falhe no envio da planilha. A venda é prioridade.
    if (pagSelecionado === 'cartao') {
      toast('⚠️ Alguns dados falharam, mas prosseguindo para o pagamento...', 3500);
      setTimeout(() => {
        window.location.href = CFG.LINK_CARTAO;
      }, 2000);
      return;
    }

    // Se fosse Pix/Individual e na Vercel relatar erro verdadeiro:
    if (window.location.protocol !== 'file:') {
      toast('❌ Erro de conexão com a planilha. Verifique internet/Adblock.', 4000);
      btn.disabled = false;
      btn.textContent = '🎉 Finalizar Inscrição';
      return;
    }
  }

  _mostrarSucesso(dados.nome, dados.email);

  if (pagSelecionado === 'cartao') {
    toast('🔄 Redirecionando para o ambiente seguro da Cielo...', 3000);
    setTimeout(() => {
      window.location.href = CFG.LINK_CARTAO;
    }, 2000);
  }
}

/**
 * Exibe a tela de sucesso com o nome e e-mail mascarado.
 * @param {string} nome  - Nome completo do inscrito.
 * @param {string} email - E-mail (será exibido mascarado por segurança).
 */
function _mostrarSucesso(nome, email) {
  document.getElementById('stepsWrap').classList.add('hidden');
  document.getElementById('formBody').classList.add('hidden');

  const sv = document.getElementById('successView');
  sv.classList.add('show');

  document.getElementById('sNome').textContent = nome.split(' ')[0];

  // Mascara o e-mail: jo***@gmail.com
  const [user, domain] = email.split('@');
  const emailMascarado = user.length > 2
    ? user.slice(0, 2) + '***@' + domain
    : '***@' + domain;
  document.getElementById('sEmail').textContent = emailMascarado;
}

/* ════════════════════════════════════════
   RESET
   ════════════════════════════════════════ */

/** Reseta o formulário ao estado inicial. */
function resetForm() {
  svAtual = 1;
  comSelecionada = null;
  tipoIngresso = null;
  pagSelecionado = null;

  // Steps — agora são 4
  ["sv1", "sv2", "sv3", "sv4"].forEach(id => document.getElementById(id).classList.remove("active"));
  document.getElementById("sv1").classList.add("active");

  ["si1", "si2", "si3", "si4"].forEach(id => document.getElementById(id).classList.remove("active", "done"));
  document.getElementById("si1").classList.add("active");

  // Mostrar estrutura — remove classes hidden (CSS-first)
  document.getElementById("stepsWrap").classList.remove("hidden");
  document.getElementById("formBody").classList.remove("hidden");
  document.getElementById("successView").classList.remove("show");

  // Ingresso
  document.getElementById('ingressoIndividual').classList.remove('selected');
  document.getElementById('ingressoMesa').classList.remove('selected');
  const btnStep3 = document.getElementById('btnStep3');
  btnStep3.disabled = true;
  btnStep3.setAttribute('aria-disabled', 'true');

  // Pagamento + LGPD
  document.getElementById('btnFinalizar').disabled = true;
  const chkLGPD = document.getElementById('chkLGPD');
  if (chkLGPD) chkLGPD.checked = false;
  document.getElementById("condIndicacao").classList.remove("show");
  document.getElementById("rbSim").classList.remove("selected");
  document.getElementById("rbNao").classList.remove("selected");
  document.getElementById("pixCard").classList.remove("selected");
  document.getElementById("cartaoCard").classList.remove("selected");
  document.getElementById("pdPix").classList.remove("show");
  document.getElementById("pdCartao").classList.remove("show");

  // Campos de texto
  ["f_nome", "f_email", "f_tel", "f_cpf", "f_rg", "f_indicacao"]
    .forEach(id => (document.getElementById(id).value = ""));
}

/* ════════════════════════════════════════
   MÁSCARAS DE INPUT
   ════════════════════════════════════════ */

document.getElementById("f_cpf").addEventListener("input", function () {
  let v = this.value.replace(/\D/g, "");
  v = v
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  this.value = v;
});

document.getElementById("f_tel").addEventListener("input", function () {
  let v = this.value.replace(/\D/g, "");
  v = v
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
  this.value = v;
});
