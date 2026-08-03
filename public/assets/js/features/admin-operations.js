'use strict';

/* ================================================= */

function setAdminBadge(id, valor) {
  const el = document.getElementById(id);
  if (!el) return;
  const n = Number(valor || 0);
  el.textContent = n > 99 ? "99+" : String(n);
  el.classList.toggle("ativo", n > 0);
}

const ADMIN_MODULOS_INFO = {
  profissionais: {
    titulo: "Profissionais",
    destaque: "Gestão de profissionais",
    etiqueta: "Cadastros e aprovação",
    descricao: "Acompanhe cadastros, aprove perfis e mantenha a vitrine da Norte Servic organizada."
  },
  pagamentos: {
    titulo: "Financeiro",
    destaque: "Planos e pagamentos",
    etiqueta: "Gestão financeira",
    descricao: "Consulte assinaturas, pagamentos Pix, faturamento e situação dos planos em um só lugar."
  },
  indicacoes: {
    titulo: "Indicações",
    destaque: "Programa de indicação",
    etiqueta: "Comissões e saques",
    descricao: "Acompanhe indicações registradas, valores de comissão e solicitações de saque."
  },
  coletores: {
    titulo: "Coletores",
    destaque: "Equipe Cidade Parceira",
    etiqueta: "Operação de campo",
    descricao: "Credencie coletores, defina setores, ajuste comissões e acompanhe solicitações de saque."
  },
  salaempreendedor: {
    titulo: "Sala do Empreendedor",
    destaque: "Atendimento ao empreendedor",
    etiqueta: "MEI e formalização",
    descricao: "Organize encaminhamentos para MEI, emissão de nota, cursos e capacitação profissional."
  },
  lgpd: {
    titulo: "LGPD e dados",
    destaque: "Privacidade e dados",
    etiqueta: "Proteção de informações",
    descricao: "Analise pedidos de exclusão e mantenha o tratamento dos dados pessoais sob controle."
  },
  avaliacoes: {
    titulo: "Avaliações",
    destaque: "Moderação de avaliações",
    etiqueta: "Qualidade da plataforma",
    descricao: "Aprove, recuse ou remova avaliações para preservar a confiança nos perfis publicados."
  }
};

function moduloAdminAtualURL() {
  const params = new URLSearchParams(window.location.search || "");
  const modulo = params.get("modulo") || "";
  return ADMIN_MODULOS_INFO[modulo] ? modulo : "";
}

async function navegarModuloAdmin(nome) {
  const alvo = ADMIN_MODULOS_INFO[nome] ? nome : "profissionais";
  const destino = alvo === "profissionais" ? "/admin" : `/admin?modulo=${encodeURIComponent(alvo)}`;

  if (`${window.location.pathname}${window.location.search}` !== destino) {
    window.history.pushState({ moduloAdmin: alvo }, "", destino);
  }

  abrirModuloAdmin(alvo);
  atualizarCabecalhoAdmin(alvo);
  alternarMenuAdmin(false);

  await mostrarAdmin({ carregarCompleto: alvo === "profissionais" });
}

function abrirModuloAdmin(nome) {
  const alvo = ADMIN_MODULOS_INFO[nome] ? nome : "profissionais";
  document.querySelectorAll("[data-admin-section]").forEach(sec => {
    sec.classList.toggle("ativo", sec.dataset.adminSection === alvo);
  });
  document.querySelectorAll(".admin-modulo-btn").forEach(btn => {
    btn.classList.toggle("ativo", btn.dataset.adminModulo === alvo);
  });
  sessionStorage.setItem("adminModuloAtivo", alvo);
}

function atualizarCabecalhoAdmin(nome = "profissionais") {
  const alvo = ADMIN_MODULOS_INFO[nome] ? nome : "profissionais";
  const info = ADMIN_MODULOS_INFO[alvo];
  const titulo = document.getElementById("adminPaginaTitulo");
  const destaque = document.getElementById("adminPaginaDestaque");
  const etiqueta = document.getElementById("adminPaginaEtiqueta");
  const descricao = document.getElementById("adminPaginaDescricao");
  const email = document.getElementById("adminUsuarioEmail");

  if (titulo) titulo.textContent = info.titulo;
  if (destaque) destaque.textContent = info.destaque;
  if (etiqueta) etiqueta.textContent = info.etiqueta;
  if (descricao) descricao.textContent = info.descricao;
  if (email) email.textContent = localStorage.getItem(ADMIN_EMAIL_STORAGE) || sessionStorage.getItem(ADMIN_EMAIL_STORAGE) || "Sessão protegida";

  document.body.dataset.adminModulo = alvo;
  document.title = `${info.titulo} - Painel Admin Norte Servic`;
}

function alternarMenuAdmin(aberto = null) {
  const deveAbrir = aberto === null ? !document.body.classList.contains("admin-menu-aberto") : Boolean(aberto);
  document.body.classList.toggle("admin-menu-aberto", deveAbrir);
}

function configurarPaginaAdminModular() {
  const painel = document.getElementById("painelAdmin");
  if (!painel) return;

  const moduloURL = moduloAdminAtualURL();
  const modulo = moduloURL || "profissionais";

  abrirModuloAdmin(modulo);
  atualizarCabecalhoAdmin(modulo);

  if (!window.adminHistoricoConfigurado) {
    window.adminHistoricoConfigurado = true;
    window.addEventListener("popstate", () => {
      const moduloHistorico = moduloAdminAtualURL() || "profissionais";
      abrirModuloAdmin(moduloHistorico);
      atualizarCabecalhoAdmin(moduloHistorico);
      mostrarAdmin({ carregarCompleto: moduloHistorico === "profissionais" }).catch(() => {});
    });
  }
}

function restaurarModuloAdmin() {
  configurarPaginaAdminModular();
}

function buscarAdminCidadeColetas() {
  return apiFetch("/api/admin/cidade/coletas", { headers: headersAdmin() });
}

function buscarAdminColetores() {
  return apiFetch("/api/admin/cidade/coletores", { headers: headersAdmin() });
}

function buscarAdminSaquesColetores() {
  return apiFetch("/api/admin/cidade/saques", { headers: headersAdmin() });
}

function htmlStatusColetorAdmin(ativo) {
  return ativo ? '<span class="admin-status status-aprovado">Ativo</span>' : '<span class="admin-status status-pendente">Inativo</span>';
}


async function mostrarAdminColetores() {
  const lista = document.getElementById("listaAdminColetores");
  const saquesBox = document.getElementById("listaAdminSaquesColetores");
  if (!lista && !saquesBox) return;
  try {
    if (lista) lista.innerHTML = `<div class="admin-vazio admin-vazio-menor"><h3>Carregando coletores...</h3></div>`;
    if (saquesBox) saquesBox.innerHTML = `<div class="admin-vazio admin-vazio-menor"><h3>Carregando saques...</h3></div>`;
    const [coletores, saques] = await Promise.all([buscarAdminColetores(), buscarAdminSaquesColetores()]);
    window.adminColetoresCache = coletores || [];
    renderizarAdminColetores(coletores || []);
    renderizarAdminSaquesColetores(saques || []);
  } catch (error) {
    if (lista) lista.innerHTML = `<div class="admin-vazio"><h3>Erro nos coletores</h3><p>${error.message}</p></div>`;
    if (saquesBox) saquesBox.innerHTML = `<div class="admin-vazio"><h3>Erro nos saques</h3><p>${error.message}</p></div>`;
  }
}

function prepararAdminColetores() {
  const form = document.getElementById("formAdminColetor");
  if (!form || form.dataset.pronto === "true") return;
  form.dataset.pronto = "true";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const msg = document.getElementById("msgAdminColetor");
    const botao = form.querySelector('button[type="submit"]');
    const textoOriginal = botao?.textContent || "Credenciar coletor";
    if (msg) msg.textContent = "";
    try {
      if (botao) { botao.textContent = "Salvando..."; botao.disabled = true; }
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      payload.valorComissaoCadastro = Number(payload.valorComissaoCadastro || 2);
      const editandoId = form.dataset.editandoId;
      await apiFetch(editandoId ? `/api/admin/cidade/coletores/${editandoId}` : "/api/admin/cidade/coletores", {
        method: editandoId ? "PATCH" : "POST",
        headers: headersAdmin(),
        body: JSON.stringify(payload)
      });
      form.reset();
      delete form.dataset.editandoId;
      const campoSenha = document.getElementById("adminColetorSenha");
      if (campoSenha) campoSenha.required = true;
      if (botao) botao.textContent = "Credenciar coletor";
      if (document.getElementById("adminColetorComissao")) document.getElementById("adminColetorComissao").value = "2";
      if (msg) msg.textContent = "Coletor salvo com sucesso.";
      await mostrarAdminColetores();
    } catch (error) {
      if (msg) msg.textContent = error.message;
      alert(error.message);
    } finally {
      if (botao) { botao.textContent = textoOriginal; botao.disabled = false; }
    }
  });
}

function editarColetorAdmin(id) {
  const coletor = (window.adminColetoresCache || []).find(c => Number(c.id) === Number(id));
  const form = document.getElementById("formAdminColetor");
  if (!coletor || !form) return;
  form.dataset.editandoId = String(id);
  document.getElementById("adminColetorNome").value = coletor.nome || "";
  document.getElementById("adminColetorTelefone").value = coletor.telefone || "";
  document.getElementById("adminColetorEmail").value = coletor.email || "";
  document.getElementById("adminColetorSenha").value = "";
  document.getElementById("adminColetorSenha").required = false;
  document.getElementById("adminColetorSetor").value = coletor.setor || "Centro";
  document.getElementById("adminColetorComissao").value = coletor.valorComissaoCadastro || 2;
  const botao = form.querySelector('button[type="submit"]');
  if (botao) botao.textContent = "Salvar alterações do coletor";
  abrirModuloAdmin("coletores");
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function alterarStatusColetorAdmin(id, ativo) {
  const coletor = (window.adminColetoresCache || []).find(c => Number(c.id) === Number(id));
  if (!coletor) return;
  try {
    await apiFetch(`/api/admin/cidade/coletores/${id}`, {
      method: "PATCH",
      headers: headersAdmin(),
      body: JSON.stringify({ ...coletor, ativo })
    });
    await mostrarAdminColetores();
  } catch (error) { alert(error.message); }
}

async function recusarSaqueColetor(id) {
  const observacao = prompt("Motivo da recusa:") || "Recusado após avaliação dos cadastros.";
  try {
    await apiFetch(`/api/admin/cidade/saques/${id}/recusar`, {
      method: "PATCH",
      headers: headersAdmin(),
      body: JSON.stringify({ observacao })
    });
    await mostrarAdminColetores();
  } catch (error) { alert(error.message); }
}


function iniciarAtualizacaoAdminAutomatica() {
  if (!document.getElementById("painelAdmin") || window.adminAtualizacaoAutomaticaAtiva) return;
  window.adminAtualizacaoAutomaticaAtiva = true;
  setInterval(() => {
    const painel = document.getElementById("painelAdmin");
    if (!painel || painel.classList.contains("escondido") || !getAdminPassword()) return;
    mostrarAdmin({ silent: true }).catch(() => {});
  }, 30000);
}

async function iniciarPainelAdminLogado(forcarCarregamento = false) {
  const loginAdmin = document.getElementById("loginAdmin");
  const painelAdmin = document.getElementById("painelAdmin");
  if (!painelAdmin) return false;

  await verificarSessaoAdmin();

  if (loginAdmin) loginAdmin.classList.add("escondido");
  painelAdmin.classList.remove("escondido");
  document.body.classList.add("admin-dashboard-ativo");
  document.body.classList.remove("admin-menu-aberto");
  configurarPaginaAdminModular();
  iniciarAtualizacaoAdminAutomatica();
  await mostrarAdmin({ silent: !forcarCarregamento });
  return true;
}

function iniciarAdminPersistente() {
  const painelAdmin = document.getElementById("painelAdmin");
  if (!painelAdmin) return;
  iniciarPainelAdminLogado(false).catch(() => {
    removerAdminPassword();
    document.body.classList.remove("admin-dashboard-ativo", "admin-menu-aberto");
    delete document.body.dataset.adminModulo;
    const loginAdmin = document.getElementById("loginAdmin");
    if (loginAdmin) loginAdmin.classList.remove("escondido");
    if (painelAdmin) painelAdmin.classList.add("escondido");
    configurarPaginaAdminModular();
  });
}

/* ================================================= */

/* ================================================= */

function nsLoadingAplicarViewportFixoV22(loader) {
  if (!loader) return;
  loader.style.position = 'fixed';
  loader.style.inset = '0';
  loader.style.width = '100vw';
  loader.style.height = '100dvh';
  loader.style.minHeight = '100dvh';
  loader.style.zIndex = '2147483647';
  loader.style.display = 'flex';
  loader.style.alignItems = 'center';
  loader.style.justifyContent = 'center';
  loader.style.transform = 'none';
  loader.style.margin = '0';
}

function travarTelaDuranteLoading() {
  document.documentElement.classList.add("loading-travado");
  document.body?.classList.add("loading-travado");
  document.documentElement.style.overflow = "hidden";
  if (document.body) {
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  }
  requestAnimationFrame(() => {
    document.querySelectorAll(".mini-loading.ativo, .ns-page-loader.ativo").forEach(nsLoadingAplicarViewportFixoV22);
  });
}

function liberarTelaDepoisLoading() {
  document.documentElement.classList.remove("loading-travado");
  document.body?.classList.remove("loading-travado");
  document.documentElement.style.overflow = "";
  if (document.body) {
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    delete document.body.dataset.nsLoadingTravado;
    delete document.body.dataset.nsLoadingScrollY;
  }
}

function garantirLoadingNorteServicPadrao(loading, texto = "Carregando informações...") {
  if (!loading) return;
  loading.innerHTML = `
    <div class="ns-loader-card ns-loader-card-v22" role="status" aria-live="polite">
      <div class="ns-loader-logo ns-loader-logo-v22" aria-hidden="true"><span>NS</span></div>
      <strong>Norte Servic</strong>
      <p>${texto}</p>
      <div class="ns-loader-bar"><span></span></div>
    </div>
  `;
}

function mostrarLoading(texto = "Carregando informações...") {
  let loading = document.getElementById("miniLoading");
  if (!loading) {
    loading = document.createElement("div");
    loading.id = "miniLoading";
    loading.className = "mini-loading";
    document.body.appendChild(loading);
  }
  if (loading.parentElement !== document.body) document.body.appendChild(loading);
  garantirLoadingNorteServicPadrao(loading, texto);
  loading.classList.add("ativo");
  nsLoadingAplicarViewportFixoV22(loading);
  travarTelaDuranteLoading();
}

function esconderLoading() {
  const loading = document.getElementById("miniLoading");
  if (loading) {
    loading.classList.remove("ativo");
    loading.style.display = "";
  }
  const loadersAtivos = document.querySelectorAll(".mini-loading.ativo, .ns-page-loader.ativo");
  if (!loadersAtivos.length) liberarTelaDepoisLoading();
}

function iniciarCarregamentoNorteServic() {
  if (document.querySelector(".ns-page-loader")) return;
  const loader = document.createElement("div");
  loader.className = "ns-page-loader ativo";
  loader.innerHTML = `
    <div class="ns-loader-card ns-loader-card-v22" role="status" aria-live="polite">
      <div class="ns-loader-logo ns-loader-logo-v22" aria-hidden="true"><span>NS</span></div>
      <strong>Norte Servic</strong>
      <p>Carregando informações...</p>
      <div class="ns-loader-bar"><span></span></div>
    </div>
  `;
  document.body.appendChild(loader);
  nsLoadingAplicarViewportFixoV22(loader);
  travarTelaDuranteLoading();
  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("saindo");
      setTimeout(() => {
        loader.remove();
        const loadersAtivos = document.querySelectorAll(".mini-loading.ativo, .ns-page-loader.ativo:not(.saindo)");
        if (!loadersAtivos.length) liberarTelaDepoisLoading();
      }, 320);
    }, 350);
  });
}

function ativarAbaCidadeParceiraAdmin(tipo = 'coletas', botao = null) {
  document.querySelectorAll('.cidade-parceira-tabs-v22 button').forEach(b => b.classList.remove('ativo'));
  if (botao) botao.classList.add('ativo');
  const box = document.getElementById('listaAdminCidadeColetas');
  if (box) box.dataset.filtroCidade = tipo;
  renderizarAdminCidadeColetas(cidadeColetasAdminCache || []);
}

function renderizarAdminCidadeColetas(coletas = []) {
  cidadeColetasAdminCache = coletas || [];
  renderizarSalaEmpreendedorAdmin(cidadeColetasAdminCache);
  const box = document.getElementById("listaAdminCidadeColetas");
  if (!box) return;

  const filtro = box.dataset.filtroCidade || 'coletas';
  let lista = [...cidadeColetasAdminCache];
  if (filtro === 'publicados') lista = lista.filter(item => item.aceitaSite || item.profissionalSiteId);
  if (filtro === 'relatorio') lista = lista.filter(item => !(item.aceitaSite || item.profissionalSiteId));

  if (!lista.length) {
    box.innerHTML = `<div class="admin-vazio admin-vazio-menor"><h3>Nenhum cadastro nesta aba</h3><p>Use outra aba interna ou aguarde novas coletas.</p></div>`;
    return;
  }

  box.innerHTML = lista.slice(0, 180).map(item => {
    const perfilId = item.profissionalSiteId || item.profissional_site_id || '';
    const whatsapp = item.whatsapp || '';
    const status = item.aceitaSite || perfilId ? 'Publicado' : 'Relatório';
    const necessidades = (item.necessidadesEmpreendedor || []).map(rotuloNecessidadeEmpreendedor).slice(0, 2).join(' • ');
    return `
      <article class="admin-cidade-coleta-card compacto card-premium-v22">
        <div class="admin-card-main-v22">
          <span class="admin-status ${status === "Publicado" ? "status-aprovado" : "status-pendente"}">${status}</span>
          <h3>${item.nome || "Profissional"}</h3>
          <p><strong>${item.profissao || "Profissão"}</strong> • ${item.setor || "Setor"}</p>
          <small>${item.meiStatus && item.meiStatus !== 'nao_informado' ? 'MEI: ' + item.meiStatus + ' • ' : ''}${necessidades || formatarDataHoraCurta(item.criadoEm)}</small>
        </div>
        <div class="admin-cidade-coleta-info compacto">
          <strong>${whatsapp || "Sem WhatsApp"}</strong>
          ${perfilId ? `<a href="/perfil?id=${perfilId}" target="_blank">Ver perfil</a>` : ""}
          ${perfilId ? `<a href="/editar-perfil?id=${perfilId}&admin=1" target="_blank">Editar</a>` : ""}
          ${whatsapp ? `<a href="${criarLinkWhatsApp(whatsapp)}" target="_blank">WhatsApp</a>` : ""}
        </div>
      </article>
    `;
  }).join("");
}

function htmlAdminPagamentoCard(p) {
  const status = statusPagamentoAdmin(p);
  const bruto = valorPagamentoNumero(p);
  const liquido = valorLiquidoEstimado(p);
  const taxa = Math.max(0, bruto - liquido);
  const nome = p.profissional_nome || p.profissionalNome || "Profissional";
  const whatsapp = p.profissional_whatsapp || p.profissionalWhatsapp || "";
  const plano = p.plano_nome || p.planoNome || p.plano_key || p.plano || "Plano";
  const txid = p.efi_txid || p.txid || "";
  const dataCriacao = formatarDataHoraCurta(p.criado_em || p.criadoEm);
  const dataPago = formatarDataHoraCurta(p.pago_em || p.pagoEm);
  const vencimentoPlano = formatarDataCurta(p.plano_vencimento || p.planoVencimento || "");
  const mensagemExpirado = mensagemWhatsAppPagamentoExpirado(p);
  const linkExpirado = linkWhatsappNumeroMensagem(whatsapp, mensagemExpirado);

  return `
    <article class="admin-pagamento-card status-${status} card-premium-v22">
      <div class="pagamento-card-topo">
        <div>
          <span class="pagamento-status ${status}">${labelStatusPagamentoAdmin(status)}</span>
          <h3>${nome}</h3>
          <p>${plano}</p>
        </div>
        <strong>${formatarMoedaBR(bruto)}</strong>
      </div>
      <div class="pagamento-metricas">
        <p><span>Líquido</span><strong>${formatarMoedaBR(liquido)}</strong></p>
        <p><span>Taxa</span><strong>${formatarMoedaBR(taxa)}</strong></p>
        <p><span>WhatsApp</span><strong>${whatsapp || "Não informado"}</strong></p>
        <p><span>Criado</span><strong>${dataCriacao || "-"}</strong></p>
        <p><span>Pago em</span><strong>${dataPago || "-"}</strong></p>
        <p><span>Vencimento</span><strong>${vencimentoPlano || "Após ativação + 35 dias"}</strong></p>
      </div>
      <small class="pagamento-txid">TXID: ${txid || "não informado"}</small>
      <div class="pagamento-acoes">
        ${whatsapp ? `<a href="${criarLinkWhatsApp(whatsapp)}" target="_blank">WhatsApp</a>` : ""}
        ${status === "expirado" && whatsapp ? `<a class="alerta" href="${linkExpirado}" target="_blank">Cobrar</a>` : ""}
        ${status === "pago" && whatsapp ? `<button type="button" onclick="enviarNotaFiscalWhatsAppAdmin(${p.id})">Enviar NF</button>` : ""}
        ${p.profissional_id ? `<a href="/perfil?id=${p.profissional_id}" target="_blank">Perfil</a>` : ""}
        ${p.profissional_id ? `<a class="destaque" href="/editar-perfil?id=${p.profissional_id}&admin=1" target="_blank">Editar</a>` : ""}
      </div>
    </article>
  `;
}

function renderizarSalaEmpreendedorAdmin(coletas = cidadeColetasAdminCache, filtro = 'todos') {
  const resumo = document.getElementById('adminSalaEmpreendedorResumo');
  const listaBox = document.getElementById('listaAdminSalaEmpreendedor');
  if (!listaBox && !resumo) return;
  cidadeColetasAdminCache = coletas || [];

  const lista = cidadeColetasAdminCache;
  const total = lista.length;
  setAdminBadge('badgeAdminSalaEmpreendedor', lista.filter(i => i.meiStatus === 'nao' || ['sim','talvez'].includes(i.interesseFormalizacao) || (i.necessidadesEmpreendedor || []).length).length);
  const mei = lista.filter(i => i.meiStatus === 'sim').length;
  const informais = lista.filter(i => i.meiStatus === 'nao').length;
  const querMei = lista.filter(i => ['sim','talvez'].includes(i.interesseFormalizacao)).length;
  const nota = lista.filter(i => (i.necessidadesEmpreendedor || []).includes('emitir_nota')).length;
  const cursos = lista.filter(i => (i.necessidadesEmpreendedor || []).includes('curso_capacitacao')).length;
  const porSetor = lista.reduce((acc, item) => {
    const setor = item.setor || 'Sem setor';
    acc[setor] = (acc[setor] || 0) + 1;
    return acc;
  }, {});
  const topSetor = Object.entries(porSetor).sort((a,b)=>b[1]-a[1])[0];

  if (resumo) {
    resumo.innerHTML = `
      <article class="finance-card destaque"><span>Mapeados</span><strong>${total}</strong><small>profissionais e pequenos negócios</small></article>
      <article class="finance-card"><span>Informais</span><strong>${informais}</strong><small>ainda não são MEI</small></article>
      <article class="finance-card"><span>Querem MEI</span><strong>${querMei}</strong><small>formalização/orientação</small></article>
      <article class="finance-card"><span>Nota fiscal</span><strong>${nota}</strong><small>precisam de orientação</small></article>
      <article class="finance-card"><span>Cursos</span><strong>${cursos}</strong><small>capacitação/divulgação</small></article>
      <article class="finance-card"><span>Setor destaque</span><strong>${topSetor ? topSetor[0] : '-'}</strong><small>${topSetor ? topSetor[1] + ' registro(s)' : 'sem dados'}</small></article>
    `;
  }

  let filtrados = lista;
  if (filtro === 'informal') filtrados = lista.filter(i => i.meiStatus === 'nao');
  if (filtro === 'quer_mei') filtrados = lista.filter(i => ['sim','talvez'].includes(i.interesseFormalizacao));
  if (filtro === 'curso') filtrados = lista.filter(i => (i.necessidadesEmpreendedor || []).includes('curso_capacitacao'));
  if (filtro === 'nota') filtrados = lista.filter(i => (i.necessidadesEmpreendedor || []).includes('emitir_nota'));

  if (listaBox) {
    listaBox.innerHTML = filtrados.length ? filtrados.slice(0, 180).map(item => {
      const necessidades = (item.necessidadesEmpreendedor || []).map(rotuloNecessidadeEmpreendedor);
      const whats = item.whatsapp || '';
      return `
        <article class="admin-sala-card card-premium-v22">
          <div class="admin-card-main-v22">
            <span class="admin-status ${item.meiStatus === 'sim' ? 'status-aprovado' : 'status-pendente'}">MEI: ${item.meiStatus || 'não informado'}</span>
            <h3>${item.nome || 'Profissional'}</h3>
            <p><strong>${item.profissao || 'Profissão'}</strong> • ${item.setor || 'Setor'} • ${item.bairro || ''}</p>
            <small>${necessidades.length ? necessidades.join(' • ') : 'Sem necessidade registrada'}${item.observacaoEmpreendedor ? ' • ' + item.observacaoEmpreendedor : ''}</small>
          </div>
          <div class="admin-sala-acoes">
            ${whats ? `<a href="${linkWhatsappNumeroMensagem(whats, mensagemSalaEmpreendedorAdmin(item))}" target="_blank">Convocar</a>` : ''}
            ${item.profissionalSiteId ? `<a href="/perfil?id=${item.profissionalSiteId}" target="_blank">Perfil</a>` : ''}
            ${item.profissionalSiteId ? `<a href="/editar-perfil?id=${item.profissionalSiteId}&admin=1" target="_blank">Editar</a>` : ''}
          </div>
        </article>`;
    }).join('') : `<div class="admin-vazio admin-vazio-menor"><h3>Nenhum perfil neste filtro</h3><p>Use outro filtro ou aguarde novas coletas.</p></div>`;
  }
}

function baixarRelatorioSalaEmpreendedor() {
  const lista = cidadeColetasAdminCache || [];
  const total = lista.length;
  const mei = lista.filter(i => i.meiStatus === 'sim').length;
  const informais = lista.filter(i => i.meiStatus === 'nao').length;
  const querMei = lista.filter(i => ['sim','talvez'].includes(i.interesseFormalizacao)).length;
  const emitirNota = lista.filter(i => (i.necessidadesEmpreendedor || []).includes('emitir_nota')).length;
  const curso = lista.filter(i => (i.necessidadesEmpreendedor || []).includes('curso_capacitacao')).length;
  const profissaoRank = Object.entries(lista.reduce((acc, item) => {
    const key = item.profissao || 'Não informado';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {})).sort((a,b)=>b[1]-a[1]).slice(0, 8);
  const setorRank = Object.entries(lista.reduce((acc, item) => {
    const key = item.setor || 'Sem setor';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {})).sort((a,b)=>b[1]-a[1]).slice(0, 8);
  const hoje = new Date().toLocaleDateString('pt-BR');
  const paginas = [];

  function cabecalho(titulo = 'Relatório Municipal de Empreendedorismo') {
    return [
      pdfRetangulo(0, 750, 595, 92, '15 23 42'),
      pdfRetangulo(0, 740, 595, 12, '37 99 235'),
      pdfRetangulo(42, 777, 42, 42, '37 99 235'),
      pdfLinha('NS', 53, 792, 15, '255 255 255', true),
      pdfLinha('Norte Servic', 94, 804, 21, '255 255 255', true),
      pdfLinha('Cidade Parceira + Sala do Empreendedor', 94, 782, 10, '219 234 254'),
      pdfLinha(titulo, 42, 710, 18, '15 23 42', true),
      pdfLinha(`Gerado em ${hoje}`, 42, 692, 10, '100 116 139'),
    ];
  }

  let pagina = cabecalho();
  pagina.push(pdfLinha('Diagnóstico da economia local', 42, 656, 15, '15 23 42', true));
  pagina.push(pdfLinha('Este relatório organiza dados coletados em campo para orientar formalização, nota fiscal, cursos,', 42, 638, 9.5, '51 65 85'));
  pagina.push(pdfLinha('divulgação, compras locais e encaminhamento para a Sala do Empreendedor da prefeitura.', 42, 624, 9.5, '51 65 85'));
  const cards = [
    [String(total), 'Mapeados', '219 234 254', '37 99 235'],
    [String(informais), 'Informais', '254 226 226', '185 28 28'],
    [String(querMei), 'Querem MEI', '240 253 244', '22 163 74'],
    [String(emitirNota), 'Nota fiscal', '255 247 237', '234 88 12'],
    [String(curso), 'Cursos', '239 246 255', '37 99 235']
  ];
  cards.forEach((card, idx) => {
    const x = 42 + idx * 103;
    pagina.push(pdfRetangulo(x, 548, 92, 58, card[2]));
    pagina.push(pdfLinha(card[0], x + 10, 578, 20, card[3], true));
    pagina.push(pdfLinha(card[1], x + 10, 562, 8.5, '15 23 42', true));
  });
  pagina.push(pdfLinha(`Profissionais já MEI: ${mei}`, 42, 516, 10.5, '15 23 42'));
  pagina.push(pdfLinha('Sugestões de ações para a prefeitura:', 42, 486, 13, '15 23 42', true));
  [
    '1. Realizar mutirão de atendimento para MEI, nota fiscal e declaração anual.',
    '2. Usar o ranking de profissões para planejar cursos e capacitações com parceiros institucionais.',
    '3. Criar agenda de divulgação dos profissionais locais no portal da prefeitura.',
    '4. Encaminhar informais interessados para orientação da Sala do Empreendedor.',
    '5. Fortalecer compras locais quando possível, respeitando as regras legais.'
  ].forEach((linha, idx) => pagina.push(pdfLinha(linha, 52, 466 - idx * 18, 9.5, '51 65 85')));
  pagina.push(pdfLinha('Ranking de profissões mapeadas', 42, 356, 13, '15 23 42', true));
  profissaoRank.forEach(([nome, qtd], idx) => {
    pagina.push(pdfRetangulo(42, 330 - idx * 24, 225, 18, idx % 2 ? '255 255 255' : '248 250 252'));
    pagina.push(pdfLinha(`${idx+1}. ${nome}`.slice(0, 34), 50, 343 - idx * 24, 8.5, '15 23 42', true));
    pagina.push(pdfLinha(`${qtd}`, 242, 343 - idx * 24, 8.5, '37 99 235', true));
  });
  pagina.push(pdfLinha('Distribuição por setor', 310, 356, 13, '15 23 42', true));
  setorRank.forEach(([nome, qtd], idx) => {
    pagina.push(pdfRetangulo(310, 330 - idx * 24, 225, 18, idx % 2 ? '255 255 255' : '248 250 252'));
    pagina.push(pdfLinha(`${idx+1}. ${nome}`.slice(0, 34), 318, 343 - idx * 24, 8.5, '15 23 42', true));
    pagina.push(pdfLinha(`${qtd}`, 510, 343 - idx * 24, 8.5, '37 99 235', true));
  });
  pagina.push(pdfLinha('Norte Servic - tecnologia e dados para desenvolvimento local', 42, 36, 9, '100 116 139'));
  paginas.push(pagina);

  for (let i = 0; i < lista.length; i += 20) {
    const extra = cabecalho('Lista de encaminhamento');
    let y = 660;
    lista.slice(i, i + 20).forEach((item, idx) => {
      const necessidades = (item.necessidadesEmpreendedor || []).map(rotuloNecessidadeEmpreendedor).join(', ') || 'Sem necessidade registrada';
      extra.push(pdfRetangulo(42, y - 19, 510, 29, idx % 2 === 0 ? '248 250 252' : '255 255 255'));
      extra.push(pdfLinha(`${item.nome || '-'} | ${item.profissao || '-'} | ${item.setor || '-'}`.slice(0, 82), 52, y, 8.5, '15 23 42', true));
      extra.push(pdfLinha(`MEI: ${item.meiStatus || '-'} | Formalização: ${item.interesseFormalizacao || '-'} | ${necessidades}`.slice(0, 105), 52, y - 12, 8, '71 85 105'));
      y -= 31;
    });
    extra.push(pdfLinha('Encaminhamento sugerido: atendimento orientado pela Sala do Empreendedor municipal.', 42, 36, 9, '100 116 139'));
    paginas.push(extra);
  }

  pdfBaixar(`relatorio-sala-empreendedor-${new Date().toISOString().slice(0,10)}.pdf`, paginas);
}

function mensagemNotaFiscalPagamentoAdmin(pagamento) {
  const nome = pagamento.profissional_nome || pagamento.profissionalNome || 'Profissional';
  const plano = pagamento.plano_nome || pagamento.planoNome || pagamento.plano_key || pagamento.plano || 'plano contratado';
  const valor = formatarMoedaBR(valorPagamentoNumero(pagamento));
  return encodeURIComponent(`Olá, ${nome}! Aqui é da Norte Servic.\n\nReferente ao pagamento do ${plano}, no valor de ${valor}, envie por aqui a nota fiscal/recibo ou confirme os dados para emissão.\n\nCaso já tenha enviado, pode desconsiderar esta mensagem.`);
}

function enviarNotaFiscalWhatsAppAdmin(id) {
  const pagamento = (pagamentosAdminCache || []).find(p => Number(p.id) === Number(id));
  if (!pagamento) return alert('Pagamento não encontrado no painel.');
  const whatsapp = pagamento.profissional_whatsapp || pagamento.profissionalWhatsapp || '';
  if (!whatsapp) return alert('Este pagamento não possui WhatsApp do profissional.');
  window.open(`https://wa.me/${limparNumero(whatsapp)}?text=${mensagemNotaFiscalPagamentoAdmin(pagamento)}`, '_blank');
}

function reenviarWhatsAppCadastroAdmin(coletaId) {
  const item = (cidadeColetasAdminCache || []).find(c => Number(c.id) === Number(coletaId));
  if (!item) return alert('Cadastro da coleta não encontrado.');
  const whats = item.whatsapp || '';
  if (!whats) return alert('Este cadastro não possui WhatsApp.');
  const link = item.profissionalSiteId ? `${window.location.origin}/completar-perfil` : `${window.location.origin}/cidade/coletor`;
  const msg = encodeURIComponent(`Olá, ${item.nome || 'profissional'}! Aqui é da Norte Servic.\n\nSeu cadastro foi registrado no projeto Cidade Parceira. Para revisar e completar seu perfil, acesse:\n${link}`);
  window.open(`https://wa.me/${limparNumero(whats)}?text=${msg}`, '_blank');
}

function aplicarFiltroSalaEmpreendedor(filtro = 'todos') {
  document.querySelectorAll('.admin-filtros-sala button').forEach(btn => btn.classList.remove('ativo'));
  const botao = Array.from(document.querySelectorAll('.admin-filtros-sala button')).find(btn => String(btn.getAttribute('onclick') || '').includes(`'${filtro}'`));
  if (botao) botao.classList.add('ativo');
  renderizarSalaEmpreendedorAdmin(cidadeColetasAdminCache || [], filtro);
}

function mascararPixAdmin(valor = '') {
  const texto = String(valor || '');
  if (texto.length <= 6) return texto || '-';
  return `${texto.slice(0, 3)}***${texto.slice(-3)}`;
}


function renderizarAdminColetores(coletores = []) {
  const box = document.getElementById("listaAdminColetores");
  if (!box) return;
  if (!coletores.length) {
    box.innerHTML = `<div class="admin-vazio admin-vazio-menor"><h3>Nenhum coletor cadastrado</h3><p>Cadastre o primeiro coletor no formulário ao lado.</p></div>`;
    return;
  }

  box.innerHTML = coletores.map(c => `
    <article class="admin-coletor-card admin-coletor-card-v28" data-coletor-id="${c.id}">
      <div class="admin-coletor-card-topo">
        <div class="admin-coletor-identidade">
          ${htmlStatusColetorAdmin(c.ativo)}
          <h3>${c.nome}</h3>
          <p>${c.email}</p>
        </div>
        <strong class="admin-coletor-valor">${formatarMoedaBR(c.valorComissaoCadastro || 2)}</strong>
      </div>
      <div class="admin-coletor-metricas admin-coletor-metricas-v28">
        <p><span>Telefone</span><strong>${c.telefone || "Não informado"}</strong></p>
        <p><span>Setor</span><strong>${c.setor || "-"}</strong></p>
        <p><span>Hoje</span><strong>${c.cadastrosHoje || 0}</strong></p>
        <p><span>Total</span><strong>${c.totalCadastros || 0}</strong></p>
        <p><span>No site</span><strong>${c.aceitosSite || 0}</strong></p>
      </div>
      <div class="admin-coletor-acoes admin-coletor-acoes-v28">
        <button onclick="editarColetorAdmin(${c.id})">Editar</button>
        <button onclick="alterarStatusColetorAdmin(${c.id}, ${c.ativo ? "false" : "true"})">${c.ativo ? "Desativar" : "Ativar"}</button>
        ${c.telefone ? `<a href="${criarLinkWhatsApp(c.telefone)}" target="_blank">WhatsApp</a>` : ""}
      </div>
    </article>
  `).join("");
}


function statusSaqueColetorLabel(status = '') {
  return {
    aguardando: 'Aguardando pagamento manual',
    pago: 'Pagamento enviado',
    recusado: 'Recusado'
  }[status] || status || 'aguardando';
}

function renderizarAdminSaquesColetores(saques = []) {
  const box = document.getElementById("listaAdminSaquesColetores");
  if (!box) return;
  const pendentes = saques.filter(s => s.status === "aguardando").length;
  setAdminBadge("badgeAdminColetores", pendentes);

  box.innerHTML = saques.length ? `
    <div class="admin-saque-toolbar-v31">
      <div>
        <strong>${pendentes}</strong>
        <span>saque(s) aguardando pagamento manual</span>
      </div>
      <small>Pague manualmente pela Efí usando a chave Pix do coletor. Depois clique em “Marcar pago”.</small>
    </div>
    ${saques.map(s => `
      <article class="admin-pagamento-card admin-saque-coletor-v27 admin-saque-coletor-v28 admin-saque-coletor-v31 status-${s.status === "pago" ? "pago" : s.status === "recusado" ? "expirado" : "aguardando"}">
        <div class="pagamento-card-topo">
          <div>
            <span class="pagamento-status ${s.status === "pago" ? "pago" : "aguardando"}">${statusSaqueColetorLabel(s.status)}</span>
            <h3>${s.coletorNome}</h3>
            <p>${s.setor || "Setor não informado"} • ${formatarDataCurta(s.dataReferencia)}</p>
          </div>
          <strong>${formatarMoedaBR(s.valor)}</strong>
        </div>
        <div class="pagamento-metricas admin-saque-pix-grid">
          <p><span>Cadastros</span><strong>${s.cadastrosContados}</strong></p>
          <p><span>Telefone</span><strong>${s.coletorTelefone || "-"}</strong></p>
          <p><span>Titular Pix</span><strong>${s.pixNomeTitular || "-"}</strong></p>
          <p><span>CPF/CNPJ</span><strong>${s.pixCpfCnpj || "-"}</strong></p>
          <p><span>Tipo Pix</span><strong>${s.pixTipoChave || "-"}</strong></p>
          <p><span>Chave Pix</span><strong>${s.pixChave || "-"}</strong></p>
          <p><span>Banco</span><strong>${s.bancoNome || "-"}</strong></p>
          <p><span>Pago em</span><strong>${formatarDataHoraCurta(s.pagoEm) || "-"}</strong></p>
          <p><span>Observação</span><strong>${s.observacaoAdmin || "Aguardando pagamento manual"}</strong></p>
        </div>
        <div class="pagamento-acoes">
          ${s.coletorTelefone ? `<a href="${criarLinkWhatsApp(s.coletorTelefone)}" target="_blank">WhatsApp</a>` : ""}
          ${s.pixChave ? `<button type="button" onclick="navigator.clipboard?.writeText('${String(s.pixChave).replace(/'/g, "\\'")}'); alert('Chave Pix copiada.')">Copiar Pix</button>` : ""}
          ${s.status === "aguardando" ? `<button onclick="marcarSaqueColetorPago(${s.id})">Marcar pago</button><button class="alerta" onclick="recusarSaqueColetor(${s.id})">Recusar</button>` : ""}
        </div>
      </article>
    `).join("")}
  ` : `<div class="admin-vazio admin-vazio-menor"><h3>Nenhum saque de coletor solicitado</h3><p>Quando o coletor completar a meta e pedir saque, a notificação aparecerá aqui.</p></div>`;
}

async function marcarSaqueColetorPago(id) {
  const senhaAutorizacao = prompt("Digite a senha interna para confirmar que você pagou manualmente pela Efí:");
  if (senhaAutorizacao === null) return;
  const observacao = prompt("Observação do pagamento:", "Pago manualmente pela Efí.") || "Pago manualmente pela Efí.";
  try {
    await apiFetch(`/api/admin/cidade/saques/${id}/pagar`, {
      method: "PATCH",
      headers: headersAdmin(),
      body: JSON.stringify({ observacao, senhaAutorizacao })
    });
    alert("Pagamento manual registrado com sucesso.");
    await mostrarAdminColetores();
  } catch (error) { alert(error.message); }
}

// Garante que funções antigas de Pix automático não apareçam/acionem envio.


