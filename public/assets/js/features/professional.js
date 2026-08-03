'use strict';

/* LOGIN E PAINEL PROFISSIONAL */
/* ================================================= */

function iniciarLoginProfissional() {
  const form = document.getElementById("formLoginProfissional");
  if (!form) return;

  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const mensagem = document.getElementById("mensagemLoginProfissional");
    const whatsapp = limparNumero(document.getElementById("loginWhatsapp")?.value || "");
    const senha = document.getElementById("loginSenha")?.value.trim() || "";
    const botao = form.querySelector("button");
    const textoOriginal = botao ? botao.innerText : "";

    try {
      if (botao) {
        botao.innerText = "Entrando...";
        botao.disabled = true;
      }
      mostrarLoading("Entrando...");

      const dados = await apiFetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ whatsapp, senha })
      });

      setTokenProfissional(dados.token);
      const paramsLogin = new URLSearchParams(window.location.search);
      const voltar = paramsLogin.get("voltar");
      window.location.href = voltar === "planos" ? "/planos?origem=login" : "/painel-profissional";
    } catch (error) {
      if (mensagem) mensagem.innerText = error.message;
    } finally {
      esconderLoading();
      if (botao) {
        botao.innerText = textoOriginal;
        botao.disabled = false;
      }
    }
  });
}

async function carregarMinhaConta() {
  const token = getTokenProfissional();
  if (!token) throw new Error("Login necessário.");

  return apiFetch("/api/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

function sairProfissional() {
  removerTokenProfissional();
  window.location.href = "/login";
}

function exigirLoginRedirect() {
  if (!getTokenProfissional()) {
    window.location.href = "/login";
    return false;
  }
  return true;
}


async function carregarMinhasIndicacoes() {
  const token = getTokenProfissional();
  if (!token) throw new Error("Login necessário.");
  return apiFetch("/api/me/indicacoes", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

async function copiarTextoNorteServic(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    alert("Link copiado com sucesso.");
  } catch (_) {
    prompt("Copie seu link de indicação:", texto);
  }
}


function valorCampoSeguroIndicacao(valor = '') {
  return String(valor || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function salvarDadosPixIndicacao() {
  const chavePix = document.getElementById("indicacaoChavePix")?.value.trim() || "";
  const tipoChavePix = document.getElementById("indicacaoTipoChavePix")?.value.trim() || "";
  const nomeTitular = document.getElementById("indicacaoNomeTitular")?.value.trim() || "";
  const cpfCnpjTitular = document.getElementById("indicacaoCpfCnpjTitular")?.value.trim() || "";

  if (!tipoChavePix || !chavePix || !nomeTitular || !cpfCnpjTitular) {
    alert("Preencha todos os dados Pix para salvar: tipo de chave, chave Pix, nome do titular e CPF/CNPJ.");
    return;
  }

  try {
    await apiFetch("/api/me/indicacoes/dados-pix", {
      method: "POST",
      headers: headersAuth(),
      body: JSON.stringify({ chavePix, tipoChavePix, nomeTitular, cpfCnpjTitular })
    });
    alert("Dados Pix salvos com sucesso. O saque será liberado quando seu saldo disponível atingir R$ 100,00.");
    const dados = await carregarMinhasIndicacoes();
    renderizarPainelIndicacoes(dados);
  } catch (error) {
    alert(error.message);
  }
}

async function solicitarSaqueIndicacao() {
  const chavePix = document.getElementById("indicacaoChavePix")?.value.trim() || "";
  const tipoChavePix = document.getElementById("indicacaoTipoChavePix")?.value.trim() || "";
  const nomeTitular = document.getElementById("indicacaoNomeTitular")?.value.trim() || "";
  const cpfCnpjTitular = document.getElementById("indicacaoCpfCnpjTitular")?.value.trim() || "";

  if (!tipoChavePix || !chavePix || !nomeTitular || !cpfCnpjTitular) {
    alert("Preencha todos os dados para saque: tipo de chave, chave Pix, nome do titular e CPF/CNPJ.");
    return;
  }

  if (!confirm("Enviar solicitação de saque para análise do administrador?")) return;

  try {
    await apiFetch("/api/me/indicacoes/saques", {
      method: "POST",
      headers: headersAuth(),
      body: JSON.stringify({ chavePix, tipoChavePix, nomeTitular, cpfCnpjTitular })
    });
    alert("Solicitação de saque enviada para análise do admin.");
    const dados = await carregarMinhasIndicacoes();
    renderizarPainelIndicacoes(dados);
  } catch (error) {
    alert(error.message);
  }
}

function renderizarPainelIndicacoes(dados) {
  const box = document.getElementById("painelIndicacoesProfissional");
  if (!box) return;

  const resumo = dados.resumo || {};
  const saldoDisponivel = Number(resumo.saldoDisponivel || 0);
  const saqueMinimo = Number(dados.saqueMinimo || 100);
  const podeSacar = saldoDisponivel >= saqueMinimo;
  const indicacoes = Array.isArray(dados.indicacoes) ? dados.indicacoes.slice(0, 8) : [];
  const saques = Array.isArray(dados.saques) ? dados.saques.slice(0, 5) : [];
  const pix = dados.dadosPix || {};
  const tipoPix = String(pix.tipoChavePix || "");
  const chavePix = valorCampoSeguroIndicacao(pix.chavePix || "");
  const nomeTitular = valorCampoSeguroIndicacao(pix.nomeTitular || "");
  const cpfCnpjTitular = valorCampoSeguroIndicacao(pix.cpfCnpjTitular || "");
  const selecionarTipo = (tipo) => tipoPix === tipo ? "selected" : "";

  box.innerHTML = `
    <div class="indicacoes-topo">
      <span class="painel-box-badge">Programa de indicação</span>
      <h3>Minhas indicações</h3>
      <p>Ganhe <strong>${formatarMoedaIndicacao(dados.comissaoPorIndicacao || 10)}</strong> quando seu indicado assinar o Plano Premium de R$ 39,90. A comissão libera após ${dados.diasLiberacao || 5} dias.</p>
    </div>

    <div class="indicacoes-link-box">
      <small>Seu link exclusivo de indicação</small>
      <div>
        <input type="text" value="${valorCampoSeguroIndicacao(dados.link || "")}" readonly>
        <button type="button" onclick="copiarTextoNorteServic('${String(dados.link || "").replace(/'/g, "\\'")}')">Copiar</button>
      </div>
      <span>Código: ${dados.codigo || "-"}</span>
    </div>

    <div class="indicacoes-stats">
      <article><strong>${resumo.totalIndicacoes || 0}</strong><span>Total de indicados</span></article>
      <article><strong>${resumo.assinaturasConfirmadas || 0}</strong><span>Assinaturas confirmadas</span></article>
      <article><strong>${formatarMoedaIndicacao(saldoDisponivel)}</strong><span>Saldo disponível</span></article>
      <article><strong>${formatarMoedaIndicacao(resumo.saldoPendente || 0)}</strong><span>Comissão pendente</span></article>
    </div>

    <div class="indicacoes-saque-box indicacoes-saque-box-completo">
      <div class="indicacoes-saque-head">
        <strong>Dados Pix para saque</strong>
        <span>Cadastre seus dados agora. O saque só libera quando o saldo disponível atingir ${formatarMoedaIndicacao(saqueMinimo)}.</span>
      </div>
      <div class="indicacoes-saque-status ${podeSacar ? "liberado" : "bloqueado"}">
        ${podeSacar ? "Você já pode solicitar saque." : `Faltam ${formatarMoedaIndicacao(Math.max(0, saqueMinimo - saldoDisponivel))} para liberar saque.`}
      </div>
      <div class="indicacoes-saque-form">
        <label>Tipo de Chave Pix
          <select id="indicacaoTipoChavePix">
            <option value="">Selecione</option>
            <option value="cpf" ${selecionarTipo("cpf")}>CPF</option>
            <option value="cnpj" ${selecionarTipo("cnpj")}>CNPJ</option>
            <option value="email" ${selecionarTipo("email")}>E-mail</option>
            <option value="telefone" ${selecionarTipo("telefone")}>Telefone</option>
            <option value="aleatoria" ${selecionarTipo("aleatoria")}>Chave aleatória</option>
          </select>
        </label>
        <label>Chave Pix
          <input id="indicacaoChavePix" type="text" placeholder="Digite sua chave Pix" value="${chavePix}">
        </label>
        <label>Nome do Titular
          <input id="indicacaoNomeTitular" type="text" placeholder="Nome do titular da chave" value="${nomeTitular}">
        </label>
        <label>CPF/CNPJ do Titular
          <input id="indicacaoCpfCnpjTitular" type="text" placeholder="CPF ou CNPJ do titular" value="${cpfCnpjTitular}">
        </label>
      </div>
      <p>A chave Pix deve pertencer ao profissional cadastrado ou responsável informado.</p>
      <div class="indicacoes-saque-acoes">
        <button type="button" class="btn-salvar-pix-indicacao" onclick="salvarDadosPixIndicacao()">Salvar dados Pix</button>
        <button type="button" ${podeSacar ? "" : "disabled"} onclick="solicitarSaqueIndicacao()">Solicitar saque</button>
      </div>
    </div>

    <div class="indicacoes-lista">
      <h4>Histórico de comissões</h4>
      ${indicacoes.length ? indicacoes.map(item => `
        <div class="indicacao-item">
          <div>
            <strong>${item.indicadoNome || "Profissional indicado"}</strong>
            <span>${item.statusLabel || item.status || "Pendente"} · ${formatarDataIndicacao(item.criadoEm)}</span>
          </div>
          <b class="status-${statusIndicacaoClasse(item.status)}">${formatarMoedaIndicacao(item.valorComissao || 0)}</b>
        </div>
      `).join("") : `<p class="indicacoes-vazio">Compartilhe seu link para começar a indicar.</p>`}
    </div>

    ${saques.length ? `<div class="indicacoes-lista"><h4>Saques recentes</h4>${saques.map(s => `<div class="indicacao-item"><div><strong>${formatarMoedaIndicacao(s.valor)}</strong><span>${s.status} · ${formatarDataIndicacao(s.solicitado_em)}</span></div><b>${s.chave_pix || ""}</b></div>`).join("")}</div>` : ""}
  `;
}

async function carregarPainelProfissional() {
  const header = document.getElementById("painelProfissionalHeader");
  const resumo = document.getElementById("painelResumoProfissional");
  const status = document.getElementById("painelStatusProfissional");
  const linkPerfil = document.getElementById("linkPerfilPublico");
  const painelPlano = document.getElementById("painelPlanoProfissional");
  const painelDicas = document.getElementById("painelDicasProfissional");
  const painelIndicacoes = document.getElementById("painelIndicacoesProfissional");

  if (!header || !resumo || !status) return;
  if (!exigirLoginRedirect()) return;

  try {
    const profissional = await carregarMinhaConta();
    const cidadesTexto = formatarCidadesAtendidas(profissional);
    const perfilDisponivel = profissional.status === "aprovado";
    const planoAtual = profissional.planoAtual || "Gratuito";
    const planoStatus = profissional.planoStatus || "ativo";
    const forcaPerfil = calcularForcaPerfil(profissional);
    const totalServicos = (profissional.servicos || "").split(",").map(s => s.trim()).filter(Boolean).length;
    const foto = profissional.fotoPerfil ? `<img src="${profissional.fotoPerfil}" alt="Foto de ${profissional.nome}">` : `<span>${profissional.nome ? profissional.nome.charAt(0).toUpperCase() : "?"}</span>`;

    header.innerHTML = `<span>Painel do profissional</span><h1>Olá, ${profissional.nome}.</h1><p>Gerencie sua conta e acompanhe seu perfil na Norte Servic.</p>`;

    resumo.innerHTML = `
      <div class="painel-foto-profissional">${foto}</div>
      <div class="painel-card-conteudo-premium">
        <span class="admin-status ${perfilDisponivel ? "status-aprovado" : "status-pendente"}">${perfilDisponivel ? "Perfil publicado" : "Aguardando aprovação"}</span>
        <h2 class="nome-profissional-linha painel-nome"><span>${profissional.nome}</span>${seloVerificadoPlanoHTML(profissional, "painel")}</h2>
        <p class="profissao">${profissional.profissao || "Profissão não informada"}</p>
        <div class="painel-chip-row">
          <span>${profissional.categoria || "Categoria não informada"}</span>
          <span>${profissional.tipoProfissional || "Tipo não informado"}</span>
          <span>${profissional.formaAtendimento || "Atendimento não informado"}</span>
        </div>
        <div class="painel-info-lista">
          <p><strong>Atende:</strong> ${cidadesTexto}</p>
          <p><strong>WhatsApp:</strong> ${profissional.whatsapp || "Não informado"}</p>
          <p><strong>Serviços selecionados:</strong> ${totalServicos}</p>
          <p class="painel-linha-plano"><strong>Plano:</strong> <span class="painel-plano-chip destaque">${planoAtual}</span></p>
        </div>
        <p class="painel-descricao-preview">${profissional.descricao || "Adicione uma descrição profissional para aumentar a confiança dos clientes."}</p>
      </div>
    `;

    status.innerHTML = `
      <div class="admin-stat-card admin-stat-destaque plano-card"><strong>${planoAtual}</strong><span>Plano atual</span></div>
      <div class="admin-stat-card admin-stat-destaque status-card"><strong>${String(planoStatus).toUpperCase()}</strong><span>Status do plano</span></div>
      <div class="admin-stat-card"><strong>${perfilDisponivel ? "Sim" : "Não"}</strong><span>Perfil publicado</span></div>
      <div class="admin-stat-card"><strong>${forcaPerfil}%</strong><span>Força do perfil</span></div>
    `;

    if (painelPlano) {
      painelPlano.innerHTML = `
        <span class="painel-box-badge">Plano ativo</span>
        <h3>${planoAtual}</h3>
        <p>Status: <strong>${planoStatus}</strong> · Força do perfil: <strong>${forcaPerfil}%</strong>.</p>
        <div class="painel-forca-perfil"><div style="width: ${forcaPerfil}%"></div></div>
        <a href="/planos?origem=painel" class="painel-plano-cta">Ver planos</a>
      `;
    }

    if (painelDicas) {
      painelDicas.innerHTML = `
        <span class="painel-box-badge">Ajustes rápidos</span>
        <h3>Melhore seu perfil</h3>
        <div class="painel-dicas-compactas">
          <span>Foto real</span>
          <span>Serviços corretos</span>
          <span>Cidades atualizadas</span>
          <span>WhatsApp ativo</span>
        </div>
      `;
    }

    if (painelIndicacoes) {
      try {
        const dadosIndicacoes = await carregarMinhasIndicacoes();
        renderizarPainelIndicacoes(dadosIndicacoes);
      } catch (erroIndicacoes) {
        painelIndicacoes.innerHTML = `<span class="painel-box-badge">Programa de indicação</span><h3>Indicações indisponíveis</h3><p>${erroIndicacoes.message}</p>`;
      }
    }

    if (linkPerfil) {
      if (perfilDisponivel) {
        linkPerfil.href = `/perfil?id=${profissional.id}`;
      } else {
        linkPerfil.href = "#";
        linkPerfil.addEventListener("click", e => {
          e.preventDefault();
          alert("Seu perfil ainda está aguardando aprovação.");
        });
      }
    }
  } catch (error) {
    removerTokenProfissional();
    window.location.href = "/login";
  }
}

/* ================================================= */
/* EDITAR PERFIL */
/* ================================================= */

async function preencherFormularioEdicao(profissional) {
  const setValue = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.value = valor || "";
  };

  setValue("nome", profissional.nome);
  setValue("tipoProfissional", profissional.tipoProfissional);
  setValue("cidade", profissional.cidade);
  setValue("bairro", profissional.bairro);
  setValue("atendeOutrasCidades", profissional.atendeOutrasCidades);
  setValue("formaAtendimento", profissional.formaAtendimento);
  setValue("whatsapp", profissional.whatsapp);
  setValue("instagram", profissional.instagram);
  setValue("descricao", profissional.descricao);

  const categoria = document.getElementById("categoria");
  const profissao = document.getElementById("profissao");

  if (categoria) {
    categoria.value = profissional.categoria || "";
    preencherProfissoesDaCategoria();
  }

  if (profissao) {
    profissao.value = profissional.profissao || "";
    carregarServicosDaProfissao();
  }

  servicosSelecionadosCadastro = (profissional.servicos || "").split(",").map(s => s.trim()).filter(Boolean);
  atualizarInputServicosSelecionados();

  document.querySelectorAll(".servico-tag-opcao").forEach(botao => {
    const texto = botao.innerText.trim();
    if (servicosSelecionadosCadastro.some(item => normalizarTextoNorteServic(item) === normalizarTextoNorteServic(texto))) {
      botao.classList.add("ativo");
    }
  });

  cidadesSelecionadasCadastro = Array.isArray(profissional.cidadesAtendidas)
    ? profissional.cidadesAtendidas.filter(cidade => normalizarTextoNorteServic(cidade) !== normalizarTextoNorteServic(profissional.cidade))
    : [];

  fotosTrabalhosEdicaoAtuais = Array.isArray(profissional.fotosTrabalhos)
    ? profissional.fotosTrabalhos.slice(0, limiteFotosPorPlano(profissional))
    : [];

  renderizarPreviewImagensEdicao(profissional);

  alternarCidadesAtendidas();
  adicionarAdminNoRodape();
  atualizarCidadesSelecionadasVisual();
}


function renderizarPreviewImagensEdicao(profissional = {}) {
  const preview = document.getElementById("previewImagensEdicao");
  if (!preview) return;

  const fotoPerfilHtml = profissional.fotoPerfil
    ? `<img src="${profissional.fotoPerfil}" alt="Foto atual do perfil" loading="lazy" decoding="async">`
    : `<span>Sem foto de perfil</span>`;

  const fotos = Array.isArray(fotosTrabalhosEdicaoAtuais) ? fotosTrabalhosEdicaoAtuais : [];

  preview.innerHTML = `
    <div class="preview-foto-atual">
      <strong>Foto atual do perfil</strong>
      ${fotoPerfilHtml}
    </div>

    <div class="preview-trabalhos-atual">
      <strong>Fotos atuais dos serviços</strong>
      ${fotos.length ? fotos.map((foto, index) => `
        <div class="foto-servico-editavel">
          <img src="${foto}" alt="Foto de serviço atual" loading="lazy" decoding="async">
          <button type="button" onclick="removerFotoTrabalhoEdicao(${index})">Remover</button>
        </div>
      `).join("") : `<span>Nenhuma foto de serviço adicionada.</span>`}
    </div>
  `;
}

function removerFotoTrabalhoEdicao(index) {
  fotosTrabalhosEdicaoAtuais = fotosTrabalhosEdicaoAtuais.filter((_, i) => i !== index);
  renderizarPreviewImagensEdicao(profissionalAtualEdicaoGlobal || {});
}

let profissionalAtualEdicaoGlobal = null;

function iniciarEditarPerfil() {
  const form = document.getElementById("formEditarPerfil");
  if (!form) return;

  if (!exigirLoginRedirect()) return;

  let profissionalAtual = null;

  carregarMinhaConta()
    .then(profissional => {
      profissionalAtual = profissional;
      profissionalAtualEdicaoGlobal = profissional;
      preencherFormularioEdicao(profissional);
    })
    .catch(() => {
      removerTokenProfissional();
      window.location.href = "/login";
    });

  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const mensagem = document.getElementById("mensagemEditarPerfil");
    const novaSenha = document.getElementById("novaSenhaPerfil")?.value.trim() || "";
    const confirmarSenha = document.getElementById("confirmarNovaSenhaPerfil")?.value.trim() || "";
    const servicos = document.getElementById("servicos")?.value.trim() || "";
    const botao = form.querySelector("button[type='submit']") || form.querySelector("button");
    const textoOriginal = botao ? botao.innerText : "";

    if (!servicos) {
      if (mensagem) mensagem.innerText = "Selecione pelo menos um serviço.";
      return;
    }

    if (novaSenha || confirmarSenha) {
      if (novaSenha.length < 6) {
        if (mensagem) mensagem.innerText = "A nova senha precisa ter pelo menos 6 caracteres.";
        return;
      }
      if (novaSenha !== confirmarSenha) {
        if (mensagem) mensagem.innerText = "As novas senhas não conferem.";
        return;
      }
    }

    try {
      if (botao) {
        botao.innerText = "Salvando...";
        botao.disabled = true;
      }
      mostrarLoading("Salvando alterações...");

      const dados = dadosFormularioProfissional(false);
      dados.servicos = servicos;
      dados.senha = novaSenha || undefined;

      const arquivoFotoPerfil = document.getElementById("fotoPerfilEditar")?.files[0];
      const arquivosTrabalhos = document.getElementById("fotosTrabalhosEditar")?.files;
      const fotosAtuais = Array.isArray(fotosTrabalhosEdicaoAtuais) ? fotosTrabalhosEdicaoAtuais : [];
      const limiteFotos = limiteFotosPorPlano(profissionalAtual || {});

      await validarFotoPerfil1000(arquivoFotoPerfil, false);

      dados.fotoPerfil = arquivoFotoPerfil
        ? await converterImagemParaBase64(arquivoFotoPerfil, { maxSize: 700, qualidade: 0.82, exigirQuadrada: true })
        : (profissionalAtual?.fotoPerfil || "");

      const novasFotosTrabalho = await converterVariasImagensParaBase64(arquivosTrabalhos);
      dados.fotosTrabalhos = novasFotosTrabalho.length
        ? [...fotosAtuais, ...novasFotosTrabalho].slice(0, limiteFotos)
        : fotosAtuais;

      await apiFetch("/api/me", {
        method: "PUT",
        headers: { Authorization: `Bearer ${getTokenProfissional()}` },
        body: JSON.stringify(dados)
      });

      if (mensagem) mensagem.innerText = "Alterações salvas. Se dados importantes mudaram, seu perfil voltou para análise.";
      setTimeout(() => window.location.href = "/painel-profissional", 900);
    } catch (error) {
      if (mensagem) mensagem.innerText = error.message;
    } finally {
      esconderLoading();
      if (botao) {
        botao.innerText = textoOriginal;
        botao.disabled = false;
      }
    }
  });
}

/* ================================================= */
