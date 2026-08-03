'use strict';

/* BUSCA INTELIGENTE */
/* ================================================= */

function pegarTodasSugestoesNorteServic() {
  const sugestoes = [];

  baseProfissoesNorteServic.forEach(item => {
    sugestoes.push({ nome: item.categoria, tipo: "Categoria" });
    item.profissoes.forEach(profissao => sugestoes.push({ nome: profissao, tipo: item.categoria }));
    item.palavras.forEach(palavra => sugestoes.push({ nome: palavra, tipo: item.categoria }));
  });

  const controle = new Set();
  return sugestoes.filter(item => {
    const chave = normalizarTextoNorteServic(item.nome);
    if (controle.has(chave)) return false;
    controle.add(chave);
    return true;
  });
}

function iniciarBuscaInteligente() {
  const campo = document.getElementById("campoBusca");
  const caixa = document.getElementById("sugestoesBusca");
  if (!campo || !caixa) return;

  campo.addEventListener("input", function() {
    const termo = normalizarTextoNorteServic(campo.value);
    caixa.innerHTML = "";

    if (termo.length < 1) {
      caixa.classList.remove("ativo");
      return;
    }

    const sugestoes = pegarTodasSugestoesNorteServic()
      .filter(item => normalizarTextoNorteServic(item.nome).includes(termo))
      .slice(0, 7);

    if (sugestoes.length === 0) {
      caixa.classList.remove("ativo");
      return;
    }

    sugestoes.forEach(item => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "sugestao-item";
      botao.innerHTML = `<span>${item.nome}</span><small>${item.tipo}</small>`;
      botao.addEventListener("click", () => selecionarSugestaoBusca(item.nome));
      caixa.appendChild(botao);
    });

    caixa.classList.add("ativo");
  });

  campo.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      caixa.classList.remove("ativo");
      buscarProfissionais();
    }
    if (e.key === "Escape") caixa.classList.remove("ativo");
  });

  document.addEventListener("click", function(e) {
    if (!e.target.closest(".busca-inteligente-area")) caixa.classList.remove("ativo");
  });
}

function selecionarSugestaoBusca(valor) {
  const campo = document.getElementById("campoBusca");
  const caixa = document.getElementById("sugestoesBusca");
  if (!campo) return;

  campo.value = valor;
  if (caixa) {
    caixa.classList.remove("ativo");
    caixa.innerHTML = "";
  }
  buscarProfissionais();
}

/* ================================================= */
/* HOME / PROFISSIONAIS */
/* ================================================= */

function cardProfissionalHTML(p, index = 0) {
  const inicial = p.nome ? p.nome.charAt(0).toUpperCase() : "?";
  const fotoCard = p.fotoPerfil
    ? `<img src="${p.fotoPerfil}" alt="Foto de ${p.nome}">`
    : `<span aria-hidden="true">${inicial}</span>`;
  const temPlano = profissionalTemPlanoPago(p);
  const planoTexto = temPlano ? `Plano ${p.planoAtual || seloPlanoTexto(p)}` : (p.verificado ? "Perfil verificado" : "Ver perfil completo");
  const avaliacao = p.avaliacao ? String(p.avaliacao).replace('.', ',') : 'Novo';
  const totalAvaliacoes = Number(p.avaliacoes || 0);
  const local = [p.cidade, p.bairro].filter(Boolean).join(' · ') || 'Localização não informada';
  const whatsappOk = limparNumero(p.whatsapp || '').length >= 10;

  return `
    <article class="card card-v36${temPlano ? ' card-v36-destaque' : ''}" style="animation-delay:${index * 0.05}s">
      <div class="foto-card">
        ${fotoCard}
        <span class="rating-chip-v36"><b>★</b> ${avaliacao}${totalAvaliacoes ? ` <small>(${totalAvaliacoes})</small>` : ''}</span>
      </div>

      <div class="card-conteudo-mobile">
        <h3 class="nome-profissional-linha"><span>${p.nome || 'Profissional'}</span>${p.verificado ? '<span class="verified-dot-v36" title="Perfil verificado" aria-label="Perfil verificado">✓</span>' : ''}</h3>
        <p class="profissao">${p.profissao || p.categoria || 'Profissional'}</p>
        <div class="card-meta-v36">
          <span title="Localização">⌖ ${local}</span>
          ${whatsappOk ? '<span class="status-online-v36">WhatsApp</span>' : ''}
        </div>
        <span class="card-plan-v36">${planoTexto}</span>
      </div>

      <a class="card-arrow-v36" href="/perfil?id=${p.id}" aria-label="Ver perfil de ${p.nome || 'profissional'}">›</a>
    </article>
  `;
}

async function mostrarProfissionais(lista = null) {
  const container = document.getElementById("listaProfissionais");
  if (!container) return;

  try {
    const carregados = ordenarProfissionaisPorPlano(lista || await carregarProfissionais());
    const profissionais = lista === null && document.body.classList.contains('home-v36')
      ? carregados.slice(0, 6)
      : carregados;
    container.innerHTML = "";

    if (!profissionais || profissionais.length === 0) {
      container.innerHTML = `
        <div class="admin-vazio home-empty-v36">
          <h3>Nenhum profissional encontrado</h3>
          <p>Tente outro serviço, profissão, categoria ou cidade.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = profissionais.map(cardProfissionalHTML).join("");
  } catch (error) {
    container.innerHTML = `
      <div class="admin-vazio home-empty-v36">
        <h3>Não foi possível carregar os profissionais</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

function preencherCategoriasHomeV36() {
  const select = document.getElementById('campoCategoria');
  if (!select || select.dataset.preenchido === 'true') return;
  const categorias = [...new Set((baseProfissoesNorteServic || []).map(item => item.categoria).filter(Boolean))]
    .sort((a,b) => a.localeCompare(b,'pt-BR'));
  categorias.forEach(categoria => {
    const option = document.createElement('option');
    option.value = categoria;
    option.textContent = categoria;
    select.appendChild(option);
  });
  select.dataset.preenchido = 'true';
}

async function buscarProfissionais() {
  const campo = document.getElementById("campoBusca");
  if (!campo) return;

  const termo = campo.value.trim();
  const cidade = document.getElementById('campoCidade')?.value.trim() || '';
  const categoria = document.getElementById('campoCategoria')?.value.trim() || '';

  try {
    const params = new URLSearchParams();
    if (termo) params.set('q', termo);
    else if (categoria) params.set('q', categoria);
    if (cidade) params.set('cidade', cidade);

    const profissionais = await apiFetch(`/api/profissionais${params.toString() ? `?${params.toString()}` : ''}`);
    const filtrados = categoria && termo
      ? profissionais.filter(p => normalizarTextoNorteServic(p.categoria || '').includes(normalizarTextoNorteServic(categoria)))
      : profissionais;

    mostrarProfissionais(ordenarProfissionaisPorPlano(filtrados));

    const destino = document.getElementById('profissionais');
    if (destino) window.setTimeout(() => destino.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
  } catch (error) {
    const container = document.getElementById("listaProfissionais");
    if (container) container.innerHTML = `<div class="admin-vazio home-empty-v36"><h3>Erro na busca</h3><p>${error.message}</p></div>`;
  }
}

function buscarCategoria(categoria) {
  const campo = document.getElementById("campoBusca");
  if (!campo) return;
  campo.value = categoria;
  buscarProfissionais();
}

function buscarCategoriaV36(categoria) {
  preencherCategoriasHomeV36();
  const select = document.getElementById('campoCategoria');
  const campo = document.getElementById('campoBusca');
  if (campo) campo.value = '';
  if (select) {
    const alvo = normalizarTextoNorteServic(categoria);
    const option = [...select.options].find(item => item.value && (normalizarTextoNorteServic(item.value).includes(alvo) || alvo.includes(normalizarTextoNorteServic(item.value))));
    select.value = option ? option.value : '';
  }
  if (!select?.value && campo) campo.value = categoria;
  buscarProfissionais();
}

function ativarBuscaComEnter() {
  ['campoBusca','campoCidade'].forEach(id => {
    const campo = document.getElementById(id);
    if (!campo || campo.dataset.enterBusca === 'true') return;
    campo.dataset.enterBusca = 'true';
    campo.addEventListener('keyup', e => {
      if (e.key === 'Enter') buscarProfissionais();
    });
  });
  const categoria = document.getElementById('campoCategoria');
  if (categoria && categoria.dataset.buscaChange !== 'true') {
    categoria.dataset.buscaChange = 'true';
    categoria.addEventListener('change', () => {
      if (categoria.value) buscarProfissionais();
    });
  }
}

/* ================================================= */
/* CADASTRO GUIADO */
/* ================================================= */

function obterCategoriaDaProfissaoCadastro(profissao) {
  const alvo = normalizarTextoNorteServic(profissao || "");
  if (!alvo) return "";
  for (const item of baseProfissoesNorteServic) {
    const encontrada = item.profissoes.find((nome) => normalizarTextoNorteServic(nome) === alvo);
    if (encontrada) return item.categoria;
  }
  return "Outros Serviços";
}

function iniciarProfissaoCadastroSimples() {
  const campo = document.getElementById("profissao");
  const lista = document.getElementById("listaProfissoesCadastro");
  const categoria = document.getElementById("categoria");
  if (!campo || !lista) return;

  const profissoes = [];
  baseProfissoesNorteServic.forEach((grupo) => {
    grupo.profissoes.forEach((profissao) => profissoes.push({ profissao, categoria: grupo.categoria }));
  });

  const vistos = new Set();
  lista.innerHTML = profissoes
    .filter((item) => {
      const chave = normalizarTextoNorteServic(item.profissao);
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    })
    .sort((a, b) => a.profissao.localeCompare(b.profissao, "pt-BR"))
    .map((item) => `<option value="${item.profissao}">${item.categoria}</option>`)
    .join("");

  const sincronizar = () => {
    if (categoria) categoria.value = obterCategoriaDaProfissaoCadastro(campo.value);
  };
  campo.addEventListener("input", sincronizar);
  campo.addEventListener("change", sincronizar);
  sincronizar();
}

function preencherCategoriasCadastro() {
  const selectCategoria = document.getElementById("categoria");
  if (!selectCategoria || selectCategoria.tagName !== "SELECT") return;

  selectCategoria.innerHTML = `<option value="">Selecione uma categoria</option>`;
  baseProfissoesNorteServic.forEach(item => {
    selectCategoria.innerHTML += `<option value="${item.categoria}">${item.categoria}</option>`;
  });

  selectCategoria.addEventListener("change", preencherProfissoesDaCategoria);
}

function preencherProfissoesDaCategoria() {
  const selectCategoria = document.getElementById("categoria");
  const selectProfissao = document.getElementById("profissao");
  const servicosBox = document.getElementById("servicosTagsBox");
  if (!selectCategoria || selectCategoria.tagName !== "SELECT" || !selectProfissao || selectProfissao.tagName !== "SELECT") return;

  selectProfissao.innerHTML = `<option value="">Selecione uma profissão</option>`;
  servicosSelecionadosCadastro = [];
  atualizarInputServicosSelecionados();

  if (servicosBox) {
    servicosBox.innerHTML = `<p class="servicos-placeholder">Selecione uma profissão para ver os serviços disponíveis.</p>`;
  }

  const categoria = baseProfissoesNorteServic.find(item => item.categoria === selectCategoria.value);
  if (!categoria) return;

  categoria.profissoes.forEach(profissao => {
    selectProfissao.innerHTML += `<option value="${profissao}">${profissao}</option>`;
  });
}

function ativarProfissaoServicos() {
  const selectProfissao = document.getElementById("profissao");
  if (!selectProfissao) return;
  selectProfissao.addEventListener("change", carregarServicosDaProfissao);
}

function pegarServicosFallbackDaCategoria() {
  const categoriaSelecionada = document.getElementById("categoria")?.value || "";
  const categoria = baseProfissoesNorteServic.find(item => item.categoria === categoriaSelecionada);
  return categoria ? categoria.palavras : [];
}

function carregarServicosDaProfissao() {
  const selectProfissao = document.getElementById("profissao");
  const servicosBox = document.getElementById("servicosTagsBox");
  if (!selectProfissao || !servicosBox) return;

  const profissao = selectProfissao.value;
  servicosSelecionadosCadastro = [];
  atualizarInputServicosSelecionados();
  servicosBox.innerHTML = "";

  if (!profissao) {
    servicosBox.innerHTML = `<p class="servicos-placeholder">Selecione uma profissão para ver os serviços disponíveis.</p>`;
    return;
  }

  const servicos = servicosPorProfissaoNorteServic[profissao] || pegarServicosFallbackDaCategoria();

  if (!servicos.length) {
    servicosBox.innerHTML = `<p class="servicos-placeholder">Nenhum serviço pré-definido encontrado. Use o campo "Outro serviço".</p>`;
    return;
  }

  servicos.forEach(servico => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "servico-tag-opcao";
    botao.innerText = servico;
    botao.addEventListener("click", () => alternarServicoSelecionado(servico, botao));
    servicosBox.appendChild(botao);
  });
}

function alternarServicoSelecionado(servico, botao) {
  const existe = servicosSelecionadosCadastro.some(item => normalizarTextoNorteServic(item) === normalizarTextoNorteServic(servico));

  if (existe) {
    servicosSelecionadosCadastro = servicosSelecionadosCadastro.filter(item => normalizarTextoNorteServic(item) !== normalizarTextoNorteServic(servico));
    botao.classList.remove("ativo");
  } else {
    servicosSelecionadosCadastro.push(servico);
    botao.classList.add("ativo");
  }

  atualizarInputServicosSelecionados();
}

function adicionarServicoExtra() {
  const input = document.getElementById("servicoExtra");
  if (!input) return;

  const valor = input.value.trim();
  if (!valor) return;

  const existe = servicosSelecionadosCadastro.some(item => normalizarTextoNorteServic(item) === normalizarTextoNorteServic(valor));
  if (!existe) servicosSelecionadosCadastro.push(valor);

  input.value = "";
  atualizarInputServicosSelecionados();
}

function atualizarInputServicosSelecionados() {
  const inputServicos = document.getElementById("servicos");
  const boxSelecionados = document.getElementById("servicosSelecionados");

  if (inputServicos) inputServicos.value = servicosSelecionadosCadastro.join(", ");

  if (boxSelecionados) {
    boxSelecionados.innerHTML = "";
    servicosSelecionadosCadastro.forEach(servico => {
      const tag = document.createElement("span");
      tag.innerText = servico;
      boxSelecionados.appendChild(tag);
    });
  }
}

/* ================================================= */
/* CIDADE INTELIGENTE */
/* ================================================= */

function filtrarCidadesNorteServic(termo) {
  const termoNormalizado = normalizarTextoNorteServic(termo);
  if (!termoNormalizado) return [];

  return cidadesNorteServic
    .filter(cidade => normalizarTextoNorteServic(cidade).includes(termoNormalizado))
    .sort((a, b) => {
      const na = normalizarTextoNorteServic(a);
      const nb = normalizarTextoNorteServic(b);
      const aInicio = na.startsWith(termoNormalizado) ? 0 : 1;
      const bInicio = nb.startsWith(termoNormalizado) ? 0 : 1;
      return aInicio - bInicio || a.localeCompare(b, "pt-BR");
    })
    .slice(0, 12);
}

function iniciarCidadeInteligente() {
  ativarSugestaoCidadePrincipal();
  ativarSugestaoCidadeAtendida();
}

function ativarSugestaoCidadePrincipal() {
  const input = document.getElementById("cidade");
  const caixa = document.getElementById("sugestoesCidade");
  if (!input || !caixa) return;

  input.addEventListener("input", function() {
    const sugestoes = filtrarCidadesNorteServic(input.value);
    caixa.innerHTML = "";

    if (sugestoes.length === 0) {
      caixa.classList.remove("ativo");
      return;
    }

    sugestoes.forEach(cidade => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "sugestao-cidade-item";
      botao.innerText = cidade;
      botao.addEventListener("click", () => {
        input.value = cidade;
        caixa.classList.remove("ativo");
        caixa.innerHTML = "";
      });
      caixa.appendChild(botao);
    });

    caixa.classList.add("ativo");
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".campo-cidade-inteligente")) caixa.classList.remove("ativo");
  });
}

function ativarSugestaoCidadeAtendida() {
  const input = document.getElementById("cidadeAtendidaInput");
  const caixa = document.getElementById("sugestoesCidadeAtendida");
  if (!input || !caixa) return;

  input.addEventListener("input", function() {
    const sugestoes = filtrarCidadesNorteServic(input.value);
    caixa.innerHTML = "";

    if (sugestoes.length === 0) {
      caixa.classList.remove("ativo");
      return;
    }

    sugestoes.forEach(cidade => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "sugestao-cidade-item";
      botao.innerText = cidade;
      botao.addEventListener("click", () => {
        adicionarCidadeAtendida(cidade);
        input.value = "";
        caixa.classList.remove("ativo");
        caixa.innerHTML = "";
      });
      caixa.appendChild(botao);
    });

    caixa.classList.add("ativo");
  });
}

function adicionarCidadeAtendida(cidade) {
  const existe = cidadesSelecionadasCadastro.some(item => normalizarTextoNorteServic(item) === normalizarTextoNorteServic(cidade));
  if (!existe) cidadesSelecionadasCadastro.push(cidade);
  atualizarCidadesSelecionadasVisual();
}

function removerCidadeAtendida(cidade) {
  cidadesSelecionadasCadastro = cidadesSelecionadasCadastro.filter(item => normalizarTextoNorteServic(item) !== normalizarTextoNorteServic(cidade));
  atualizarCidadesSelecionadasVisual();
}

function atualizarCidadesSelecionadasVisual() {
  const box = document.getElementById("cidadesSelecionadas");
  if (!box) return;

  box.innerHTML = "";
  cidadesSelecionadasCadastro.forEach(cidade => {
    const tag = document.createElement("span");
    const botao = document.createElement("button");
    botao.type = "button";
    botao.innerText = "×";
    botao.addEventListener("click", () => removerCidadeAtendida(cidade));
    tag.append(document.createTextNode(cidade + " "), botao);
    box.appendChild(tag);
  });
}

function alternarCidadesAtendidas() {
  const select = document.getElementById("atendeOutrasCidades");
  const box = document.getElementById("boxCidadesAtendidas");
  if (!select || !box) return;

  if (select.value === "Sim" || select.value === "Depende do serviço") {
    box.classList.remove("escondido");
  } else {
    box.classList.add("escondido");
    cidadesSelecionadasCadastro = [];
    atualizarCidadesSelecionadasVisual();
  }
}

/* ================================================= */
/* CADASTRO -> BACKEND */
/* ================================================= */

function dadosFormularioProfissional(incluirSenha = true) {
  const profissao = document.getElementById("profissao")?.value.trim() || "";
  const categoriaSelecionada = document.getElementById("categoria")?.value || obterCategoriaDaProfissaoCadastro(profissao);
  const aceitouLegal = !!document.getElementById("aceitouTermos")?.checked;
  const dados = {
    nome: document.getElementById("nome")?.value.trim() || "",
    tipoProfissional: document.getElementById("tipoProfissional")?.value || "",
    categoria: categoriaSelecionada || "Outros Serviços",
    profissao,
    servicos: document.getElementById("servicos")?.value.trim() || profissao,
    palavrasChave: pegarPalavrasDaCategoria(categoriaSelecionada),
    cidade: document.getElementById("cidade")?.value.trim() || "",
    bairro: document.getElementById("bairro")?.value.trim() || "",
    atendeOutrasCidades: document.getElementById("atendeOutrasCidades")?.value || "Não",
    cidadesAtendidas: typeof pegarCidadesAtendidasCadastro === "function" ? pegarCidadesAtendidasCadastro() : [],
    formaAtendimento: document.getElementById("formaAtendimento")?.value || "",
    whatsapp: limparNumero(document.getElementById("whatsapp")?.value || ""),
    instagram: document.getElementById("instagram")?.value.trim() || "",
    descricao: document.getElementById("descricao")?.value.trim() || "",
    aceitouTermos: aceitouLegal,
    aceitouPrivacidade: aceitouLegal,
    termosVersao: "2026.06",
    privacidadeVersao: "2026.06"
  };

  if (incluirSenha) {
    dados.senha = document.getElementById("senhaCadastro")?.value.trim() || "";
  }

  return dados;
}


function mostrarAvisoIndicacaoCadastro() {
  const ref = obterCodigoIndicacaoDaURL();
  if (!ref) return;
  const topo = document.querySelector(".cadastro-form-topo");
  if (!topo || document.querySelector(".cadastro-ref-alerta")) return;
  const aviso = document.createElement("div");
  aviso.className = "cadastro-ref-alerta";
  aviso.innerHTML = `<strong>Cadastro por indicação ativo</strong><span>Código aplicado: ${ref}</span>`;
  topo.appendChild(aviso);
}

let cadastroProfissionalEnviando = false;

function iniciarCadastroBackend() {
  const formCadastro = document.getElementById("formCadastro");
  if (!formCadastro) return;

  formCadastro.addEventListener("submit", async function(e) {
    e.preventDefault();
    if (cadastroProfissionalEnviando) return;

    const botao = formCadastro.querySelector("button[type='submit']") || formCadastro.querySelector("button");
    const textoOriginal = botao ? botao.innerText : "";
    let textoBotaoLoading = textoOriginal;
    const mensagemCadastro = document.getElementById("mensagemCadastro");
    const dados = dadosFormularioProfissional(true);

    if (mensagemCadastro) {
      mensagemCadastro.innerText = "";
      mensagemCadastro.classList.remove("erro", "sucesso");
    }

    if (!dados.nome || dados.nome.length < 2) {
      if (mensagemCadastro) mensagemCadastro.innerText = "Digite seu nome para continuar.";
      document.getElementById("nome")?.focus();
      return;
    }
    if (!dados.profissao) {
      if (mensagemCadastro) mensagemCadastro.innerText = "Informe sua profissão.";
      document.getElementById("profissao")?.focus();
      return;
    }
    if (!dados.cidade) {
      if (mensagemCadastro) mensagemCadastro.innerText = "Informe a cidade onde você trabalha.";
      document.getElementById("cidade")?.focus();
      return;
    }
    if (dados.whatsapp.length < 10) {
      if (mensagemCadastro) mensagemCadastro.innerText = "Digite um WhatsApp válido com DDD.";
      document.getElementById("whatsapp")?.focus();
      return;
    }
    if (dados.senha.length < 6) {
      if (mensagemCadastro) mensagemCadastro.innerText = "Crie uma senha com pelo menos 6 caracteres.";
      document.getElementById("senhaCadastro")?.focus();
      return;
    }
    if (!dados.aceitouTermos) {
      if (mensagemCadastro) mensagemCadastro.innerText = "Para criar sua conta, aceite os Termos de Uso e a Política de Privacidade.";
      document.querySelector(".signup-legal")?.classList.add("legal-aceite-alerta");
      return;
    }

    try {
      cadastroProfissionalEnviando = true;
      textoBotaoLoading = ativarEstadoCarregandoBotao(botao, "Criando seu perfil...");
      mostrarLoading("Criando seu perfil profissional...");
      await aguardarPinturaTela(80);

      const refIndicacao = obterCodigoIndicacaoDaURL();
      if (refIndicacao) dados.refIndicacao = refIndicacao;

      const resposta = await apiFetch("/api/cadastro", {
        method: "POST",
        body: JSON.stringify(dados)
      });

      if (resposta?.token) {
        localStorage.setItem(PROF_TOKEN_STORAGE, resposta.token);
        sessionStorage.setItem(PROF_TOKEN_STORAGE, resposta.token);
      }

      if (mensagemCadastro) {
        mensagemCadastro.innerText = "Conta criada! Agora complete seu perfil.";
        mensagemCadastro.classList.add("sucesso");
      }

      const destino = `/completar-perfil?origem=cadastro${refIndicacao ? `&ref=${encodeURIComponent(refIndicacao)}` : ""}`;
      window.setTimeout(() => { window.location.href = destino; }, 450);
    } catch (error) {
      if (mensagemCadastro) {
        mensagemCadastro.innerText = error.message;
        mensagemCadastro.classList.add("erro");
      }
    } finally {
      esconderLoading();
      cadastroProfissionalEnviando = false;
      restaurarEstadoBotao(botao, textoBotaoLoading || textoOriginal);
    }
  });
}

/* ================================================= */
/* PERFIL PÚBLICO */
/* ================================================= */


function avaliacoesPerfilHTML(avaliacoes = []) {
  if (!avaliacoes || avaliacoes.length === 0) {
    return `
      <div class="avaliacoes-vazio avaliacoes-vazio-elite">
        <div class="avaliacoes-empty-icon">★</div>
        <div>
          <strong>Nenhuma avaliação publicada ainda.</strong>
          <p>Contratou este profissional? Seja o primeiro a deixar uma avaliação analisada pela Norte Servic.</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="avaliacoes-lista avaliacoes-lista-elite">
      ${avaliacoes.slice(0, 6).map(item => `
        <article class="avaliacao-card-publica avaliacao-card-elite">
          <div class="avaliacao-card-topo">
            <div class="avaliacao-avatar">${String(item.nomeCliente || "C").charAt(0).toUpperCase()}</div>
            <div class="avaliacao-identidade">
              <strong>${item.nomeCliente}</strong>
              <small>${formatarDataCurta(item.criadoEm)}</small>
            </div>
            <span class="avaliacao-nota-badge">${estrelasHTML(item.nota)}</span>
          </div>
          <p>${item.comentario}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function formularioAvaliacaoHTML(profissionalId) {
  return `
    <form class="form-avaliacao form-avaliacao-elite" id="formAvaliacaoProfissional" data-profissional-id="${profissionalId}">
      <div class="form-avaliacao-topo form-avaliacao-topo-elite">
        <div>
          <span>Avaliação segura</span>
          <h3>Avalie este atendimento</h3>
          <p>Sua opinião passa por análise antes de aparecer no perfil.</p>
        </div>
        <div class="avaliacao-mini-selo">✓ Moderado</div>
      </div>

      <div class="form-avaliacao-grid form-avaliacao-grid-elite">
        <div>
          <label>Seu nome</label>
          <input type="text" id="avaliacaoNomeCliente" placeholder="Ex: Ana Silva" required>
        </div>

        <div>
          <label>Nota</label>
          <div class="avaliacao-estrelas avaliacao-estrelas-elite" id="avaliacaoEstrelas">
            ${[1,2,3,4,5].map(nota => `<button type="button" data-nota="${nota}" aria-label="${nota} estrelas">★</button>`).join("")}
          </div>
          <input type="hidden" id="avaliacaoNota" value="5">
        </div>
      </div>

      <div class="avaliacao-comentario-linha">
        <label>Comentário breve</label>
        <textarea id="avaliacaoComentario" rows="3" placeholder="Como foi o atendimento? Seja direto." required></textarea>
      </div>

      <button type="submit" class="avaliacao-submit-elite">Enviar avaliação</button>
      <p id="mensagemAvaliacao"></p>
    </form>
  `;
}

function iniciarFormularioAvaliacao(profissionalId) {
  const form = document.getElementById("formAvaliacaoProfissional");
  const estrelas = document.getElementById("avaliacaoEstrelas");
  const notaInput = document.getElementById("avaliacaoNota");
  if (!form || !estrelas || !notaInput) return;

  function pintarEstrelas(nota) {
    estrelas.querySelectorAll("button").forEach(botao => {
      botao.classList.toggle("ativo", Number(botao.dataset.nota) <= nota);
    });
  }

  pintarEstrelas(Number(notaInput.value || 5));

  estrelas.querySelectorAll("button").forEach(botao => {
    botao.addEventListener("click", () => {
      const nota = Number(botao.dataset.nota || 5);
      notaInput.value = String(nota);
      pintarEstrelas(nota);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const mensagem = document.getElementById("mensagemAvaliacao");
    const botao = form.querySelector("button[type='submit']");
    const textoOriginal = botao ? botao.innerText : "";

    const dados = {
      nomeCliente: document.getElementById("avaliacaoNomeCliente")?.value.trim() || "",
      nota: Number(notaInput.value || 5),
      comentario: document.getElementById("avaliacaoComentario")?.value.trim() || ""
    };

    try {
      if (botao) {
        botao.disabled = true;
        botao.innerText = "Enviando...";
      }

      await enviarAvaliacaoProfissional(profissionalId, dados);

      if (mensagem) mensagem.innerText = "Avaliação enviada! Ela aparecerá no perfil após aprovação da Norte Servic.";
      form.reset();
      notaInput.value = "5";
      pintarEstrelas(5);
    } catch (error) {
      if (mensagem) mensagem.innerText = error.message;
    } finally {
      if (botao) {
        botao.disabled = false;
        botao.innerText = textoOriginal;
      }
    }
  });
}


async function carregarPerfilProfissional() {
  const container = document.getElementById("perfilProfissional");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  try {
    const profissional = await carregarProfissionalPorId(id);
    const avaliacoesPublicas = await carregarAvaliacoesProfissional(id);
    const linkWhatsApp = criarLinkWhatsApp(profissional.whatsapp);
    const inicial = profissional.nome ? profissional.nome.charAt(0).toUpperCase() : "?";
    const fotoPerfil = profissional.fotoPerfil ? `<img src="${profissional.fotoPerfil}" alt="Foto de ${profissional.nome}">` : inicial;
    const servicosArray = (profissional.servicos || "").split(",").map(s => s.trim()).filter(Boolean);
    const cidadesTexto = formatarCidadesAtendidas(profissional);

    const fotosTrabalhosPerfil = Array.isArray(profissional.fotosTrabalhos) ? profissional.fotosTrabalhos : [];
    const galeriaTrabalhos = fotosTrabalhosPerfil.length > 0
      ? `
        <div class="galeria-carousel" data-carousel="trabalhos">
          <div class="galeria-carousel-track">
            ${fotosTrabalhosPerfil.map((foto, idx) => `
              <figure class="galeria-slide">
                <img src="${foto}" alt="Foto ${idx + 1} de trabalho realizado por ${profissional.nome}">
              </figure>
            `).join("")}
          </div>
          ${fotosTrabalhosPerfil.length > 1 ? `<div class="galeria-carousel-dots">${fotosTrabalhosPerfil.map((_, idx) => `<button type="button" class="${idx === 0 ? "ativo" : ""}" aria-label="Ver foto ${idx + 1}"></button>`).join("")}</div>` : ""}
        </div>
      `
      : `<p>Este profissional ainda não adicionou fotos dos trabalhos. Mesmo assim, você pode entrar em contato e solicitar referências.</p>`;

    container.innerHTML = `
      <a class="botao-voltar-perfil" href="/">← Voltar para a busca</a>
      <div class="perfil-premium">
        <aside class="perfil-lateral">
          <div class="perfil-capa"></div>
          <div class="perfil-foto-area"><div class="perfil-foto-premium">${fotoPerfil}</div></div>
          <div class="perfil-lateral-info">
            <span class="selo-verificado-premium">${profissional.verificado ? "✓ Profissional verificado" : "Cadastro em análise"}</span>
            <h1 class="nome-profissional-linha perfil-nome"><span>${profissional.nome}</span>${seloVerificadoPlanoHTML(profissional, "perfil")}</h1>
            <p class="profissao">${profissional.profissao}</p>
            <div class="perfil-meta">
              <p>📍 ${profissional.cidade} - ${profissional.bairro}</p>
              <p>🏷️ ${profissional.categoria || "Categoria não informada"}</p>
              <p>🌎 Atende: ${cidadesTexto}</p>
              <p>💼 ${profissional.formaAtendimento || "Atendimento não informado"}</p>
              <p>⭐ ${profissional.avaliacao || "Novo"} | ${profissional.avaliacoes || 0} avaliações</p>
              <p>⚡ Atendimento direto pelo WhatsApp</p>
            </div>
            <a class="botao-whatsapp-premium" href="${linkWhatsApp}" target="_blank">Chamar no WhatsApp</a>
          </div>
        </aside>
        <section class="perfil-conteudo">
          <div class="perfil-hero-texto perfil-hero-compacto-premium">
            <div>
              <span>Perfil profissional</span>
              <h2>${profissional.nome}</h2>
              <p>Informações, serviços, atendimento e avaliações em um perfil verificado pela Norte Servic.</p>
            </div>
            <div class="perfil-hero-mini-stats">
              <strong>${profissional.avaliacao || "Novo"}</strong>
              <small>${profissional.avaliacoes || 0} avaliações</small>
            </div>
          </div>

          <div class="perfil-info-compact-grid">
            <div class="perfil-section-clean perfil-section-mini perfil-section-sobre">
              <span class="perfil-mini-label">Sobre</span>
              <h2>Sobre o profissional</h2>
              <p>${profissional.descricao}</p>
            </div>

            <div class="perfil-section-clean perfil-section-mini perfil-section-servicos">
              <span class="perfil-mini-label">Serviços</span>
              <h2>Serviços que realiza</h2>
              <div class="servicos-premium servicos-premium-compacto">${servicosArray.slice(0, 8).map(s => `<span>${s}</span>`).join("")}</div>
            </div>

            <div class="perfil-section-clean perfil-section-mini perfil-section-atendimento">
              <span class="perfil-mini-label">Atendimento</span>
              <h2>Área de atendimento</h2>
              <div class="perfil-atendimento-lista">
                <p><strong>Cidade:</strong> ${profissional.cidade}</p>
                <p><strong>Atende:</strong> ${cidadesTexto}</p>
                <p><strong>Formato:</strong> ${profissional.formaAtendimento || "Não informado"}</p>
                <p><strong>Instagram:</strong> ${instagramHTML(profissional.instagram, "perfil-instagram")}</p>
              </div>
            </div>
          </div>

          <div class="perfil-section-clean perfil-avaliacoes-section perfil-avaliacoes-prioridade perfil-avaliacoes-elite">
            <div class="avaliacoes-header avaliacoes-header-elite">
              <div>
                <span>Confiança pública</span>
                <h2>Avaliações verificadas</h2>
                <p>Comentários analisados antes de aparecer no perfil.</p>
              </div>
              <div class="avaliacoes-score-box">
                <strong>${profissional.avaliacao || "Novo"}</strong>
                <small>${profissional.avaliacoes || 0} avaliações</small>
              </div>
            </div>
            ${avaliacoesPerfilHTML(avaliacoesPublicas)}
            ${formularioAvaliacaoHTML(profissional.id)}
          </div>
          <div class="perfil-section-clean perfil-section-mini perfil-fotos-compacto"><h2>Fotos dos trabalhos</h2>${galeriaTrabalhos}</div>
        </section>
      </div>
    `;
    iniciarCarrosseisFotos();
    iniciarFormularioAvaliacao(profissional.id);
  } catch (error) {
    container.innerHTML = `
      <a class="botao-voltar-perfil" href="/">← Voltar para a busca</a>
      <div class="perfil-conteudo"><div class="perfil-hero-texto"><span>Perfil indisponível</span><h2>Profissional não encontrado</h2><p>${error.message}</p></div></div>
    `;
  }
}


function iniciarCarrosseisFotos() {
  document.querySelectorAll(".galeria-carousel").forEach((carousel) => {
    const track = carousel.querySelector(".galeria-carousel-track");
    const slides = Array.from(carousel.querySelectorAll(".galeria-slide"));
    const dots = Array.from(carousel.querySelectorAll(".galeria-carousel-dots button"));

    if (!track || slides.length <= 1 || carousel.dataset.iniciado === "true") return;

    carousel.dataset.iniciado = "true";
    let index = 0;

    function irPara(proximo) {
      index = (proximo + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, idx) => dot.classList.toggle("ativo", idx === index));
    }

    dots.forEach((dot, idx) => dot.addEventListener("click", () => irPara(idx)));
    setInterval(() => irPara(index + 1), 4200);
  });
}

function iniciarCarrosselBannersMobile() {
  const track = document.querySelector(".home-banners-track");
  if (!track || track.dataset.autoMobile === "true") return;

  track.dataset.autoMobile = "true";
  let index = 0;

  function mover() {
    if (!window.matchMedia("(max-width: 820px)").matches) return;

    const cards = Array.from(track.querySelectorAll(".home-banner-card"));
    if (cards.length <= 1) return;

    index = (index + 1) % cards.length;
    const card = cards[index];
    track.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
  }

  let intervalo = setInterval(mover, 3800);

  track.addEventListener("touchstart", () => {
    clearInterval(intervalo);
    intervalo = setInterval(mover, 5200);
  }, { passive: true });
}


function iniciarAutoScrollFaixasHome() {
  const faixas = [
    { seletor: ".categorias", item: "button", intervalo: 2400, media: "(max-width: 820px)" },
    { seletor: ".passos", item: "div", intervalo: 3200, media: "(max-width: 820px)" },
    { seletor: ".por-que-grid", item: ".por-que-card", intervalo: 3600, media: "(max-width: 820px)" }
  ];

  faixas.forEach((config) => {
    const faixa = document.querySelector(config.seletor);
    if (!faixa || faixa.dataset.autoScrollFaixa === "true") return;

    faixa.dataset.autoScrollFaixa = "true";
    let indice = 0;
    let timer;

    const reiniciar = () => {
      clearInterval(timer);
      timer = setInterval(() => {
        if (!window.matchMedia(config.media).matches) return;

        const itens = Array.from(faixa.querySelectorAll(config.item));
        if (itens.length <= 1) return;

        indice = (indice + 1) % itens.length;
        const alvo = itens[indice];
        const margem = config.seletor === ".categorias" ? 8 : 16;

        faixa.scrollTo({
          left: Math.max(0, alvo.offsetLeft - margem),
          behavior: "smooth"
        });
      }, config.intervalo);
    };

    reiniciar();

    ["touchstart", "pointerdown", "wheel"].forEach((evento) => {
      faixa.addEventListener(evento, reiniciar, { passive: true });
    });
  });
}

/* ================================================= */
