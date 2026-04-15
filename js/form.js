// ═══════════════════════════════════════════════════════
//  form.js — Arraiá da Paz 2026
//  Integração com backend PagBank
// ═══════════════════════════════════════════════════════

// URL do seu backend no Easypanel (troque quando subir)
const BACKEND_URL = "https://painel-banco.mvnptn.easypanel.host";

// ── Estado global ─────────────────────────────────────
let tipoIngresso  = null;  // "mesa" | "individual"
let tipoPagamento = null;  // "pix" | "cartao"

// ── Seleção de ingresso ───────────────────────────────
function selecionarIngresso(tipo) {
  tipoIngresso = tipo;

  document.querySelectorAll(".ingresso-card").forEach(el => {
    el.classList.remove("selected");
    el.setAttribute("aria-pressed", "false");
  });

  const card = document.getElementById(
    tipo === "mesa" ? "ingressoMesa" : "ingressoIndividual"
  );
  card.classList.add("selected");
  card.setAttribute("aria-pressed", "true");

  // Mostra valor na descrição
  const valores = { mesa: "R$ 150,00", individual: "R$ 40,00" };
  document.getElementById("btnStep3").disabled = false;
  document.getElementById("btnStep3").setAttribute("aria-disabled", "false");

  // Atualiza descrição do step 4 quando chegar lá
  window._ingressoValor = valores[tipo];
}

// ── Seleção de pagamento ──────────────────────────────
function selecionarPag(tipo) {
  tipoPagamento = tipo;

  document.querySelectorAll(".pag-card").forEach(el => {
    el.classList.remove("selected");
    el.setAttribute("aria-pressed", "false");
  });

  const card = document.getElementById(tipo === "pix" ? "pixCard" : "cartaoCard");
  card.classList.add("selected");
  card.setAttribute("aria-pressed", "true");

  // Mostra detalhes corretos
  document.getElementById("pdPix").style.display    = tipo === "pix"    ? "block" : "none";
  document.getElementById("pdCartao").style.display = tipo === "cartao" ? "block" : "none";

  _atualizarBtnFinalizar();
}

// ── LGPD checkbox ─────────────────────────────────────
function toggleLGPD() {
  _atualizarBtnFinalizar();
}

function _atualizarBtnFinalizar() {
  const lgpd = document.getElementById("chkLGPD")?.checked;
  const ok   = tipoPagamento && lgpd;
  const btn  = document.getElementById("btnFinalizar");
  btn.disabled = !ok;
  btn.setAttribute("aria-disabled", String(!ok));
}

// ── Comunidade ────────────────────────────────────────
function selecionarCom(ehMembro) {
  const cond = document.getElementById("condIndicacao");
  if (cond) cond.style.display = ehMembro ? "none" : "block";
}

// ── Navegação entre steps ─────────────────────────────
function irSv(n) {
  document.querySelectorAll(".step-view").forEach((el, i) => {
    el.classList.toggle("active", i + 1 === n);
  });
  document.querySelectorAll(".step-ind").forEach((el, i) => {
    el.classList.toggle("active", i + 1 === n);
    el.classList.toggle("done",   i + 1  < n);
    el.setAttribute("aria-selected", i + 1 === n ? "true" : "false");
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Step 1 → 2 ────────────────────────────────────────
function irSv2() {
  const nome  = document.getElementById("f_nome")?.value.trim();
  const email = document.getElementById("f_email")?.value.trim();
  const cpf   = document.getElementById("f_cpf")?.value.trim();

  if (!nome)  return showToast("Informe seu nome completo", "erro");
  if (!email || !email.includes("@")) return showToast("Informe um e-mail válido", "erro");
  if (!cpf || cpf.replace(/\D/g,"").length !== 11)
    return showToast("Informe um CPF válido", "erro");

  irSv(2);
}

// ── Step 2 → 3 ────────────────────────────────────────
function irSv3() {
  const sel = document.querySelector('input[name="comunidade"]:checked');
  if (!sel) return showToast("Informe se é da Comunidade Shalom", "erro");
  irSv(3);
}

// ── Step 3 → 4 ────────────────────────────────────────
function irSv4() {
  if (!tipoIngresso) return showToast("Selecione o tipo de ingresso", "erro");

  // Atualiza descrição com valor
  const desc = document.getElementById("pagDesc");
  if (desc && window._ingressoValor) {
    desc.textContent = `Escolha como pagar – ${window._ingressoValor}`;
  }

  // Esconde detalhes de pag até escolher
  document.getElementById("pdPix").style.display    = "none";
  document.getElementById("pdCartao").style.display = "none";

  irSv(4);
}

// ── Copiar chave Pix ──────────────────────────────────
function copiarPix() {
  const chave = document.getElementById("pixKey")?.textContent?.trim();
  if (!chave) return;
  navigator.clipboard.writeText(chave).then(() => showToast("Chave Pix copiada! ✅"));
}

// ── FINALIZAR ─────────────────────────────────────────
async function finalizar() {
  const btn = document.getElementById("btnFinalizar");

  // Coleta dados do formulário
  const dados = {
    nome:      document.getElementById("f_nome")?.value.trim(),
    email:     document.getElementById("f_email")?.value.trim(),
    cpf:       document.getElementById("f_cpf")?.value.trim(),
    telefone:  document.getElementById("f_tel")?.value.trim(),
    rg:        document.getElementById("f_rg")?.value.trim(),
    indicacao: document.getElementById("f_indicacao")?.value.trim(),
    comunidade: document.querySelector('input[name="comunidade"]:checked')?.value,
    tipo:      tipoIngresso,
    pagamento: tipoPagamento,
  };

  // Honeypot anti-bot
  if (document.getElementById("f_website")?.value) return;

  btn.disabled = true;
  btn.textContent = "⏳ Processando...";

  try {
    if (tipoPagamento === "pix") {
      await finalizarPix(dados);
    } else {
      await finalizarCartao(dados);
    }
  } catch (err) {
    console.error(err);
    showToast("Erro inesperado. Tente novamente.", "erro");
    btn.disabled = false;
    btn.textContent = "🎉 Finalizar Inscrição";
  }
}

// ── Finalizar via Pix ─────────────────────────────────
async function finalizarPix(dados) {
  const resp = await fetch(`${BACKEND_URL}/pagbank/pix`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  const json = await resp.json();

  if (!resp.ok) {
    showToast(json.erro || "Erro ao gerar Pix", "erro");
    document.getElementById("btnFinalizar").disabled = false;
    document.getElementById("btnFinalizar").textContent = "🎉 Finalizar Inscrição";
    return;
  }

  // Atualiza a tela de Pix com o QR Code gerado
  const pixKey = document.getElementById("pixKey");
  if (pixKey && json.pix_copia_cola) {
    pixKey.textContent = json.pix_copia_cola;
  }

  // Se veio imagem do QR Code, mostra
  if (json.pix_qrcode_img) {
    const qrBox = document.querySelector(".pix-box");
    if (qrBox && !document.getElementById("qrImg")) {
      const img = document.createElement("img");
      img.id  = "qrImg";
      img.src = json.pix_qrcode_img;
      img.alt = "QR Code Pix";
      img.style.cssText = "width:180px;height:180px;margin:12px auto;display:block;border-radius:8px;";
      qrBox.insertBefore(img, qrBox.querySelector(".pix-key-display"));
    }
  }

  // Salva order_id para monitorar
  window._orderId = json.order_id;

  showToast(`Pix gerado! Valor: R$ ${json.valor_reais} ✅`);

  // Mostra tela de aguardo de pagamento Pix
  _mostrarAguardandoPix(dados, json);
}

// ── Tela de aguardo Pix ───────────────────────────────
function _mostrarAguardandoPix(dados, pixData) {
  const sv4 = document.getElementById("sv4");
  if (!sv4) return;

  sv4.innerHTML = `
    <div style="text-align:center;padding:16px 0;">
      <div style="font-size:48px;margin-bottom:8px;">💚</div>
      <h3 style="margin:0 0 4px;">Pix gerado com sucesso!</h3>
      <p style="color:rgba(255,255,255,.65);font-size:14px;margin:0 0 20px;">
        Pague para confirmar sua vaga no Arraiá da Paz
      </p>

      ${pixData.pix_qrcode_img ? `
        <img src="${pixData.pix_qrcode_img}" alt="QR Code Pix"
          style="width:200px;height:200px;border-radius:12px;margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;">
      ` : ""}

      <div style="background:rgba(255,255,255,.08);border-radius:12px;padding:16px;margin-bottom:16px;word-break:break-all;font-size:13px;color:rgba(255,255,255,.85);">
        ${pixData.pix_copia_cola || "–"}
      </div>

      <button class="btn-primary" onclick="copiarPixDinamico('${pixData.pix_copia_cola}')"
        style="margin-bottom:12px;">
        📋 Copiar Pix Copia e Cola
      </button>

      <p style="color:rgba(255,255,255,.5);font-size:12px;">
        Valor: <strong style="color:#f5c518;">R$ ${pixData.valor_reais}</strong> ·
        Expira em 24h<br><br>
        Após o pagamento, você receberá um e-mail de confirmação em<br>
        <strong>${dados.email}</strong>
      </p>

      <p style="margin-top:16px;color:rgba(255,255,255,.4);font-size:11px;">
        Pedido: ${pixData.order_id}
      </p>
    </div>
  `;
}

function copiarPixDinamico(chave) {
  navigator.clipboard.writeText(chave).then(() => showToast("Pix copiado! ✅"));
}

// ── Finalizar via Cartão ──────────────────────────────
async function finalizarCartao(dados) {
  const resp = await fetch(`${BACKEND_URL}/pagbank/cartao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  const json = await resp.json();

  if (!resp.ok) {
    showToast(json.erro || "Erro ao criar checkout", "erro");
    document.getElementById("btnFinalizar").disabled = false;
    document.getElementById("btnFinalizar").textContent = "🎉 Finalizar Inscrição";
    return;
  }

  if (json.link_pagamento) {
    // Redireciona para o checkout do PagBank
    showToast("Redirecionando para o pagamento seguro... 🔐");
    setTimeout(() => {
      window.location.href = json.link_pagamento;
    }, 1200);
  } else {
    showToast("Link de pagamento não disponível", "erro");
    document.getElementById("btnFinalizar").disabled = false;
    document.getElementById("btnFinalizar").textContent = "🎉 Finalizar Inscrição";
  }
}

// ── Máscara Telefone ──────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const tel = document.getElementById("f_tel");
  if (tel) {
    tel.addEventListener("input", e => {
      let v = e.target.value.replace(/\D/g, "").substring(0, 11);
      if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
      else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
      e.target.value = v;
    });
  }

  const cpf = document.getElementById("f_cpf");
  if (cpf) {
    cpf.addEventListener("input", e => {
      let v = e.target.value.replace(/\D/g, "").substring(0, 11);
      if (v.length > 9) v = `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6,9)}-${v.slice(9)}`;
      else if (v.length > 6) v = `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6)}`;
      else if (v.length > 3) v = `${v.slice(0,3)}.${v.slice(3)}`;
      e.target.value = v;
    });
  }
});
