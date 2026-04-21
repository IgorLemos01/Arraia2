/**
 * form.js — Arraiá da Paz 2026
 * Formulários condicionais por tipo de ingresso:
 *   Fluxo A — Entrada Solidária   (Nome, Tel, Endereço → submit direto)
 *   Fluxo B — Individual / Lounge (Nome, Tel, Endereço, Email → Shalom? → Pagamento)
 */

// ── URL do backend ────────────────────────────────────────
const BACKEND_URL = "https://painel-banco.mvnptn.easypanel.host";

// ── Estado global ─────────────────────────────────────────
let svAtual        = 1;
let comSelecionada = null;   // true | false | null
let tipoIngresso   = null;   // 'solidaria' | 'individual' | 'lounge'
let pagSelecionado = null;   // 'pix' | 'cartao'

/* ══════════════════════════════════════════════════════════
   CONFIGURAR FLUXO — chamado ao escolher o plano em p2
══════════════════════════════════════════════════════════ */

function configurarFluxo(tipo) {
  tipoIngresso = tipo;

  const isFluxoA   = tipo === 'solidaria';
  const stepsWrap  = document.getElementById('stepsWrap');
  const emailGroup = document.getElementById('emailGroup');
  const btnA       = document.getElementById('btnStep1A');
  const btnB       = document.getElementById('btnStep1B');
  const titulo     = document.getElementById('formTitulo');
  const badge      = document.getElementById('formBadge');

  if (isFluxoA) {
    // Fluxo A: oculta steps, oculta e-mail, mostra botão de submit direto
    stepsWrap.classList.add('hidden');
    emailGroup.classList.add('hidden');
    btnA.classList.remove('hidden');
    btnB.classList.add('hidden');
    titulo.textContent = '🌽 Entrada Solidária';
    badge.textContent  = '1kg de Alimento Não Perecível';
    badge.style.cssText = 'background:rgba(39,174,96,.2);border:1px solid rgba(39,174,96,.5);color:#27ae60;';
  } else {
    // Fluxo B: exibe steps e e-mail, oculta botão de submit direto
    stepsWrap.classList.remove('hidden');
    emailGroup.classList.remove('hidden');
    btnA.classList.add('hidden');
    btnB.classList.remove('hidden');
    badge.style.cssText = '';

    if (tipo === 'individual') {
      titulo.textContent = '🎟️ Área Reservada Individual';
      badge.textContent  = 'R$ 30,00 · Cadeiras Limitadas!';
    } else {
      titulo.textContent = '🪑 Lounge do Arraiá';
      badge.textContent  = 'R$ 129,90 · Mesas Limitadas!';
    }
  }
}

/* ══════════════════════════════════════════════════════════
   NAVEGAÇÃO ENTRE STEPS
══════════════════════════════════════════════════════════ */

function irSv(n) {
  document.getElementById('sv' + svAtual).classList.remove('active');
  document.getElementById('si' + svAtual).classList.remove('active');

  if (svAtual < n) {
    document.getElementById('si' + svAtual).classList.add('done');
  } else {
    document.getElementById('si' + n).classList.remove('done');
  }

  svAtual = n;
  document.getElementById('sv' + svAtual).classList.add('active');
  document.getElementById('si' + svAtual).classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function irSv2() { if (validar1()) irSv(2); }
function irSv3() { if (validar2()) irSv(3); }

/* ══════════════════════════════════════════════════════════
   VALIDAÇÕES
══════════════════════════════════════════════════════════ */

function _erroField(el, msg) {
  el.classList.add('err');
  toast(msg);
  el.focus();
  setTimeout(() => el.classList.remove('err'), 2500);
}

function validar1() {
  const nome     = document.getElementById('f_nome');
  const tel      = document.getElementById('f_tel');
  const endereco = document.getElementById('f_endereco');

  if (nome.value.trim().length < 2) {
    _erroField(nome, '⚠️ Informe seu nome.'); return false;
  }

  const telLimpo = tel.value.replace(/\D/g, '');
  if (telLimpo.length < 10 || telLimpo.length > 11) {
    _erroField(tel, '⚠️ Informe um telefone válido com DDD.'); return false;
  }

  if (!endereco.value.trim()) {
    _erroField(endereco, '⚠️ Informe seu endereço.'); return false;
  }

  // Fluxo B: valida e-mail também
  if (tipoIngresso !== 'solidaria') {
    const email = document.getElementById('f_email');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      _erroField(email, '⚠️ Informe um e-mail válido.'); return false;
    }
  }

  return true;
}

function validar2() {
  if (comSelecionada === null) {
    toast('⚠️ Selecione se você é da Comunidade Shalom.'); return false;
  }
  if (comSelecionada === false) {
    const ind = document.getElementById('f_indicacao');
    if (!ind.value.trim()) {
      _erroField(ind, '⚠️ Informe quem te indicou.'); return false;
    }
  }
  return true;
}

/* ══════════════════════════════════════════════════════════
   COMUNIDADE SHALOM
══════════════════════════════════════════════════════════ */

function selecionarCom(sim) {
  comSelecionada = sim;
  document.getElementById('rbSim').classList.toggle('selected', sim === true);
  document.getElementById('rbNao').classList.toggle('selected', sim === false);

  const cond = document.getElementById('condIndicacao');
  if (sim === false) {
    cond.classList.add('show');
  } else {
    cond.classList.remove('show');
    document.getElementById('f_indicacao').value = '';
  }
}

/* ══════════════════════════════════════════════════════════
   PAGAMENTO
══════════════════════════════════════════════════════════ */

// Valor por tipo de ingresso
const VALORES_INGRESSO = {
  solidaria:  null,          // entrada franca
  individual: 'R$ 30,00',
  lounge:     'R$ 129,90',
};

const LINK_CIELO_LOUNGE = 'https://cielolink.com.br/4dbVvi8';
const PIX_CHAVE         = 'nossacasanossochao@comshalom.org';

function selecionarPag(tipo) {
  pagSelecionado = tipo;
  document.getElementById('pixCard').classList.toggle('selected', tipo === 'pix');
  document.getElementById('cartaoCard').classList.toggle('selected', tipo === 'cartao');
  document.getElementById('pdPix').classList.toggle('show', tipo === 'pix');
  document.getElementById('pdCartao').classList.toggle('show', tipo === 'cartao');

  // Atualiza valor dinâmico nos dois painéis
  const valor = VALORES_INGRESSO[tipoIngresso] || '—';
  const elPixValor    = document.getElementById('pixValorNum');
  const elCartaoValor = document.getElementById('cartaoValorNum');
  if (elPixValor)    elPixValor.textContent    = valor;
  if (elCartaoValor) elCartaoValor.textContent = valor;

  _atualizarBtnFinalizar();
}

function toggleLGPD() {
  _atualizarBtnFinalizar();
}

function _atualizarBtnFinalizar() {
  const lgpd = document.getElementById('chkLGPD')?.checked;
  const btn  = document.getElementById('btnFinalizar');
  const ok   = !!(pagSelecionado && lgpd);
  btn.disabled = !ok;
  btn.setAttribute('aria-disabled', String(!ok));
}

/* ══════════════════════════════════════════════════════════
   BUILD PAYLOAD — padronizado para a planilha

   REGRAS:
   • telefone: sempre '55' + dígitos brutos (sanitizado)
   • campos ausentes no Fluxo A: enviados como '-'
   • campo 'opcao' identifica o tipo de ingresso
══════════════════════════════════════════════════════════ */

function _buildPayload() {
  const nome     = document.getElementById('f_nome').value.trim();
  const telLimpo = document.getElementById('f_tel').value.replace(/\D/g, '');
  const telefone = '55' + telLimpo;   // DDI 55 + dígitos sem formatação
  const endereco = document.getElementById('f_endereco').value.trim();

  // Mapeamento de modalidade → texto da planilha
  const modalidadeMap = {
    solidaria:  'Solidária',
    individual: 'Cadeira',
    lounge:     'Lounge',
  };

  // Mapeamento de forma de pagamento → texto da planilha
  const pagMap = { pix: 'Pix', cartao: 'Cartão' };

  // ── Fluxo A (Entrada Solidária) ───────────────────────
  if (tipoIngresso === 'solidaria') {
    return {
      nome,
      email:          '-',
      telefone,
      comunidade:     '-',
      indicacao:      '-',
      formaPagamento: '-',
      modalidade:     modalidadeMap.solidaria,
    };
  }

  // ── Fluxo B (Cadeira / Lounge) ────────────────────────
  const email      = document.getElementById('f_email').value.trim();
  const comunidade = comSelecionada ? 'Sim' : 'Não';
  const indicacao  = comSelecionada === false
    ? (document.getElementById('f_indicacao').value.trim() || '-')
    : '-';

  return {
    nome,
    email,
    telefone,
    comunidade,
    indicacao,
    formaPagamento: pagMap[pagSelecionado] || '-',
    modalidade:     modalidadeMap[tipoIngresso] || '-',
  };
}

/* ══════════════════════════════════════════════════════════
   SUBMIT — FLUXO A (Entrada Solidária)
   Envia direto para a planilha e exibe tela de sucesso
══════════════════════════════════════════════════════════ */

async function submitFluxoA() {
  if (document.getElementById('f_website')?.value.trim()) return;
  if (!validar1()) return;

  const btn = document.getElementById('btnStep1A');
  btn.disabled    = true;
  btn.textContent = '⏳ Enviando...';

  const payload = _buildPayload();

  try {
    // Google Apps Script não suporta preflight CORS (application/json).
    // Usar text/plain evita o preflight e os dados chegam via e.postData.contents.
    await fetch(CFG.WEBHOOK, {
      method:   'POST',
      headers:  { 'Content-Type': 'text/plain;charset=utf-8' },
      body:     JSON.stringify(payload),
      redirect: 'follow',
    });
    _mostrarSucesso(payload.nome, null, 'solidaria');
  } catch (err) {
    console.error('Erro ao enviar:', err);
    toast('❌ Erro inesperado. Tente novamente.');
    btn.disabled    = false;
    btn.textContent = '✅ Confirmar Inscrição';
  }
}

/* ══════════════════════════════════════════════════════════
   FINALIZAR — FLUXO B (Individual / Lounge)
═════════════════════════════════════════════════════════ */

async function finalizar() {
  if (document.getElementById('f_website')?.value.trim()) return;

  const btn = document.getElementById('btnFinalizar');
  btn.disabled    = true;
  btn.textContent = '⏳ Enviando...';

  const payload = _buildPayload();

  try {
    // 1. Salva na planilha
    await _salvarNaPlanilha(payload);

    // 2. Exibe sucesso e/ou redireciona para Cielo (Lounge + Cartão)
    if (pagSelecionado === 'pix') {
      _mostrarSucesso(payload.nome, payload.email, 'pix');
    } else if (tipoIngresso === 'lounge') {
      toast('🔐 Abrindo pagamento seguro...');
      setTimeout(() => window.open(LINK_CIELO_LOUNGE, '_blank'), 600);
      _mostrarSucesso(payload.nome, payload.email, 'cartao');
    } else {
      _mostrarSucesso(payload.nome, payload.email, 'cartao');
    }
  } catch (err) {
    console.error('Erro ao finalizar:', err);
    toast('❌ Erro inesperado. Tente novamente.');
    btn.disabled    = false;
    btn.textContent = '🎉 Finalizar Inscrição';
  }
}

/* Salva na planilha via Google Apps Script Webhook */
async function _salvarNaPlanilha(payload) {
  try {
    // text/plain evita CORS preflight — GAS lê via e.postData.contents
    await fetch(CFG.WEBHOOK, {
      method:   'POST',
      headers:  { 'Content-Type': 'text/plain;charset=utf-8' },
      body:     JSON.stringify(payload),
      redirect: 'follow',
    });
  } catch (e) {
    console.warn('Aviso: falha ao registrar na planilha.', e);
  }
}

/* ══════════════════════════════════════════════════════════
   COPIAR CHAVE PIX
══════════════════════════════════════════════════════════ */

function copiarChavePix() {
  navigator.clipboard.writeText(PIX_CHAVE)
    .then(() => {
      const btn = document.getElementById('btnCopiarPix');
      if (btn) { btn.textContent = '✅ Chave copiada!'; setTimeout(() => { btn.textContent = '📋 Copiar chave Pix'; }, 2500); }
      toast('✅ Chave Pix copiada!');
    })
    .catch(() => toast('⚠️ Não foi possível copiar. Copie manualmente.'));
}

/* ══════════════════════════════════════════════════════════
   TELA DE SUCESSO
══════════════════════════════════════════════════════════ */

function _mostrarSucesso(nomeCompleto, email, tipoPag) {
  const firstName = nomeCompleto.split(' ')[0];

  let html = `<p style="color:rgba(255,255,255,.7);line-height:1.8;font-size:.95rem;">
    Ebaaa, <strong style="color:var(--amarelo);font-size:1.1rem;">${firstName}</strong>!<br>
    Sua inscrição no <strong>Arraiá da Paz</strong> foi registrada com sucesso.<br>`;

  if (tipoPag === 'pix') {
    html += `Realize o pagamento via Pix para a chave<br>
      <strong style="color:#2ecc71;font-size:1rem;">nossacasanossochao@comshalom.org</strong><br>
      Após o pagamento, sua vaga será confirmada em breve.<br>`;
  } else if (tipoPag === 'cartao' && tipoIngresso === 'lounge') {
    html += `Você foi redirecionado para o checkout seguro da <strong>Cielo</strong>.<br>
      Complete o pagamento para garantir sua mesa!<br>`;
  } else if (tipoPag === 'cartao') {
    html += `Aguardamos a confirmação do seu pagamento.<br>`;
  } else {
    html += `Não esqueça de levar <strong style="color:var(--verde);">1kg de alimento não perecível</strong>!<br>`;
  }

  html += `</p>`;

  document.getElementById('successContent').innerHTML = html;
  document.getElementById('stepsWrap')?.classList.add('hidden');
  document.getElementById('formBody')?.classList.add('hidden');
  document.getElementById('successView').classList.add('show');
}

/* ══════════════════════════════════════════════════════════
   RESET — limpa o formulário ao voltar para os planos
══════════════════════════════════════════════════════════ */

function resetForm() {
  svAtual        = 1;
  comSelecionada = null;
  tipoIngresso   = null;
  pagSelecionado = null;

  // Steps
  ['sv1','sv2','sv3'].forEach(id => document.getElementById(id)?.classList.remove('active'));
  document.getElementById('sv1')?.classList.add('active');
  ['si1','si2','si3'].forEach(id =>
    document.getElementById(id)?.classList.remove('active','done')
  );
  document.getElementById('si1')?.classList.add('active');

  // Estrutura
  document.getElementById('stepsWrap')?.classList.remove('hidden');
  document.getElementById('formBody')?.classList.remove('hidden');
  document.getElementById('successView')?.classList.remove('show');

  // Campos condicionais
  document.getElementById('emailGroup')?.classList.remove('hidden');
  document.getElementById('condIndicacao')?.classList.remove('show');
  document.getElementById('rbSim')?.classList.remove('selected');
  document.getElementById('rbNao')?.classList.remove('selected');

  // Pagamento
  document.getElementById('pixCard')?.classList.remove('selected');
  document.getElementById('cartaoCard')?.classList.remove('selected');
  document.getElementById('pdPix')?.classList.remove('show');
  document.getElementById('pdCartao')?.classList.remove('show');

  const btnFinalizar = document.getElementById('btnFinalizar');
  if (btnFinalizar) {
    btnFinalizar.disabled    = true;
    btnFinalizar.setAttribute('aria-disabled', 'true');
    btnFinalizar.textContent = '🎉 Finalizar Inscrição';
  }

  const chkLGPD = document.getElementById('chkLGPD');
  if (chkLGPD) chkLGPD.checked = false;

  // Botões step 1
  document.getElementById('btnStep1A')?.classList.add('hidden');
  document.getElementById('btnStep1B')?.classList.remove('hidden');
  const btnStep1A = document.getElementById('btnStep1A');
  if (btnStep1A) { btnStep1A.disabled = false; btnStep1A.textContent = '✅ Confirmar Inscrição'; }

  // Campos texto
  ['f_nome','f_tel','f_endereco','f_email','f_indicacao'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // Header do formulário
  const titulo = document.getElementById('formTitulo');
  const badge  = document.getElementById('formBadge');
  if (titulo) titulo.textContent = '🪗 Reserve seu Lugar';
  if (badge)  { badge.textContent = '⚡ Vagas Limitadas'; badge.style.cssText = ''; }
}

/* ══════════════════════════════════════════════════════════
   MÁSCARAS
══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('f_tel')?.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '');
    v = v.replace(/^(\d{2})(\d)/, '($1) $2')
         .replace(/(\d{5})(\d)/, '$1-$2');
    this.value = v;
  });
});
