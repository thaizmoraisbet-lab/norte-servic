'use strict';

/* EXPERIÊNCIA / TOPO / POPUP */
/* ================================================= */

function ativarTransicoesDeClique() {
  document.addEventListener("click", function(e) {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href") || "";
    const ehWhatsapp = href.includes("wa.me");
    const ehCidadeParceira = href.includes("cidade/");

    if (ehCidadeParceira && !link.target) {
      mostrarLoading("Abrindo Cidade Parceira...");
    }

    if (ehWhatsapp) {
      mostrarLoading("Abrindo WhatsApp...");
      setTimeout(esconderLoading, 900);
    }
  });
}

function ativarTopoMenorAoRolar() {
  const topo = document.querySelector(".novo-topo");
  if (!topo) return;

  // No celular o cabeçalho não diminui ao rolar. Isso evita flicker/piscadas
  // em navegadores móveis e deixa a navegação mais estável.
  if (window.matchMedia("(max-width: 820px)").matches) {
    topo.classList.remove("topo-menor");
    return;
  }

  let ticking = false;

  window.addEventListener("scroll", function() {
    if (ticking) return;

    window.requestAnimationFrame(function() {
      if (window.scrollY > 40) topo.classList.add("topo-menor");
      else topo.classList.remove("topo-menor");
      ticking = false;
    });

    ticking = true;
  }, { passive: true });
}

function mostrarPopCadastro() {
  const pop = document.getElementById("popCadastroFlutuante");
  const titulo = document.getElementById("popCadastroTitulo");
  const mensagem = document.getElementById("popCadastroMensagem");
  if (!pop) return;

  const avisos = [
    { titulo: "Novos profissionais chegando", mensagem: "Profissionais da região estão criando seus perfis na Norte Servic." },
    { titulo: "Movimento na plataforma", mensagem: "Pessoas estão buscando profissionais da região neste momento." },
    { titulo: "Cadastros em andamento", mensagem: "Novos prestadores estão preparando seus perfis na plataforma." },
    { titulo: "Oportunidade para profissionais", mensagem: "Seu serviço também pode aparecer para clientes da região." }
  ];

  const escolhido = avisos[Math.floor(Math.random() * avisos.length)];
  if (titulo) titulo.innerText = escolhido.titulo;
  if (mensagem) mensagem.innerText = escolhido.mensagem;

  setTimeout(() => {
    pop.classList.add("ativo");
    setTimeout(fecharPopCadastro, 10000);
  }, 5000);
}

function fecharPopCadastro() {
  const pop = document.getElementById("popCadastroFlutuante");
  if (!pop) return;

  pop.classList.add("saindo");
  setTimeout(() => {
    pop.classList.remove("ativo");
    pop.classList.remove("saindo");
  }, 300);
}


function adicionarAdminNoRodape() {
  const rodapes = document.querySelectorAll("footer");
  if (!rodapes.length) return;

  rodapes.forEach((rodape) => {
    if (rodape.querySelector(".rodape-admin-link")) return;

    const link = document.createElement("a");
    link.href = "/admin";
    link.className = "rodape-admin-link";
    link.setAttribute("aria-label", "Acessar área administrativa");
    link.textContent = "Área administrativa";
    rodape.appendChild(link);
  });
}

function solicitarPlanoProfissional(plano, valor) {
  const mensagem = encodeURIComponent(
    `Olá! Quero contratar o plano ${plano} da Norte Servic.\n\nValor: R$ ${valor}\nNome:\nProfissão:\nCidade:\nWhatsApp do cadastro:`
  );

  window.open(`https://wa.me/5563992229673?text=${mensagem}`, "_blank");
}


function iniciarRecuperacaoSenha() {
  const form = document.getElementById("formRecuperarSenha");
  if (!form) return;

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const mensagem = document.getElementById("mensagemRecuperarSenha");
    const botao = form.querySelector("button[type='submit']");
    const textoOriginal = botao ? botao.innerText : "";

    const whatsapp = limparNumero(document.getElementById("recuperarWhatsapp")?.value || "");
    const nome = (document.getElementById("recuperarNome")?.value || "").trim();
    const cidade = (document.getElementById("recuperarCidade")?.value || "").trim();

    if (!whatsapp || whatsapp.length < 10) {
      if (mensagem) mensagem.innerText = "Informe o WhatsApp cadastrado com DDD.";
      return;
    }

    if (!nome || !cidade) {
      if (mensagem) mensagem.innerText = "Preencha nome profissional e cidade para continuar.";
      return;
    }

    const texto = encodeURIComponent(
      `Olá! Preciso recuperar minha senha da Norte Servic.

` +
      `WhatsApp cadastrado: ${whatsapp}
` +
      `Nome profissional: ${nome}
` +
      `Cidade: ${cidade}

` +
      `Confirmo que sou o responsável por este cadastro e preciso de ajuda para redefinir minha senha.`
    );

    if (botao) {
      botao.innerText = "Abrindo WhatsApp...";
      botao.disabled = true;
    }

    if (mensagem) {
      mensagem.innerText = "Solicitação preparada. O WhatsApp será aberto para confirmar seus dados.";
    }

    mostrarLoading("Abrindo WhatsApp...");

    setTimeout(() => {
      window.open(`https://wa.me/5563992229673?text=${texto}`, "_blank");
      esconderLoading();
      if (botao) {
        botao.innerText = textoOriginal;
        botao.disabled = false;
      }
    }, 450);
  });
}


let pagamentoEfiAtual = null;
let pagamentoEfiTimer = null;

function planoEfiNome(plano) {
  const nomes = {
    essencial: 'Essencial Destaque',
    profissional: 'Profissional Plus',
    top: 'Top Norte'
  };
  return nomes[plano] || 'Plano Norte Servic';
}

async function contratarPlanoEfi(plano) {
  const token = getTokenProfissional();
  if (!token) {
    localStorage.setItem("norteServicPlanoPendente", plano);
    alert('Para contratar um plano, entre primeiro na Área Profissional. Depois você volta automaticamente para os planos.');
    window.location.href = '/login?voltar=planos';
    return;
  }

  try {
    mostrarLoading('Gerando Pix...');
    const resposta = await apiFetch('/api/pagamentos/efi/criar', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ plano })
    });

    abrirModalPagamentoEfi(resposta.pagamento, plano);
  } catch (error) {
    console.error("Erro ao gerar Pix Efí", error);
    alert(error.message || 'Erro ao gerar Pix. Confira as variáveis da Efí no Railway.');
  } finally {
    esconderLoading();
  }
}


function prepararPaginaPlanosEfi() {
  if (!document.body.classList.contains("pagina-planos") && !document.querySelector(".premium-planos")) return;

  const token = getTokenProfissional();
  const hero = document.querySelector(".planos-hero-premium");
  if (!hero || document.querySelector(".planos-login-aviso")) return;

  const aviso = document.createElement("div");
  aviso.className = token ? "planos-login-aviso conectado" : "planos-login-aviso";
  aviso.innerHTML = token
    ? `<strong>✓ Profissional conectado.</strong><span>O plano será vinculado ao seu perfil.</span>`
    : `<strong>Entre na Área Profissional para contratar.</strong><span>Assim o pagamento fica vinculado ao perfil correto.</span><a href="/login?voltar=planos">Entrar agora</a>`;
  hero.appendChild(aviso);
}

function abrirModalPagamentoEfi(pagamento, plano) {
  pagamentoEfiAtual = pagamento;
  document.documentElement.classList.add('efi-modal-aberto');
  document.body.classList.add('efi-modal-aberto');
  const modal = document.getElementById('efiPagamentoModal');
  const titulo = document.getElementById('efiPagamentoTitulo');
  const descricao = document.getElementById('efiPagamentoDescricao');
  const qrBox = document.getElementById('efiQrCodeBox');
  const copia = document.getElementById('efiPixCopiaCola');
  const status = document.getElementById('efiPagamentoStatus');

  if (!modal || !pagamento) return;

  if (titulo) titulo.innerText = planoEfiNome(plano || pagamento.plano_key);
  if (descricao) descricao.innerText = `Valor: R$ ${Number(pagamento.valor || 0).toFixed(2).replace('.', ',')}. Pague com Pix para ativar seu plano.`;
  if (copia) copia.value = pagamento.pix_copia_cola || '';
  if (status) status.innerText = 'Aguardando pagamento...';

  if (qrBox) {
    qrBox.innerHTML = pagamento.qr_code_imagem
      ? `<img src="${pagamento.qr_code_imagem}" alt="QR Code Pix">`
      : `<div class="efi-sem-qrcode">QR Code indisponível. Use o Pix copia e cola.</div>`;
  }

  modal.classList.remove('escondido');
  modal.setAttribute('aria-hidden', 'false');

  clearInterval(pagamentoEfiTimer);
  pagamentoEfiTimer = setInterval(consultarStatusPagamentoEfi, 7000);
}

function fecharModalPagamentoEfi() {
  const modal = document.getElementById('efiPagamentoModal');
  if (modal) {
    modal.classList.add('escondido');
    modal.setAttribute('aria-hidden', 'true');
  }
  document.documentElement.classList.remove('efi-modal-aberto');
  document.body.classList.remove('efi-modal-aberto');
  clearInterval(pagamentoEfiTimer);
}

async function copiarPixEfi() {
  const campo = document.getElementById('efiPixCopiaCola');
  if (!campo || !campo.value) return;
  await navigator.clipboard.writeText(campo.value);
  const status = document.getElementById('efiPagamentoStatus');
  if (status) status.innerText = 'Código Pix copiado.';
}

async function consultarStatusPagamentoEfi() {
  if (!pagamentoEfiAtual?.id) return;
  const token = getTokenProfissional();
  if (!token) {
    alert("Entre novamente na Área Profissional para confirmar o pagamento.");
    window.location.href = "/login?voltar=planos";
    return;
  }

  const statusEl = document.getElementById('efiPagamentoStatus');
  const botaoJaPaguei = document.querySelector('.efi-modal-acoes .secundario');

  try {
    if (botaoJaPaguei) {
      botaoJaPaguei.disabled = true;
      botaoJaPaguei.dataset.textoOriginal = botaoJaPaguei.dataset.textoOriginal || botaoJaPaguei.innerText;
      botaoJaPaguei.innerText = "Verificando...";
    }

    if (statusEl) statusEl.innerText = 'Verificando pagamento...';

    const resposta = await apiFetch(`/api/pagamentos/${pagamentoEfiAtual.id}/status`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    pagamentoEfiAtual = resposta.pagamento || pagamentoEfiAtual;

    if (pagamentoEfiAtual.status === 'pago') {
      clearInterval(pagamentoEfiTimer);
      if (statusEl) statusEl.innerText = 'Pagamento confirmado! Seu plano foi ativado.';
      setTimeout(() => { window.location.href = '/painel-profissional?v=pagamento-confirmado'; }, 1600);
      return;
    }

    if (statusEl) {
      statusEl.innerText = pagamentoEfiAtual.mensagem_status || 'Pagamento não identificado pela Norte Servic. Tente novamente em alguns instantes.';
    }
  } catch (error) {
    if (statusEl) statusEl.innerText = error.message || 'Erro ao consultar pagamento.';
  } finally {
    if (botaoJaPaguei && pagamentoEfiAtual?.status !== 'pago') {
      botaoJaPaguei.disabled = false;
      botaoJaPaguei.innerText = botaoJaPaguei.dataset.textoOriginal || "Já paguei";
    }
  }
}


/* ================================================= */
/* PERFIL LOGADO NO CABEÇALHO */
/* ================================================= */

function obterIniciaisProfissional(nome = "") {
  const partes = String(nome || "NS").trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] || "N";
  const segunda = partes.length > 1 ? partes[partes.length - 1][0] : "S";
  return `${primeira}${segunda}`.toUpperCase();
}

function paginaPermitePerfilLogadoCabecalho() {
  const pagina = (window.location.pathname.split('/').pop() || '/').toLowerCase();
  // Evita que links públicos enviados para clientes apareçam como se estivessem logados.
  // O perfil no cabeçalho só aparece nas áreas realmente profissionais.
  return ['/painel-profissional', '/editar-perfil', '/planos'].includes(pagina);
}

async function inserirPerfilLogadoCabecalho() {
  const header = document.querySelector(".ns-header");
  const nav = document.querySelector(".ns-nav");
  if (!header || document.querySelector(".ns-header-profile")) return;
  if (!paginaPermitePerfilLogadoCabecalho()) return;

  const token = getTokenProfissional();
  if (!token) return;

  try {
    const profissional = await apiFetch("/api/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!profissional || !profissional.id) return;

    const perfil = document.createElement("a");
    perfil.className = "ns-header-profile";
    perfil.href = "/painel-profissional";
    perfil.title = `Perfil logado: ${profissional.nome || "Profissional"}`;

    const foto = profissional.fotoPerfil || profissional.foto_perfil || "";
    const iniciais = obterIniciaisProfissional(profissional.nome);

    perfil.innerHTML = foto
      ? `<img src="${foto}" alt="${profissional.nome || "Profissional"}"><span>${profissional.nome || "Perfil"}</span>`
      : `<strong>${iniciais}</strong><span>${profissional.nome || "Perfil"}</span>`;

    if (nav) {
      nav.insertAdjacentElement("afterend", perfil);
    } else {
      header.appendChild(perfil);
    }
  } catch (error) {
    // Token antigo ou sessão expirada: não bloqueia a navegação.
    console.warn("Não foi possível carregar perfil logado no cabeçalho.", error.message);
  }
}




/* ================================================= */
/* ANIMAÇÕES SUAVES DE ROLAGEM - JS PURO */
/* ================================================= */
function iniciarAnimacoesSuavesNorteServic() {
  const seletores = [
    '.hero h1',
    '.hero p',
    '.busca-box',
    '.categorias',
    '.destaques-section .badge-destaque-home',
    '.destaques-section h2',
    '.texto-destaque-home',
    '#listaProfissionais .card',
    '.home-banner-card',
    '.por-que-card',
    '.passos > div',
    '.home-planos',
    '.plano-card',
    '.plano-card-premium',
    '.planos-info',
    '.planos-comparativo-premium',
    '.planos-final-premium',
    '.perfil-lateral',
    '.perfil-hero-texto',
    '.perfil-section-clean',
    '.avaliacao-card-publica',
    '.form-avaliacao-card',
    '.painel-profissional-header',
    '.painel-card-principal-premium',
    '.painel-extra-card',
    '.admin-stat-card',
    '.admin-prof-card',
    '.admin-avaliacao-card',
    '.admin-financeiro-dashboard',
    '.finance-card',
    '.admin-grafico-box',
    '.admin-pagamento-card',
    '.cadastro-beneficios',
    '.cadastro-form-card',
    '.grupo-form-premium'
  ];

  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduzirMovimento) return;

  const observados = new WeakSet();

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('ns-reveal-visivel');
        observer.unobserve(entrada.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -48px 0px'
  });

  function prepararAnimacoes(raiz = document) {
    seletores.forEach((seletor) => {
      raiz.querySelectorAll(seletor).forEach((el, index) => {
        if (observados.has(el) || el.classList.contains('ns-sem-animacao')) return;

        observados.add(el);
        el.classList.add('ns-reveal');

        const atraso = Math.min((index % 8) * 45, 260);
        el.style.setProperty('--ns-delay', `${atraso}ms`);

        observer.observe(el);
      });
    });
  }

  prepararAnimacoes(document);

  const mutationObserver = new MutationObserver((mutacoes) => {
    mutacoes.forEach((mutacao) => {
      mutacao.addedNodes.forEach((node) => {
        if (node.nodeType === 1) prepararAnimacoes(node);
      });
    });
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}



/* ================================================= */
/* DOCUMENTOS LEGAIS, LGPD E PRIVACIDADE */
/* ================================================= */

function iniciarDocumentosLegais() {
  const botoes = document.querySelectorAll("[data-legal-tab]");
  if (!botoes.length) return;

  function ativar(tab) {
    botoes.forEach(btn => btn.classList.toggle("ativo", btn.dataset.legalTab === tab));
    document.querySelectorAll(".legal-panel").forEach(panel => {
      panel.classList.toggle("ativo", panel.id === `legal-${tab}`);
    });
    if (history.replaceState) history.replaceState(null, "", `#${tab}`);
  }

  botoes.forEach(btn => btn.addEventListener("click", () => ativar(btn.dataset.legalTab)));
  const hash = String(location.hash || "").replace("#", "");
  if (hash && document.getElementById(`legal-${hash}`)) ativar(hash);
}

async function baixarMeusDados() {
  try {
    const dados = await apiFetch("/api/me/dados", { headers: headersAuth() });
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meus-dados-norte-servic.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    alert(error.message);
  }
}

async function solicitarExclusaoConta() {
  const motivo = prompt("Informe o motivo da solicitação de exclusão da conta:");
  if (motivo === null) return;
  if (!confirm("Enviar solicitação de exclusão para análise do administrador?")) return;

  try {
    await apiFetch("/api/me/solicitar-exclusao", {
      method: "POST",
      headers: headersAuth(),
      body: JSON.stringify({ motivo })
    });
    alert("Solicitação enviada. O administrador analisará seu pedido.");
  } catch (error) {
    alert(error.message);
  }
}

async function buscarAdminExclusoes() {
  return apiFetch("/api/admin/lgpd/exclusoes", { headers: headersAdmin() });
}

function renderizarAdminExclusoes(lista = []) {
  const box = document.getElementById("listaAdminExclusoes");
  if (!box) return;
  setAdminBadge("badgeAdminLgpd", lista.filter(item => item.status === "aguardando").length);
  box.innerHTML = lista.length ? lista.map(item => `
    <article class="admin-pagamento-card admin-lgpd-card">
      <div>
        <span class="admin-status status-${statusIndicacaoClasse(item.status)}">${item.status}</span>
        <h3>${item.profissional_nome || "Profissional"}</h3>
        <p>WhatsApp: ${item.profissional_whatsapp || "-"} · E-mail: ${item.profissional_email || "-"}</p>
        <p>Motivo: ${item.motivo || "Não informado"}</p>
        <p>Solicitado em: ${formatarDataIndicacao(item.criado_em)}</p>
      </div>
      <div class="admin-card-actions">
        ${item.status === "aguardando" ? `<button onclick="aprovarExclusaoConta(${item.id})">Aprovar/anonimizar</button><button class="alerta" onclick="recusarExclusaoConta(${item.id})">Recusar</button>` : `<small>${item.observacao_admin || "Finalizado"}</small>`}
      </div>
    </article>
  `).join("") : `<div class="admin-vazio admin-vazio-menor"><h3>Nenhuma solicitação de exclusão</h3><p>Pedidos LGPD aparecerão aqui.</p></div>`;
}

async function mostrarAdminExclusoes() {
  const box = document.getElementById("listaAdminExclusoes");
  if (!box) return;
  box.innerHTML = `<div class="admin-vazio admin-vazio-menor"><h3>Carregando solicitações...</h3></div>`;
  try {
    const dados = await buscarAdminExclusoes();
    renderizarAdminExclusoes(dados.solicitacoes || []);
  } catch (error) {
    box.innerHTML = `<div class="admin-vazio"><h3>Erro ao carregar solicitações</h3><p>${error.message}</p></div>`;
  }
}

async function aprovarExclusaoConta(id) {
  const observacao = prompt("Observação do admin:") || "Conta anonimizada conforme solicitação LGPD.";
  if (!confirm("Aprovar a solicitação e anonimizar o cadastro?")) return;
  try {
    await apiFetch(`/api/admin/lgpd/exclusoes/${id}/aprovar`, {
      method: "PATCH",
      headers: headersAdmin(),
      body: JSON.stringify({ observacao })
    });
    mostrarAdminExclusoes();
  } catch (error) { alert(error.message); }
}

async function recusarExclusaoConta(id) {
  const observacao = prompt("Motivo da recusa:") || "Solicitação recusada pelo administrador.";
  try {
    await apiFetch(`/api/admin/lgpd/exclusoes/${id}/recusar`, {
      method: "PATCH",
      headers: headersAdmin(),
      body: JSON.stringify({ observacao })
    });
    mostrarAdminExclusoes();
  } catch (error) { alert(error.message); }
}



/* ================================================= */
