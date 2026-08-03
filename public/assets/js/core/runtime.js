'use strict';

/* API E UTILITÁRIOS */
/* ================================================= */

function normalizarTextoNorteServic(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function limparNumero(valor) {
  return String(valor || "").replace(/\D/g, "");
}

async function apiFetch(url, options = {}) {
  const controller = new AbortController();
  const timeoutMs = Number(options.timeoutMs || 18000);
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resposta = await fetch(API_BASE + url, {
      ...options,
      credentials: options.credentials || "same-origin",
      signal: options.signal || controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    let dados = null;
    try {
      dados = await resposta.json();
    } catch (_) {
      dados = null;
    }

    if (!resposta.ok) {
      const detalhe = dados?.detalhe ? ` Detalhe: ${dados.detalhe}` : "";
      const mensagemErro = dados?.erro || dados?.mensagem || "Erro na requisição.";
      console.error("Erro API", { url, status: resposta.status, dados });
      throw new Error(`${mensagemErro}${detalhe}`);
    }

    return dados;
  } catch (erro) {
    if (erro && erro.name === "AbortError") {
      throw new Error("A conexão demorou demais. Tente atualizar esta aba novamente.");
    }
    throw erro;
  } finally {
    clearTimeout(timeoutId);
  }
}

function obterCodigoIndicacaoDaURL() {
  const params = new URLSearchParams(window.location.search);
  const ref = (params.get("ref") || params.get("indicacao") || "").trim();
  if (ref) {
    localStorage.setItem("norteServicCodigoIndicacaoRecebido", ref);
    return ref;
  }
  return localStorage.getItem("norteServicCodigoIndicacaoRecebido") || "";
}

function formatarMoedaIndicacao(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarDataIndicacao(data) {
  if (!data) return "-";
  try {
    return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch (_) {
    return "-";
  }
}

function statusIndicacaoClasse(status = "") {
  const normalizado = String(status || "").toLowerCase();
  if (["disponivel", "pago"].includes(normalizado)) return "ok";
  if (["cancelada", "recusado"].includes(normalizado)) return "erro";
  if (["saque_solicitado", "aguardando", "pendente_liberacao"].includes(normalizado)) return "alerta";
  return "neutro";
}

function getTokenProfissional() {
  return (
    localStorage.getItem(PROF_TOKEN_STORAGE) ||
    localStorage.getItem("tokenProfissional") ||
    localStorage.getItem("profissionalToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem(PROF_TOKEN_STORAGE) ||
    sessionStorage.getItem("tokenProfissional") ||
    sessionStorage.getItem("profissionalToken") ||
    sessionStorage.getItem("token") ||
    ""
  );
}


function estrelasHTML(nota = 0) {
  const valor = Number(nota || 0);
  return Array.from({ length: 5 }, (_, index) => index < valor ? "★" : "☆").join("");
}

function formatarDataCurta(data) {
  if (!data) return "";
  try {
    return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch (_) {
    return "";
  }
}

function formatarDataHoraCurta(data) {
  if (!data) return "";
  try {
    return new Date(data).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch (_) {
    return "";
  }
}

function formatarMoedaBR(valor) {
  const numero = Number(valor || 0);
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function valorPagamentoNumero(pagamento) {
  if (!pagamento) return 0;
  const valor = Number(pagamento.valor || 0);
  if (valor > 0) return valor;
  const centavos = Number(pagamento.valor_centavos || pagamento.valorCentavos || 0);
  return centavos > 0 ? centavos / 100 : 0;
}

function taxaEfiEstimada(valor) {
  // Baseada no primeiro teste real: R$ 19,90 virou R$ 19,66 na Efí.
  const percentual = 0.0120603015;
  return Number(valor || 0) * percentual;
}

function valorLiquidoEstimado(pagamento) {
  const valorBanco = Number(pagamento?.valor_liquido || pagamento?.valor_liquido_estimado || 0);
  if (valorBanco > 0) return valorBanco;
  const bruto = valorPagamentoNumero(pagamento);
  return Math.max(0, bruto - taxaEfiEstimada(bruto));
}

function statusPagamentoAdmin(pagamento) {
  const status = String(pagamento?.status || pagamento?.efi_status || "").trim().toLowerCase();
  if (status === "pago" || status === "concluida" || status === "concluído") return "pago";
  if (status === "expirado" || status === "expirada" || status === "cancelado" || status === "cancelada") return "expirado";

  const criado = pagamento?.criado_em || pagamento?.criadoEm;
  const expira = pagamento?.expira_em || pagamento?.expiraEm;
  const dataExpira = expira ? new Date(expira) : (criado ? new Date(new Date(criado).getTime() + (Number(pagamento?.expiracao || 3600) * 1000)) : null);
  if (dataExpira && !Number.isNaN(dataExpira.getTime()) && dataExpira.getTime() < Date.now()) return "expirado";

  if (status === "erro") return "erro";
  return "aguardando";
}

function labelStatusPagamentoAdmin(status) {
  const mapa = {
    pago: "Pago",
    aguardando: "Aguardando",
    expirado: "Expirado",
    erro: "Erro"
  };
  return mapa[status] || "Aguardando";
}

function mensagemWhatsAppPagamentoExpirado(pagamento) {
  const nome = pagamento?.profissional_nome || pagamento?.profissionalNome || "";
  const plano = pagamento?.plano_nome || pagamento?.planoNome || pagamento?.plano_key || "plano de destaque";
  return encodeURIComponent(`Olá${nome ? " " + nome : ""}! Vi que você iniciou a assinatura do ${plano} da Norte Servic, mas não concluiu o pagamento.

Seu perfil pode perder benefícios como destaque, selo e mais visibilidade para clientes da região.

Quer que eu te ajude a concluir a assinatura?`);
}

function linkWhatsappNumeroMensagem(numero, mensagem) {
  const limpo = limparNumero(numero || "");
  if (!limpo) return "#";
  return `https://wa.me/55${limpo.length <= 11 ? limpo : limpo.replace(/^55/, "")}?text=${mensagem}`;
}

async function carregarAvaliacoesProfissional(profissionalId) {
  if (!profissionalId) return [];
  return apiFetch(`/api/profissionais/${profissionalId}/avaliacoes`);
}

async function enviarAvaliacaoProfissional(profissionalId, dados) {
  return apiFetch(`/api/profissionais/${profissionalId}/avaliacoes`, {
    method: "POST",
    body: JSON.stringify(dados)
  });
}


function setTokenProfissional(token) {
  localStorage.setItem(PROF_TOKEN_STORAGE, token);
  localStorage.setItem("tokenProfissional", token);
}

function removerTokenProfissional() {
  localStorage.removeItem(PROF_TOKEN_STORAGE);
  localStorage.removeItem("tokenProfissional");
  localStorage.removeItem("profissionalToken");
  localStorage.removeItem("token");
  sessionStorage.removeItem(PROF_TOKEN_STORAGE);
  sessionStorage.removeItem("tokenProfissional");
  sessionStorage.removeItem("profissionalToken");
  sessionStorage.removeItem("token");
}

function getAdminPassword() {
  // Mantido apenas para compatibilidade interna.
  // O admin agora usa sessão segura por cookie httpOnly, sem salvar senha no navegador.
  return localStorage.getItem(ADMIN_SESSION_MARKER_STORAGE) || sessionStorage.getItem(ADMIN_SESSION_MARKER_STORAGE) || "";
}

function headersAuth() {
  const token = getTokenProfissional();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function headersAdmin() {
  // A autenticação administrativa é feita automaticamente pelo cookie httpOnly.
  return {};
}

function setAdminPassword(_senha) {
  localStorage.setItem(ADMIN_SESSION_MARKER_STORAGE, "1");
  sessionStorage.setItem(ADMIN_SESSION_MARKER_STORAGE, "1");
}

function removerAdminPassword() {
  localStorage.removeItem(ADMIN_SESSION_MARKER_STORAGE);
  sessionStorage.removeItem(ADMIN_SESSION_MARKER_STORAGE);
  localStorage.removeItem(ADMIN_EMAIL_STORAGE);
  sessionStorage.removeItem(ADMIN_EMAIL_STORAGE);
}

async function verificarSessaoAdmin() {
  const dados = await apiFetch("/api/admin/auth/me", { method: "GET" });
  if (dados?.usuario) {
    setAdminPassword("sessao-ok");
    localStorage.setItem(ADMIN_EMAIL_STORAGE, dados.usuario.email || "");
    sessionStorage.setItem(ADMIN_EMAIL_STORAGE, dados.usuario.email || "");
    return dados.usuario;
  }
  throw new Error("Sessão administrativa inválida.");
}

async function sairAdminSeguro() {
  try {
    await apiFetch("/api/admin/auth/logout", { method: "POST" });
  } catch (_) {}
  removerAdminPassword();
  window.location.href = "/admin";
}



function moverLoadingParaBody(loading) {
  if (!loading || !document.body) return loading;
  if (loading.parentElement !== document.body) {
    document.body.appendChild(loading);
  }
  return loading;
}


function aguardarPinturaTela(ms = 80) {
  return new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, ms)));
}

function ativarEstadoCarregandoBotao(botao, texto = "Enviando...") {
  if (!botao) return "";
  const textoOriginal = botao.innerText;
  botao.disabled = true;
  botao.classList.add("botao-carregando");
  botao.innerHTML = `<span class="spinner-botao"></span><span>${texto}</span>`;
  return textoOriginal;
}

function restaurarEstadoBotao(botao, textoOriginal = "Enviar") {
  if (!botao) return;
  botao.disabled = false;
  botao.classList.remove("botao-carregando");
  botao.innerText = textoOriginal;
}


function criarLinkWhatsApp(numero) {
  const telefone = limparNumero(numero);
  const mensagem = encodeURIComponent("Olá! Encontrei seu perfil no Norte Servic e gostaria de solicitar um orçamento.");
  return `https://wa.me/${telefone}?text=${mensagem}`;
}

function carregarImagemDoArquivo(arquivo) {
  return new Promise((resolve, reject) => {
    if (!arquivo) return resolve(null);

    const url = URL.createObjectURL(arquivo);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem enviada."));
    };

    img.src = url;
  });
}

async function converterImagemParaBase64(arquivo, opcoes = {}) {
  if (!arquivo) return "";

  const {
    maxSize = 900,
    qualidade = 0.82,
    exigirQuadrada = false
  } = opcoes;

  const img = await carregarImagemDoArquivo(arquivo);
  if (!img) return "";

  const larguraOriginal = img.naturalWidth || img.width;
  const alturaOriginal = img.naturalHeight || img.height;

  let origemX = 0;
  let origemY = 0;
  let origemLargura = larguraOriginal;
  let origemAltura = alturaOriginal;

  if (exigirQuadrada) {
    const menorLado = Math.min(larguraOriginal, alturaOriginal);
    origemX = Math.floor((larguraOriginal - menorLado) / 2);
    origemY = Math.floor((alturaOriginal - menorLado) / 2);
    origemLargura = menorLado;
    origemAltura = menorLado;
  }

  const maiorLado = Math.max(origemLargura, origemAltura);
  const escala = maiorLado > maxSize ? maxSize / maiorLado : 1;
  const largura = Math.max(1, Math.round(origemLargura * escala));
  const altura = Math.max(1, Math.round(origemAltura * escala));

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, origemX, origemY, origemLargura, origemAltura, 0, 0, largura, altura);

  return canvas.toDataURL("image/jpeg", qualidade);
}

async function validarFotoPerfil1000(arquivo, obrigatoria = false) {
  if (!arquivo) {
    if (obrigatoria) throw new Error("Envie uma foto de perfil.");
    return;
  }

  if (!String(arquivo.type || "").startsWith("image/")) {
    throw new Error("Envie um arquivo de imagem válido para a foto de perfil.");
  }
}

function limiteFotosPorPlano(profissional = {}) {
  const plano = normalizarTextoNorteServic(profissional.planoAtual || profissional.plano_atual || "Gratuito");

  if (plano.includes("premium") || plano.includes("top")) return 30;
  if (plano.includes("profissional")) return 12;
  if (plano.includes("destaque")) return 6;
  return 3;
}

function criarLinkInstagram(instagram) {
  const valor = String(instagram || "").trim();
  if (!valor) return "";

  let usuario = valor.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  usuario = usuario.replace(/^@/, "").split(/[/?#]/)[0].trim();

  if (!usuario) return "";

  return `https://instagram.com/${encodeURIComponent(usuario)}`;
}

function instagramHTML(instagram, classe = "") {
  const link = criarLinkInstagram(instagram);
  if (!link) return "Não informado";

  const usuario = String(instagram || "").trim().replace(/^@/, "");
  return `<a class="instagram-link ${classe}" href="${link}" target="_blank" rel="noopener">@${usuario}</a>`;
}

async function converterVariasImagensParaBase64(arquivos) {
  const listaArquivos = Array.from(arquivos || []);
  const imagens = [];

  for (const arquivo of listaArquivos) {
    imagens.push(await converterImagemParaBase64(arquivo, {
      maxSize: 1200,
      qualidade: 0.78,
      exigirQuadrada: false
    }));
  }

  return imagens;
}

function pegarPalavrasDaCategoria(categoriaNome) {
  const categoria = baseProfissoesNorteServic.find(item => item.categoria === categoriaNome);
  if (!categoria) return "";
  return [categoria.categoria, ...categoria.profissoes, ...categoria.palavras].join(" ");
}

function pegarCidadesAtendidasCadastro() {
  const cidadePrincipal = document.getElementById("cidade")?.value.trim() || "";
  const todas = [cidadePrincipal, ...cidadesSelecionadasCadastro].filter(Boolean);
  return [...new Set(todas)];
}

function formatarCidadesAtendidas(p) {
  const cidades = Array.isArray(p.cidadesAtendidas) && p.cidadesAtendidas.length > 0
    ? p.cidadesAtendidas
    : [p.cidade].filter(Boolean);

  if (p.formaAtendimento === "Online") return "Atendimento online";
  if (p.formaAtendimento === "Presencial e online" && cidades.includes("Toda a região")) return "Toda a região e online";
  if (cidades.includes("Toda a região")) return "Toda a região";
  if (cidades.length === 1) return cidades[0];
  if (cidades.length > 3) return `${cidades.slice(0, 3).join(", ")} e região`;
  return cidades.join(", ");
}

function calcularForcaPerfil(p) {
  let pontos = 0;
  if (p.nome) pontos += 10;
  if (p.fotoPerfil) pontos += 15;
  if (p.descricao && p.descricao.length > 40) pontos += 15;
  if (p.servicos) pontos += 15;
  if (p.categoria && p.profissao) pontos += 15;
  if (p.cidade && p.bairro) pontos += 10;
  if (p.whatsapp) pontos += 10;
  if (Array.isArray(p.fotosTrabalhos) && p.fotosTrabalhos.length > 0) pontos += 10;
  return Math.min(100, pontos);
}

async function carregarProfissionais() {
  const profissionais = await apiFetch("/api/profissionais");
  profissionaisCache = ordenarProfissionaisPorPlano(profissionais);
  return profissionaisCache;
}

async function carregarProfissionalPorId(id) {
  return apiFetch(`/api/profissionais/${id}`);
}


function normalizarPlanoNome(plano) {
  return normalizarTextoNorteServic(plano || "Gratuito");
}

function planoEstaAtivo(p) {
  return normalizarTextoNorteServic(p?.planoStatus || "ativo") === "ativo";
}

function planoRankNorteServic(p) {
  if (!p || !planoEstaAtivo(p)) return 0;

  const plano = normalizarPlanoNome(p.planoAtual);

  if (plano.includes("premium") || plano.includes("top")) return 3;
  if (plano.includes("profissional") || plano.includes("plus")) return 2;
  if (plano.includes("destaque") || plano.includes("essencial")) return 1;

  return 0;
}

function profissionalTemPlanoPago(p) {
  return planoRankNorteServic(p) > 0;
}

function seloPlanoTexto(p) {
  const rank = planoRankNorteServic(p);
  const plano = p?.planoAtual || "Gratuito";

  if (rank === 3) return "Top";
  if (rank === 2) return "Pro";
  if (rank === 1) return "Destaque";
  return plano;
}

function seloVerificadoPlanoHTML(p, modo = "card") {
  if (!p) return "";

  if (!profissionalTemPlanoPago(p)) {
    if (p.verificado) {
      return `<span class="selo-plano-verificado verificado ${modo}" title="Profissional verificado pela Norte Servic">✓</span>`;
    }

    return "";
  }

  const texto = seloPlanoTexto(p);
  const classe = planoRankNorteServic(p) === 3 ? "premium" : planoRankNorteServic(p) === 2 ? "profissional" : "destaque";

  return `<span class="selo-plano-verificado ${classe} ${modo}" title="Plano ${p.planoAtual || texto} ativo">✓ ${texto}</span>`;
}

function ordenarProfissionaisPorPlano(lista = []) {
  return [...lista].sort((a, b) => {
    const rankA = planoRankNorteServic(a);
    const rankB = planoRankNorteServic(b);

    if (rankB !== rankA) return rankB - rankA;

    const avaliacoesB = Number(b.avaliacoes || 0);
    const avaliacoesA = Number(a.avaliacoes || 0);

    if (avaliacoesB !== avaliacoesA) return avaliacoesB - avaliacoesA;

    return String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR");
  });
}

/* ================================================= */
