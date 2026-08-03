'use strict';

/* ADMIN */
/* ================================================= */

async function entrarAdmin() {
  const email = document.getElementById("emailAdmin")?.value || "";
  const senha = document.getElementById("senhaAdmin")?.value || "";
  const erro = document.getElementById("erroSenha");

  if (!email || !senha) {
    if (erro) erro.innerText = "Digite o e-mail e a senha do admin.";
    return;
  }

  try {
    mostrarLoading("Entrando com segurança...");
    if (erro) erro.innerText = "";
    const dados = await apiFetch("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha })
    });
    setAdminPassword("sessao-ok");
    localStorage.setItem(ADMIN_EMAIL_STORAGE, dados?.usuario?.email || email);
    sessionStorage.setItem(ADMIN_EMAIL_STORAGE, dados?.usuario?.email || email);
    await iniciarPainelAdminLogado(true);
  } catch (error) {
    removerAdminPassword();
    if (erro) erro.innerText = error.message || "Não foi possível entrar no painel.";
  } finally {
    esconderLoading();
  }
}

function ativarEnterNoAdmin() {
  const campos = [document.getElementById("emailAdmin"), document.getElementById("senhaAdmin")].filter(Boolean);
  if (!campos.length) return;
  campos.forEach(campo => {
    campo.addEventListener("keyup", e => {
      if (e.key === "Enter") entrarAdmin();
    });
  });
}

function filtrarAdmin(status, botao = null) {
  filtroAdminAtual = status;
  document.querySelectorAll(".admin-filtros-profissionais button").forEach(btn => btn.classList.remove("ativo"));
  if (botao) botao.classList.add("ativo");
  mostrarAdmin();
}

async function buscarAdminProfissionais() {
  return apiFetch("/api/admin/profissionais", {
    headers: headersAdmin()
  });
}

async function buscarAdminPagamentos() {
  return apiFetch("/api/admin/pagamentos", {
    headers: headersAdmin()
  });
}

function filtrarPagamentosAdmin(status, botao = null) {
  filtroPagamentosAdminAtual = status;
  document.querySelectorAll(".admin-filtros-pagamentos button").forEach(btn => btn.classList.remove("ativo"));
  if (botao) botao.classList.add("ativo");
  renderizarAdminPagamentos(pagamentosAdminCache);
}

function calcularResumoFinanceiroAdmin(pagamentos = [], profissionais = []) {
  const pagos = pagamentos.filter(p => statusPagamentoAdmin(p) === "pago");
  const aguardando = pagamentos.filter(p => statusPagamentoAdmin(p) === "aguardando");
  const expirados = pagamentos.filter(p => statusPagamentoAdmin(p) === "expirado");
  const bruto = pagos.reduce((total, p) => total + valorPagamentoNumero(p), 0);
  const liquido = pagos.reduce((total, p) => total + valorLiquidoEstimado(p), 0);
  const taxa = Math.max(0, bruto - liquido);

  const aprovados = profissionais.filter(p => p.status === "aprovado");
  const assinantes = aprovados.filter(p => {
    const plano = String(p.planoAtual || p.plano_atual || "Gratuito").toLowerCase();
    const status = String(p.planoStatus || p.plano_status || "ativo").toLowerCase();
    return plano && plano !== "gratuito" && plano !== "free" && status === "ativo";
  });
  const gratuitos = aprovados.filter(p => !assinantes.includes(p));

  return { pagos, aguardando, expirados, bruto, liquido, taxa, assinantes, gratuitos };
}

function renderizarResumoFinanceiroAdmin(pagamentos = [], profissionais = []) {
  const resumo = calcularResumoFinanceiroAdmin(pagamentos, profissionais);
  const box = document.getElementById("adminFinanceiroResumo");
  if (box) {
    box.innerHTML = `
      <article class="finance-card destaque"><span>Faturamento bruto</span><strong>${formatarMoedaBR(resumo.bruto)}</strong><small>Total de planos pagos</small></article>
      <article class="finance-card"><span>Saldo estimado Efí</span><strong>${formatarMoedaBR(resumo.liquido)}</strong><small>Descontando taxa estimada</small></article>
      <article class="finance-card"><span>Taxas estimadas</span><strong>${formatarMoedaBR(resumo.taxa)}</strong><small>Aprox. 1,21% pelo primeiro pagamento</small></article>
      <article class="finance-card"><span>Assinaturas pagas</span><strong>${resumo.pagos.length}</strong><small>Pagamentos confirmados</small></article>
      <article class="finance-card"><span>Aguardando</span><strong>${resumo.aguardando.length}</strong><small>Pix gerados e não pagos</small></article>
      <article class="finance-card"><span>Expirados</span><strong>${resumo.expirados.length}</strong><small>Pix vencidos ou não concluídos</small></article>
      <article class="finance-card"><span>Assinantes ativos</span><strong>${resumo.assinantes.length}</strong><small>Profissionais com plano</small></article>
      <article class="finance-card"><span>Gratuitos</span><strong>${resumo.gratuitos.length}</strong><small>Perfis aprovados sem plano</small></article>
    `;
  }

  renderizarGraficoFaturamentoAdmin(resumo.pagos);
}

function renderizarGraficoFaturamentoAdmin(pagos = []) {
  const grafico = document.getElementById("adminGraficoFaturamento");
  if (!grafico) return;

  const dias = Array.from({ length: 7 }, (_, i) => {
    const data = new Date();
    data.setDate(data.getDate() - (6 - i));
    return {
      chave: data.toISOString().slice(0, 10),
      label: data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      total: 0
    };
  });

  pagos.forEach(p => {
    const data = new Date(p.pago_em || p.atualizado_em || p.criado_em || Date.now()).toISOString().slice(0, 10);
    const dia = dias.find(d => d.chave === data);
    if (dia) dia.total += valorPagamentoNumero(p);
  });

  const max = Math.max(...dias.map(d => d.total), 1);
  grafico.innerHTML = dias.map(d => {
    const altura = Math.max(8, Math.round((d.total / max) * 100));
    return `<div class="grafico-dia"><div class="grafico-barra" style="height:${altura}%"><span>${d.total > 0 ? formatarMoedaBR(d.total) : ""}</span></div><small>${d.label}</small></div>`;
  }).join("");
}

function chaveDataPagamentoAdmin(p) {
  const data = p.criado_em || p.criadoEm || p.pago_em || p.pagoEm || p.atualizado_em || p.atualizadoEm || Date.now();
  const d = new Date(data);
  if (Number.isNaN(d.getTime())) return "Sem data";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function renderizarAdminPagamentos(pagamentos = []) {
  const container = document.getElementById("listaAdminPagamentos");
  const contador = document.getElementById("contadorPagamentosAdmin");
  if (!container) return;

  const filtrados = pagamentos.filter(p => filtroPagamentosAdminAtual === "todos" || statusPagamentoAdmin(p) === filtroPagamentosAdminAtual);
  if (contador) contador.innerText = `${filtrados.length} pagamento(s)`;

  const aguardando = pagamentos.filter(p => statusPagamentoAdmin(p) === "aguardando").length;
  setAdminBadge("badgeAdminPagamentos", aguardando);

  if (!filtrados.length) {
    container.innerHTML = `<div class="admin-vazio admin-vazio-menor"><h3>Nenhum pagamento encontrado</h3><p>Quando profissionais gerarem Pix, eles aparecerão aqui.</p></div>`;
    return;
  }

  const grupos = filtrados.reduce((acc, p) => {
    const chave = chaveDataPagamentoAdmin(p);
    if (!acc[chave]) acc[chave] = [];
    acc[chave].push(p);
    return acc;
  }, {});

  container.innerHTML = Object.entries(grupos).map(([data, lista]) => {
    const totalDia = lista.reduce((soma, p) => soma + valorPagamentoNumero(p), 0);
    const aguardandoDia = lista.filter(p => statusPagamentoAdmin(p) === "aguardando").length;
    return `
      <section class="admin-pagamentos-dia">
        <div class="admin-pagamentos-dia-topo">
          <div><span>Pix gerados em</span><h3>${data}</h3></div>
          <small>${lista.length} registro(s) • ${formatarMoedaBR(totalDia)} • ${aguardandoDia} aguardando</small>
        </div>
        <div class="admin-pagamentos-dia-lista">
          ${lista.map(htmlAdminPagamentoCard).join("")}
        </div>
      </section>
    `;
  }).join("");
}

async function mostrarAdminPagamentos(profissionais = []) {
  try {
    pagamentosAdminCache = await buscarAdminPagamentos();
    renderizarResumoFinanceiroAdmin(pagamentosAdminCache, profissionais);
    renderizarAdminPagamentos(pagamentosAdminCache);
  } catch (error) {
    const container = document.getElementById("listaAdminPagamentos");
    if (container) container.innerHTML = `<div class="admin-vazio"><h3>Erro nos pagamentos</h3><p>${error.message}</p></div>`;
  }
}



async function buscarAdminIndicacoes() {
  return apiFetch("/api/admin/indicacoes", {
    headers: headersAdmin()
  });
}

function renderizarAdminIndicacoes(dados = {}) {
  const resumoBox = document.getElementById("adminIndicacoesResumo");
  const saquesBox = document.getElementById("listaAdminSaquesIndicacoes");
  const indicacoesBox = document.getElementById("listaAdminIndicacoes");
  const indicacoes = Array.isArray(dados.indicacoes) ? dados.indicacoes : [];
  const saques = Array.isArray(dados.saques) ? dados.saques : [];
  setAdminBadge("badgeAdminIndicacoes", saques.filter(s => s.status === "aguardando").length);

  if (resumoBox) {
    const disponivel = indicacoes.filter(i => i.status === "disponivel").reduce((s, i) => s + Number(i.valor_comissao || 0), 0);
    const pendente = indicacoes.filter(i => ["pendente_liberacao", "aguardando_aprovacao", "pendente"].includes(i.status)).reduce((s, i) => s + Number(i.valor_comissao || 0), 0);
    const pago = indicacoes.filter(i => i.status === "pago").reduce((s, i) => s + Number(i.valor_comissao || 0), 0);
    const aguardandoSaque = saques.filter(s => s.status === "aguardando");
    resumoBox.innerHTML = `
      <article class="finance-card destaque"><span>Saques aguardando</span><strong>${aguardandoSaque.length}</strong><small>Aprovação manual</small></article>
      <article class="finance-card"><span>Saldo disponível</span><strong>${formatarMoedaBR(disponivel)}</strong><small>Comissões liberadas</small></article>
      <article class="finance-card"><span>Pendente</span><strong>${formatarMoedaBR(pendente)}</strong><small>Liberação/aprovação</small></article>
      <article class="finance-card"><span>Pago</span><strong>${formatarMoedaBR(pago)}</strong><small>Comissões quitadas</small></article>
    `;
  }

  if (saquesBox) {
    const listaSaques = saques.slice(0, 50);
    saquesBox.innerHTML = listaSaques.length ? listaSaques.map(s => {
      const whatsapp = s.profissional_whatsapp || "";
      return `
        <article class="admin-pagamento-card status-${s.status === "pago" ? "pago" : s.status === "recusado" ? "expirado" : "aguardando"}">
          <div class="pagamento-card-topo">
            <div><span class="pagamento-status ${s.status === "pago" ? "pago" : "aguardando"}">${s.status}</span><h3>${s.profissional_nome || "Profissional"}</h3><p>${s.profissional_email || "E-mail não informado"}</p></div>
            <strong>${formatarMoedaBR(s.valor)}</strong>
          </div>
          <div class="pagamento-metricas">
            <p><span>Solicitado</span><strong>${formatarDataHoraCurta(s.solicitado_em)}</strong></p>
            <p><span>WhatsApp</span><strong>${whatsapp || "-"}</strong></p>
            <p><span>Tipo chave Pix</span><strong>${s.tipo_chave_pix || "Não informado"}</strong></p>
            <p><span>Chave Pix</span><strong>${s.chave_pix || "-"}</strong></p>
            <p><span>Titular</span><strong>${s.nome_titular || "-"}</strong></p>
            <p><span>CPF/CNPJ</span><strong>${s.cpf_cnpj_titular || "-"}</strong></p>
            <p><span>Saldo disponível</span><strong>${formatarMoedaBR(s.saldo_disponivel || s.valor || 0)}</strong></p>
            <p><span>Pago em</span><strong>${formatarDataHoraCurta(s.pago_em) || "-"}</strong></p>
          </div>
          <div class="pagamento-acoes">
            ${whatsapp ? `<a href="${criarLinkWhatsApp(whatsapp)}" target="_blank">WhatsApp</a>` : ""}
            ${s.status === "aguardando" ? `<button onclick="marcarSaqueIndicacaoPago(${s.id})">Marcar pago</button><button class="alerta" onclick="recusarSaqueIndicacao(${s.id})">Recusar</button>` : ""}
          </div>
        </article>
      `;
    }).join("") : `<div class="admin-vazio admin-vazio-menor"><h3>Nenhum saque solicitado</h3><p>Quando o profissional atingir R$ 100,00, ele poderá solicitar por aqui.</p></div>`;
  }

  if (indicacoesBox) {
    indicacoesBox.innerHTML = indicacoes.length ? indicacoes.slice(0, 80).map(i => `
      <article class="admin-avaliacao-card">
        <div class="admin-avaliacao-topo">
          <div><span class="admin-status status-${statusIndicacaoClasse(i.status)}">${i.status}</span><h3>${i.indicador_nome || "Indicador"} → ${i.indicado_nome || "Indicado"}</h3><p>Plano: ${i.plano_key || "-"} · Libera em: ${formatarDataIndicacao(i.liberado_em)}</p></div>
          <strong>${formatarMoedaBR(i.valor_comissao || 0)}</strong>
        </div>
        <p>${i.motivo || ""}</p>
      </article>
    `).join("") : `<div class="admin-vazio admin-vazio-menor"><h3>Nenhuma indicação registrada</h3><p>As indicações aparecerão após uso de link de convite.</p></div>`;
  }
}

async function mostrarAdminIndicacoes() {
  const container = document.getElementById("listaAdminSaquesIndicacoes");
  if (!container) return;
  try {
    indicacoesAdminCache = await buscarAdminIndicacoes();
    renderizarAdminIndicacoes(indicacoesAdminCache);
  } catch (error) {
    container.innerHTML = `<div class="admin-vazio"><h3>Erro nas indicações</h3><p>${error.message}</p></div>`;
  }
}

async function marcarSaqueIndicacaoPago(id) {
  const observacao = prompt("Observação do pagamento manual pela Efí (opcional):", "Pago manualmente pela Efí");
  try {
    await apiFetch(`/api/admin/indicacoes/saques/${id}/pagar`, {
      method: "PATCH",
      headers: headersAdmin(),
      body: JSON.stringify({ observacao })
    });
    alert("Saque marcado como pago.");
    mostrarAdminIndicacoes();
    mostrarAdminExclusoes();
  } catch (error) {
    alert(error.message);
  }
}

async function recusarSaqueIndicacao(id) {
  const observacao = prompt("Informe o motivo da recusa:", "Dados Pix incorretos ou revisão necessária");
  if (observacao === null) return;
  try {
    await apiFetch(`/api/admin/indicacoes/saques/${id}/recusar`, {
      method: "PATCH",
      headers: headersAdmin(),
      body: JSON.stringify({ observacao })
    });
    alert("Saque recusado e saldo devolvido.");
    mostrarAdminIndicacoes();
    mostrarAdminExclusoes();
  } catch (error) {
    alert(error.message);
  }
}

async function buscarAdminAvaliacoes(status = "pendente") {
  const urlPrincipal = `/api/admin/avaliacoes?status=${encodeURIComponent(status)}&_=${Date.now()}`;

  try {
    const dados = await apiFetch(urlPrincipal, {
      headers: headersAdmin()
    });

    if (Array.isArray(dados)) return dados;
    return [];
  } catch (erroPrincipal) {
    // Compatibilidade com deploys intermediários/rotas antigas.
    if (status === "pendente") {
      try {
        const dadosFallback = await apiFetch(`/api/admin/avaliacoes/pendentes?_=${Date.now()}`, {
          headers: headersAdmin()
        });
        return Array.isArray(dadosFallback) ? dadosFallback : [];
      } catch (_) {
        throw erroPrincipal;
      }
    }

    throw erroPrincipal;
  }
}

async function mostrarAdminAvaliacoes() {
  const container = document.getElementById("listaAdminAvaliacoes");
  const contador = document.getElementById("contadorAvaliacoesPendentes");
  if (!container) return;

  try {
    const avaliacoes = await buscarAdminAvaliacoes("pendente");
    const validas = (avaliacoes || [])
      .filter(item => item && item.id)
      .filter(item => String(item.status || "pendente").trim().toLowerCase() === "pendente");

    if (contador) contador.innerText = `${validas.length} pendente(s)`;
    setAdminBadge("badgeAdminAvaliacoes", validas.length);

    if (!validas || validas.length === 0) {
      container.innerHTML = `<div class="admin-vazio admin-vazio-menor"><h3>Nenhuma avaliação pendente</h3><p>Quando clientes enviarem avaliações, elas aparecerão aqui para aprovação.</p></div>`;
      return;
    }

    container.innerHTML = validas.map(item => {
      const idSeguro = String(item.id).replace(/"/g, "&quot;");

      return `
        <article class="admin-avaliacao-card" data-avaliacao-id="${idSeguro}">
          <div class="admin-avaliacao-topo">
            <div>
              <span>${item.profissionalNome || "Profissional"}</span>
              <h3>${item.nomeCliente || "Cliente"}</h3>
            </div>
            <strong>${estrelasHTML(item.nota)}</strong>
          </div>

          <p>${item.comentario || "Sem comentário."}</p>

          <small>
            ${item.profissionalProfissao || ""}
            ${item.profissionalCidade ? "• " + item.profissionalCidade : ""}
            ${item.criadoEm ? "• " + formatarDataCurta(item.criadoEm) : ""}
          </small>

          <div class="admin-avaliacao-acoes">
            <button class="aprovar" type="button" data-acao-avaliacao="aprovar" data-id="${idSeguro}">Aprovar</button>
            <button type="button" data-acao-avaliacao="recusar" data-id="${idSeguro}">Recusar</button>
            <button class="remover" type="button" data-acao-avaliacao="excluir" data-id="${idSeguro}">Excluir</button>
          </div>
        </article>
      `;
    }).join("");

    container.querySelectorAll("[data-acao-avaliacao]").forEach(botao => {
      botao.addEventListener("click", async () => {
        const id = botao.getAttribute("data-id");
        const acao = botao.getAttribute("data-acao-avaliacao");

        if (acao === "aprovar") return aprovarAvaliacao(id);
        if (acao === "recusar") return recusarAvaliacao(id);
        if (acao === "excluir") return excluirAvaliacao(id);
      });
    });
  } catch (error) {
    container.innerHTML = `<div class="admin-vazio"><h3>Erro nas avaliações</h3><p>${error.message}</p></div>`;
  }
}

function normalizarIdAvaliacao(id) {
  const idLimpo = String(id || "").trim();

  if (!idLimpo || idLimpo === "undefined" || idLimpo === "null") {
    alert("ID da avaliação inválido. Atualize o painel e tente novamente.");
    return "";
  }

  return idLimpo;
}

async function aprovarAvaliacao(id) {
  const idLimpo = normalizarIdAvaliacao(id);
  if (!idLimpo) return;

  try {
    await apiFetch(`/api/admin/avaliacoes/${encodeURIComponent(idLimpo)}/aprovar`, {
      method: "PATCH",
      headers: headersAdmin()
    });

    alert("Avaliação aprovada.");
    await mostrarAdminAvaliacoes();
    await mostrarAdmin();
  } catch (error) {
    alert(error.message);
    mostrarAdminAvaliacoes();
  }
}

async function recusarAvaliacao(id) {
  const idLimpo = normalizarIdAvaliacao(id);
  if (!idLimpo) return;

  try {
    await apiFetch(`/api/admin/avaliacoes/${encodeURIComponent(idLimpo)}/recusar`, {
      method: "PATCH",
      headers: headersAdmin()
    });

    alert("Avaliação recusada.");
    await mostrarAdminAvaliacoes();
  } catch (error) {
    alert(error.message);
    mostrarAdminAvaliacoes();
  }
}

async function excluirAvaliacao(id) {
  const idLimpo = normalizarIdAvaliacao(id);
  if (!idLimpo) return;
  if (!confirm("Excluir esta avaliação?")) return;

  try {
    await apiFetch(`/api/admin/avaliacoes/${encodeURIComponent(idLimpo)}`, {
      method: "DELETE",
      headers: headersAdmin()
    });

    alert("Avaliação excluída.");
    await mostrarAdminAvaliacoes();
    await mostrarAdmin();
  } catch (error) {
    alert(error.message);
    mostrarAdminAvaliacoes();
  }
}

async function carregarModuloAdminIsolado(modulo) {
  configurarPaginaAdminModular();

  if (modulo === "avaliacoes") {
    await mostrarAdminAvaliacoes();
    return true;
  }

  if (modulo === "indicacoes") {
    await mostrarAdminIndicacoes();
    return true;
  }

  if (modulo === "coletores") {
    await mostrarAdminColetores();
    return true;
  }

  if (modulo === "salaempreendedor") {
    const coletas = await buscarAdminCidadeColetas();
    renderizarAdminCidadeColetas(coletas);
    return true;
  }

  if (modulo === "lgpd") {
    await mostrarAdminExclusoes();
    return true;
  }

  if (modulo === "pagamentos") {
    const salvos = await buscarAdminProfissionais().catch(() => []);
    await mostrarAdminPagamentos(salvos);
    return true;
  }

  return false;
}

async function mostrarAdmin(opcoes = {}) {
  const container = document.getElementById("listaAdmin");
  const stats = document.getElementById("adminStats");
  const buscaInput = document.getElementById("adminBusca");
  if (!container) return;
  const silent = Boolean(opcoes && opcoes.silent);
  const moduloAtivo = moduloAdminAtualURL();

  try {
    if (!silent) mostrarLoading(moduloAtivo && ADMIN_MODULOS_INFO[moduloAtivo] ? `Carregando ${ADMIN_MODULOS_INFO[moduloAtivo].titulo}...` : "Carregando painel...");

    if (moduloAtivo && moduloAtivo !== "profissionais" && !opcoes.carregarCompleto) {
      await carregarModuloAdminIsolado(moduloAtivo);
      return;
    }

    const salvos = await buscarAdminProfissionais();
    profissionaisAdminCache = salvos;
    mostrarAdminAvaliacoes().catch(() => {});
    mostrarAdminPagamentos(salvos).catch(() => {});
    mostrarAdminIndicacoes().catch(() => {});
    mostrarAdminExclusoes().catch(() => {});
    mostrarAdminColetores().catch(() => {});
    buscarAdminCidadeColetas().then(renderizarAdminCidadeColetas).catch(() => renderizarAdminCidadeColetas([]));

    const pendentes = salvos.filter(p => p.status === "pendente").length;
    const aprovados = salvos.filter(p => p.status === "aprovado").length;
    const cidadesUnicas = new Set(salvos.map(p => normalizarTextoNorteServic(p.cidade)).filter(Boolean)).size;
    setAdminBadge("badgeAdminProfissionais", pendentes);

    if (stats) {
      stats.innerHTML = `
        <div class="admin-stat-card"><strong>${salvos.length}</strong><span>Cadastros recebidos</span></div>
        <div class="admin-stat-card"><strong>${pendentes}</strong><span>Aguardando aprovação</span></div>
        <div class="admin-stat-card"><strong>${aprovados}</strong><span>Perfis aprovados</span></div>
        <div class="admin-stat-card"><strong>${cidadesUnicas}</strong><span>Cidades cadastradas</span></div>
      `;
    }

    const termoBusca = buscaInput ? normalizarTextoNorteServic(buscaInput.value) : "";
    const listaFiltrada = salvos.filter(p => {
      const cidades = Array.isArray(p.cidadesAtendidas) ? p.cidadesAtendidas.join(" ") : "";
      const texto = normalizarTextoNorteServic(`${p.nome || ""} ${p.tipoProfissional || ""} ${p.categoria || ""} ${p.profissao || ""} ${p.cidade || ""} ${p.bairro || ""} ${cidades} ${p.formaAtendimento || ""} ${p.whatsapp || ""} ${p.instagram || ""} ${p.servicos || ""} ${p.status || ""}`);
      const passaBusca = termoBusca === "" || texto.includes(termoBusca);
      const passaStatus = filtroAdminAtual === "todos" || p.status === filtroAdminAtual;
      return passaBusca && passaStatus;
    });

    container.innerHTML = "";

    if (listaFiltrada.length === 0) {
      container.innerHTML = `<div class="admin-vazio"><h3>Nenhum resultado encontrado</h3><p>Tente ajustar a busca ou alterar o filtro.</p></div>`;
      return;
    }

    container.innerHTML = listaFiltrada.map((p, index) => {
      const inicial = p.nome ? p.nome.charAt(0).toUpperCase() : "?";
      const fotoCard = p.fotoPerfil ? `<img src="${p.fotoPerfil}" alt="Foto de ${p.nome}">` : `<span>${inicial}</span>`;
      const quantidadeFotos = Array.isArray(p.fotosTrabalhos) ? p.fotosTrabalhos.length : 0;
      const statusClasse = p.status === "aprovado" ? "status-aprovado" : "status-pendente";
      const statusTexto = p.status === "aprovado" ? "Aprovado" : "Pendente";
      const linkWhatsApp = criarLinkWhatsApp(p.whatsapp);
      const cidadesTexto = formatarCidadesAtendidas(p);

      return `
        <div class="admin-prof-card" style="animation-delay: ${index * 0.04}s">
          <div class="admin-prof-foto">${fotoCard}</div>
          <div class="admin-prof-info">
            <span class="admin-status ${statusClasse}">${statusTexto}</span>
            <h3 class="nome-profissional-linha admin-nome"><span>${p.nome}</span>${seloVerificadoPlanoHTML(p, "admin")}</h3>
            <p class="profissao">${p.profissao}</p>
            <p><strong>Tipo:</strong> ${p.tipoProfissional || "Não informado"}</p>
            <p><strong>Categoria:</strong> ${p.categoria || "Não informada"}</p>
            <p><strong>Cidade principal:</strong> ${p.cidade} - ${p.bairro}</p>
            <p><strong>Atende:</strong> ${cidadesTexto}</p>
            <p><strong>Forma de atendimento:</strong> ${p.formaAtendimento || "Não informada"}</p>
            <p><strong>WhatsApp:</strong> ${p.whatsapp}</p>
            <p><strong>Instagram:</strong> ${p.instagram || "Não informado"}</p>
            <p><strong>Serviços:</strong> ${p.servicos}</p>
            <p><strong>Descrição:</strong> ${p.descricao}</p>
            <p><strong>Plano:</strong> ${p.planoAtual || "Gratuito"}</p>
            <div class="admin-tags">
              <span>${quantidadeFotos} foto(s)</span>
              <span>${p.verificado ? "Verificado" : "Não verificado"}</span>
              <span>${p.status === "aprovado" ? "Publicado" : "Em análise"}</span>
            </div>
          </div>
          <div class="admin-acoes">
            <button class="aprovar" onclick="aprovarProfissional(${p.id})">Aprovar</button>
            <button onclick="editarProfissionalAdmin(${p.id})">Editar</button>
            <a class="ver-whatsapp" href="${linkWhatsApp}" target="_blank">WhatsApp</a>
            <button onclick="atualizarPlanoAdmin(${p.id})">Plano</button>
            <button class="senha" onclick="redefinirSenhaAdmin(${p.id})">Senha</button>
            <button class="remover" onclick="removerProfissional(${p.id})">Remover</button>
          </div>
        </div>
      `;
    }).join("");
  } catch (error) {
    const msgErro = String(error.message || "");
    container.innerHTML = `<div class="admin-vazio"><h3>Erro no painel</h3><p>${msgErro}</p></div>`;
    if (/senha|admin|unauthorized|não autoriz/i.test(msgErro)) {
      removerAdminPassword();
      document.body.classList.remove("admin-dashboard-ativo", "admin-menu-aberto");
      delete document.body.dataset.adminModulo;
      const loginAdmin = document.getElementById("loginAdmin");
      const painelAdmin = document.getElementById("painelAdmin");
      if (loginAdmin) loginAdmin.classList.remove("escondido");
      if (painelAdmin) painelAdmin.classList.add("escondido");
      const erro = document.getElementById("erroSenha");
      if (erro) erro.innerText = "Senha expirada ou incorreta. Entre novamente.";
    }
  } finally {
    if (!silent) esconderLoading();
  }
}


function obterProfissionalAdmin(id) {
  return profissionaisAdminCache.find(p => Number(p.id) === Number(id)) || null;
}

async function editarProfissionalAdmin(id) {
  const p = obterProfissionalAdmin(id);
  if (!p) {
    alert('Profissional não encontrado no painel. Atualize a lista e tente novamente.');
    return;
  }

  const campos = {
    nome: prompt('Nome do profissional:', p.nome || '') ?? p.nome,
    profissao: prompt('Profissão:', p.profissao || '') ?? p.profissao,
    categoria: prompt('Categoria:', p.categoria || '') ?? p.categoria,
    servicos: prompt('Serviços principais:', p.servicos || '') ?? p.servicos,
    cidade: prompt('Cidade:', p.cidade || '') ?? p.cidade,
    bairro: prompt('Bairro / setor:', p.bairro || '') ?? p.bairro,
    whatsapp: prompt('WhatsApp:', p.whatsapp || '') ?? p.whatsapp,
    instagram: prompt('Instagram:', p.instagram || '') ?? p.instagram,
    descricao: prompt('Descrição do perfil:', p.descricao || '') ?? p.descricao,
    formaAtendimento: prompt('Forma de atendimento:', p.formaAtendimento || 'Presencial') ?? p.formaAtendimento
  };

  if (!campos.nome || !campos.profissao) {
    alert('Nome e profissão são obrigatórios.');
    return;
  }

  try {
    mostrarLoading('Salvando edição do profissional...');
    const resposta = await apiFetch(`/api/admin/profissionais/${id}`, {
      method: 'PATCH',
      headers: headersAdmin(),
      body: JSON.stringify(campos)
    });
    alert(resposta.mensagem || 'Perfil atualizado.');
    mostrarAdmin({ silent: true, carregarCompleto: true });
  } catch (error) {
    alert(error.message || 'Erro ao editar perfil.');
  } finally {
    esconderLoading();
  }
}

function rotuloNecessidadeEmpreendedor(valor) {
  const mapa = {
    abrir_mei: 'Abrir MEI',
    emitir_nota: 'Emitir nota fiscal',
    pagar_das: 'Pagar DAS',
    declaracao_anual: 'Declaração anual',
    vender_prefeitura: 'Vender para prefeitura',
    curso_capacitacao: 'Curso/capacitação',
    divulgacao: 'Divulgação',
    precificacao: 'Precificação'
  };
  return mapa[valor] || valor || 'Não informado';
}

function mensagemSalaEmpreendedorAdmin(item) {
  return encodeURIComponent(`Olá ${item.nome || ''}! Aqui é da Norte Servic. Seu cadastro foi mapeado no projeto Cidade Parceira.\n\nA Sala do Empreendedor pode orientar sobre MEI, nota fiscal, cursos, divulgação e crescimento do seu serviço.\n\nPodemos encaminhar seu atendimento para a equipe responsável?`);
}

function pdfTextoSeguro(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function pdfLinha(texto, x, y, tamanho = 10, cor = '15 23 42', negrito = false) {
  const [r, g, b] = cor.split(' ').map(n => (Number(n) / 255).toFixed(3));
  return `BT ${r} ${g} ${b} rg /${negrito ? 'F2' : 'F1'} ${tamanho} Tf 1 0 0 1 ${x} ${y} Tm (${pdfTextoSeguro(texto)}) Tj ET`;
}

function pdfRetangulo(x, y, w, h, cor = '255 255 255') {
  const [r, g, b] = cor.split(' ').map(n => (Number(n) / 255).toFixed(3));
  return `q ${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re f Q`;
}

function pdfBaixar(nomeArquivo, paginasConteudo) {
  const objetos = [];
  function add(obj) { objetos.push(obj); return objetos.length; }

  const catalogId = add('');
  const pagesId = add('');
  const fontRegularId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fontBoldId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  const pageIds = [];
  paginasConteudo.forEach(conteudo => {
    const stream = conteudo.join('\n');
    const contentId = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageId = add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });

  objetos[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objetos[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objetos.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objetos.length; i++) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo.endsWith('.pdf') ? nomeArquivo : `${nomeArquivo}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}



async function aprovarProfissional(id) {
  try {
    await apiFetch(`/api/admin/profissionais/${id}/aprovar`, {
      method: "PATCH",
      headers: headersAdmin()
    });
    alert("Profissional aprovado com sucesso!");
    mostrarAdmin();
  } catch (error) {
    alert(error.message);
  }
}

async function removerProfissional(id) {
  if (!confirm("Tem certeza que deseja remover este cadastro?")) return;

  try {
    await apiFetch(`/api/admin/profissionais/${id}`, {
      method: "DELETE",
      headers: headersAdmin()
    });
    alert("Cadastro removido.");
    mostrarAdmin();
  } catch (error) {
    alert(error.message);
  }
}


async function redefinirSenhaAdmin(id) {
  const sugestao = `NS${Math.floor(100000 + Math.random() * 900000)}`;
  const novaSenha = prompt(
    "Digite a nova senha temporária para este profissional.\n\nDica: envie essa senha pelo WhatsApp e oriente o profissional a trocar depois no painel.",
    sugestao
  );

  if (!novaSenha) return;

  if (String(novaSenha).trim().length < 6) {
    alert("A senha precisa ter pelo menos 6 caracteres.");
    return;
  }

  try {
    const resposta = await apiFetch(`/api/admin/profissionais/${id}/senha`, {
      method: "PATCH",
      headers: headersAdmin(),
      body: JSON.stringify({ senha: String(novaSenha).trim() })
    });

    const nome = resposta?.profissional?.nome || "profissional";
    const mensagem = `Senha redefinida com sucesso para ${nome}.\n\nSenha temporária: ${String(novaSenha).trim()}\n\nEnvie essa senha ao profissional e peça para ele alterar depois na Área Profissional.`;

    try {
      await navigator.clipboard.writeText(`Olá! Sua senha temporária da Norte Servic é: ${String(novaSenha).trim()}\n\nEntre na Área Profissional e altere sua senha depois.`);
      alert(`${mensagem}\n\nMensagem copiada para você colar no WhatsApp.`);
    } catch (_) {
      alert(mensagem);
    }
  } catch (error) {
    alert(error.message);
  }
}

async function atualizarPlanoAdmin(id) {
  const planoAtual = prompt("Digite o plano: Gratuito, Destaque, Profissional ou Premium", "Destaque");
  if (!planoAtual) return;

  const planoStatus = prompt("Status do plano:", "ativo") || "ativo";
  const planoVencimento = prompt("Vencimento do plano (opcional, formato 2026-07-04):", "") || null;

  try {
    await apiFetch(`/api/admin/profissionais/${id}/plano`, {
      method: "PATCH",
      headers: headersAdmin(),
      body: JSON.stringify({ planoAtual, planoStatus, planoVencimento })
    });
    alert("Plano atualizado.");
    mostrarAdmin();
  } catch (error) {
    alert(error.message);
  }
}

/* ================================================= */
