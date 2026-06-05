/* ================================================= */
/* NORTE SERVIC - FRONTEND CONECTADO AO BACKEND/SUPABASE */
/* ================================================= */

const API_BASE = "";
const ADMIN_PASSWORD_STORAGE = "norteServicAdminPassword";
const PROF_TOKEN_STORAGE = "norteServicProfissionalToken";

/* ================================================= */
/* BASE DE PROFISSÕES, SERVIÇOS E CIDADES */
/* ================================================= */

const baseProfissoesNorteServic = [
  {
    categoria: "Construção e Reforma",
    profissoes: ["Pedreiro", "Servente", "Pintor", "Eletricista", "Encanador", "Gesseiro", "Azulejista", "Carpinteiro", "Marceneiro", "Serralheiro", "Telhadista", "Mestre de obras", "Montador de móveis", "Vidraceiro", "Instalador de forro"],
    palavras: ["obra", "reforma", "construção", "casa", "parede", "piso", "banheiro", "cozinha", "pintura", "reboco", "cimento", "telhado", "instalação", "calçada", "acabamento", "forro", "porta", "janela"]
  },
  {
    categoria: "Casa e Manutenção",
    profissoes: ["Diarista", "Faxineira", "Jardineiro", "Piscineiro", "Dedetizador", "Chaveiro", "Técnico de ar-condicionado", "Técnico de geladeira", "Técnico de máquina de lavar", "Técnico de fogão", "Técnico de eletrônicos", "Instalador de antena", "Instalador de internet"],
    palavras: ["limpeza", "faxina", "manutenção", "conserto", "instalação", "casa", "quintal", "jardim", "ar-condicionado", "geladeira", "máquina", "fogão", "chave", "antena", "internet", "dedetização", "piscina"]
  },
  {
    categoria: "Beleza e Estética",
    profissoes: ["Manicure", "Pedicure", "Cabeleireiro", "Barbeiro", "Maquiadora", "Designer de sobrancelhas", "Lash designer", "Depiladora", "Trancista", "Massoterapeuta", "Esteticista", "Nail designer"],
    palavras: ["unha", "unhas", "cabelo", "barba", "maquiagem", "sobrancelha", "cílios", "depilação", "estética", "beleza", "massagem", "alongamento", "fibra", "gel", "escova", "corte"]
  },
  {
    categoria: "Saúde e Bem-estar",
    profissoes: ["Personal trainer", "Nutricionista", "Fisioterapeuta", "Psicólogo", "Cuidador de idosos", "Técnico de enfermagem", "Massoterapeuta", "Instrutor de pilates", "Professor de dança"],
    palavras: ["saúde", "treino", "dieta", "fisioterapia", "terapia", "cuidado", "idoso", "enfermagem", "bem-estar", "exercício", "pilates", "dança", "massagem", "acompanhamento"]
  },
  {
    categoria: "Automotivo",
    profissoes: ["Mecânico", "Borracheiro", "Eletricista automotivo", "Lavador de carros", "Polidor automotivo", "Funileiro", "Pintor automotivo", "Instalador de som automotivo", "Chaveiro automotivo", "Guincho"],
    palavras: ["carro", "moto", "pneu", "motor", "bateria", "som", "lavagem", "polimento", "funilaria", "pintura", "guincho", "óleo", "freio", "injeção", "ar automotivo"]
  },
  {
    categoria: "Tecnologia e Serviços Digitais",
    profissoes: ["Designer gráfico", "Social media", "Editor de vídeo", "Fotógrafo", "Filmaker", "Técnico de informática", "Desenvolvedor de sites", "Gestor de tráfego", "Criador de identidade visual", "Digitador", "Suporte técnico"],
    palavras: ["arte", "logo", "logotipo", "identidade visual", "vídeo", "foto", "edição", "computador", "site", "instagram", "anúncio", "tráfego", "social media", "design", "cartão", "convite", "banner", "reels"]
  },
  {
    categoria: "Eventos e Festas",
    profissoes: ["Fotógrafo", "Filmaker", "Decorador", "Cerimonialista", "Garçom", "Churrasqueiro", "Cozinheira", "Boleira", "Salgadeira", "DJ", "Locutor", "Equipe de som", "Iluminador", "Aluguel de mesas e cadeiras"],
    palavras: ["festa", "aniversário", "casamento", "evento", "decoração", "bolo", "salgado", "churrasco", "som", "foto", "vídeo", "iluminação", "garçom", "cerimonial", "mesas", "cadeiras"]
  },
  {
    categoria: "Alimentação",
    profissoes: ["Confeiteira", "Salgadeira", "Marmitaria", "Cozinheira", "Churrasqueiro", "Pizzaiolo", "Doceira", "Vendedor de comida", "Lancheiro"],
    palavras: ["bolo", "salgado", "marmita", "comida", "almoço", "jantar", "churrasco", "doce", "lanche", "pizza", "torta", "brigadeiro", "festa", "refeição"]
  },
  {
    categoria: "Serviços Rurais",
    profissoes: ["Tratorista", "Vaqueiro", "Diarista rural", "Operador de máquina", "Roçador", "Cercador", "Trabalhador rural", "Técnico agrícola", "Aplicador de veneno", "Motorista rural"],
    palavras: ["fazenda", "chácara", "roça", "gado", "cerca", "trator", "máquina", "pasto", "plantio", "rural", "roçagem", "veneno", "agricultura", "boi"]
  },
  {
    categoria: "Serviços Empresariais",
    profissoes: ["Contador", "Advogado", "Consultor", "Despachante", "Corretor", "Técnico de segurança do trabalho", "Auxiliar administrativo", "Vendedor", "Representante comercial"],
    palavras: ["empresa", "documento", "contrato", "contabilidade", "imposto", "consultoria", "venda", "administração", "segurança do trabalho", "declaração", "regularização", "jurídico", "processo"]
  }
];

const servicosPorProfissaoNorteServic = {
  "Pedreiro": ["Reforma", "Piso", "Reboco", "Calçada", "Banheiro", "Cozinha", "Construção", "Parede", "Acabamento", "Pequenos reparos"],
  "Servente": ["Auxílio em obra", "Mistura de massa", "Limpeza de obra", "Carregamento de material", "Apoio em construção", "Apoio em reforma"],
  "Pintor": ["Pintura residencial", "Pintura comercial", "Textura", "Massa corrida", "Grafiato", "Pintura externa", "Pintura interna", "Retoque"],
  "Eletricista": ["Instalação elétrica", "Tomadas", "Chuveiro", "Disjuntor", "Lâmpadas", "Ventilador", "Padrão de energia", "Manutenção elétrica", "Curto-circuito"],
  "Encanador": ["Vazamento", "Caixa d’água", "Torneira", "Descarga", "Tubulação", "Banheiro", "Cozinha", "Esgoto", "Instalação hidráulica"],
  "Gesseiro": ["Forro de gesso", "Moldura", "Sanca", "Parede de drywall", "Reparo em gesso", "Acabamento em gesso"],
  "Azulejista": ["Assentamento de piso", "Assentamento de revestimento", "Porcelanato", "Cerâmica", "Banheiro", "Cozinha", "Acabamento"],
  "Marceneiro": ["Móveis planejados", "Guarda-roupa", "Armário", "Painel", "Porta", "Prateleira", "Reparo em móveis"],
  "Serralheiro": ["Portão", "Grade", "Estrutura metálica", "Corrimão", "Solda", "Reparo em ferro", "Cobertura metálica"],
  "Telhadista": ["Telhado", "Goteira", "Troca de telha", "Madeiramento", "Cobertura", "Calha", "Reparo em telhado"],
  "Montador de móveis": ["Montagem de guarda-roupa", "Montagem de cama", "Montagem de painel", "Montagem de mesa", "Desmontagem de móveis", "Instalação de móveis"],
  "Diarista": ["Faxina residencial", "Limpeza pós-obra", "Organização", "Limpeza pesada", "Limpeza de banheiro", "Limpeza de cozinha", "Passar roupa"],
  "Faxineira": ["Faxina residencial", "Limpeza pesada", "Limpeza pós-obra", "Organização", "Limpeza de banheiro", "Limpeza de cozinha"],
  "Jardineiro": ["Corte de grama", "Poda", "Limpeza de quintal", "Jardinagem", "Plantio", "Manutenção de jardim"],
  "Técnico de ar-condicionado": ["Instalação de ar-condicionado", "Limpeza de ar-condicionado", "Manutenção", "Carga de gás", "Conserto", "Desinstalação", "Higienização"],
  "Técnico de geladeira": ["Conserto de geladeira", "Troca de borracha", "Manutenção", "Carga de gás", "Freezer", "Refrigerador"],
  "Técnico de máquina de lavar": ["Conserto de máquina", "Manutenção", "Troca de peça", "Instalação", "Máquina não centrifuga", "Máquina vazando"],
  "Manicure": ["Unha simples", "Pedicure", "Alongamento", "Fibra", "Gel", "Blindagem", "Decoração", "Esmaltação"],
  "Pedicure": ["Pedicure simples", "Spa dos pés", "Esmaltação", "Cutilagem", "Tratamento dos pés"],
  "Cabeleireiro": ["Corte feminino", "Corte masculino", "Escova", "Progressiva", "Coloração", "Hidratação", "Luzes", "Penteado"],
  "Barbeiro": ["Corte masculino", "Barba", "Sobrancelha", "Degradê", "Pigmentação", "Acabamento"],
  "Maquiadora": ["Maquiagem social", "Maquiagem para festa", "Maquiagem para noiva", "Produção", "Maquiagem artística", "Atendimento a domicílio"],
  "Designer de sobrancelhas": ["Design de sobrancelhas", "Henna", "Micropigmentação", "Limpeza", "Sobrancelha masculina", "Retoque"],
  "Lash designer": ["Extensão de cílios", "Volume brasileiro", "Volume russo", "Manutenção", "Remoção de cílios", "Lash lifting"],
  "Designer gráfico": ["Logo", "Identidade visual", "Arte para Instagram", "Cartão de visita", "Banner", "Convite digital", "Panfleto", "Posts para redes sociais"],
  "Social media": ["Gestão de Instagram", "Criação de conteúdo", "Calendário de postagens", "Legendas", "Planejamento", "Posts", "Reels"],
  "Editor de vídeo": ["Vídeo para Instagram", "Reels", "Vídeo institucional", "Cortes de vídeo", "Legenda em vídeo", "Edição para YouTube"],
  "Fotógrafo": ["Fotos de evento", "Ensaio fotográfico", "Fotos profissionais", "Fotos para comércio", "Aniversário", "Casamento", "Batizado"],
  "Filmaker": ["Vídeo de evento", "Vídeo institucional", "Filmagem", "Reels", "Casamento", "Aniversário", "Edição de vídeo"],
  "Técnico de informática": ["Formatação", "Limpeza de computador", "Instalação de programas", "Manutenção", "Notebook", "Computador lento", "Backup"],
  "Desenvolvedor de sites": ["Site institucional", "Landing page", "Loja virtual", "Página profissional", "Manutenção de site", "Sistema web"],
  "Gestor de tráfego": ["Anúncios no Instagram", "Anúncios no Facebook", "Google Ads", "Campanhas", "Tráfego pago", "Captação de clientes"],
  "Mecânico": ["Motor", "Freio", "Suspensão", "Troca de óleo", "Revisão", "Injeção eletrônica", "Manutenção preventiva"],
  "Borracheiro": ["Troca de pneu", "Remendo", "Calibragem", "Pneu furado", "Alinhamento", "Balanceamento"],
  "Eletricista automotivo": ["Bateria", "Som automotivo", "Farol", "Parte elétrica", "Vidro elétrico", "Trava elétrica", "Diagnóstico"],
  "Confeiteira": ["Bolo personalizado", "Doces", "Tortas", "Brigadeiro", "Bolo de aniversário", "Sobremesas"],
  "Salgadeira": ["Salgados para festa", "Coxinha", "Risole", "Pastel", "Empada", "Kibe", "Encomendas"],
  "Churrasqueiro": ["Churrasco para evento", "Espetinho", "Almoço", "Jantar", "Festa", "Evento familiar"],
  "Cozinheira": ["Almoço", "Jantar", "Comida caseira", "Evento", "Marmita", "Cozinha para festa"],
  "Decorador": ["Decoração de festa", "Aniversário", "Casamento", "Painel", "Mesa decorada", "Balões", "Evento"],
  "DJ": ["Som para festa", "Aniversário", "Casamento", "Evento", "Playlist", "Iluminação"],
  "Tratorista": ["Serviço com trator", "Gradagem", "Roçagem", "Preparo de terra", "Serviço rural", "Transporte rural"],
  "Vaqueiro": ["Cuidado com gado", "Manejo", "Apartação", "Serviço em fazenda", "Diarista rural"],
  "Roçador": ["Roçagem", "Limpeza de terreno", "Limpeza de chácara", "Pasto", "Quintal", "Serviço rural"],
  "Contador": ["Abertura de MEI", "Declaração", "Imposto de renda", "Regularização", "Empresa", "Notas fiscais", "Contabilidade mensal"],
  "Advogado": ["Consulta jurídica", "Contrato", "Processo", "Direito civil", "Direito trabalhista", "Direito familiar", "Regularização"]
};

const cidadesNorteServic = [
  "Muricilândia", "Santa Fé do Araguaia", "Araguaína", "Araguanã", "Carmolândia", "Wanderlândia", "Xambioá", "Riachinho", "Ananás", "Araguatins", "Tocantinópolis", "Babaçulândia", "Filadélfia", "Nova Olinda", "Colinas do Tocantins", "Toda a região"
];

let servicosSelecionadosCadastro = [];
let cidadesSelecionadasCadastro = [];
let filtroAdminAtual = "todos";
let profissionaisCache = [];

/* ================================================= */
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
  const resposta = await fetch(API_BASE + url, {
    ...options,
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
    throw new Error(dados?.erro || dados?.mensagem || "Erro na requisição.");
  }

  return dados;
}

function getTokenProfissional() {
  return localStorage.getItem(PROF_TOKEN_STORAGE) || "";
}

function setTokenProfissional(token) {
  localStorage.setItem(PROF_TOKEN_STORAGE, token);
}

function removerTokenProfissional() {
  localStorage.removeItem(PROF_TOKEN_STORAGE);
}

function getAdminPassword() {
  return sessionStorage.getItem(ADMIN_PASSWORD_STORAGE) || "";
}

function setAdminPassword(senha) {
  sessionStorage.setItem(ADMIN_PASSWORD_STORAGE, senha);
}

function mostrarLoading(texto = "Carregando...") {
  const loading = document.getElementById("miniLoading");
  if (!loading) return;

  const p = loading.querySelector("p");
  if (p) p.innerText = texto;
  loading.classList.add("ativo");
}

function esconderLoading() {
  const loading = document.getElementById("miniLoading");
  if (loading) loading.classList.remove("ativo");
}

function criarLinkWhatsApp(numero) {
  const telefone = limparNumero(numero);
  const mensagem = encodeURIComponent("Olá! Encontrei seu perfil no Norte Servic e gostaria de solicitar um orçamento.");
  return `https://wa.me/${telefone}?text=${mensagem}`;
}

function converterImagemParaBase64(arquivo) {
  return new Promise((resolve, reject) => {
    if (!arquivo) return resolve("");
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () => reject(new Error("Erro ao carregar imagem."));
    leitor.readAsDataURL(arquivo);
  });
}

async function converterVariasImagensParaBase64(arquivos) {
  const listaArquivos = Array.from(arquivos || []);
  const imagens = [];

  for (const arquivo of listaArquivos) {
    imagens.push(await converterImagemParaBase64(arquivo));
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
  const linkWhatsApp = criarLinkWhatsApp(p.whatsapp);
  const inicial = p.nome ? p.nome.charAt(0).toUpperCase() : "?";
  const fotoCard = p.fotoPerfil ? `<img src="${p.fotoPerfil}" alt="Foto de ${p.nome}">` : `<span>${inicial}</span>`;
  const temFotosTrabalhos = Array.isArray(p.fotosTrabalhos) && p.fotosTrabalhos.length > 0;
  const cidadesTexto = formatarCidadesAtendidas(p);

  const classePlano = profissionalTemPlanoPago(p) ? ` plano-ativo plano-${seloPlanoTexto(p).toLowerCase()}` : "";
  return `
    <div class="card${classePlano}" style="animation-delay: ${index * 0.08}s">
      <div class="foto-card">${fotoCard}</div>
      <h3 class="nome-profissional-linha"><span>${p.nome}</span>${seloVerificadoPlanoHTML(p, "card")}</h3>
      <p class="profissao">${p.profissao || "Profissional"}</p>
      <p>${p.descricao || "Profissional cadastrado na Norte Servic."}</p>
      <p><strong>Atende:</strong> ${cidadesTexto}</p>
      <p><strong>Atendimento:</strong> ${p.formaAtendimento || "Não informado"}</p>
      <p>⭐ ${p.avaliacao || "Novo"} | ${p.avaliacoes || 0} avaliações</p>
      <p>⚡ Responde pelo WhatsApp</p>
      <div class="selos">
        ${profissionalTemPlanoPago(p) ? `<p class="selo-pago-card">✓ Plano ${p.planoAtual} ativo</p>` : ""}
        <p>✓ WhatsApp confirmado</p>
        <p>${temFotosTrabalhos ? "✓ Fotos reais disponíveis" : "✓ Fotos reais em análise"}</p>
        <p>${p.verificado ? "✓ Profissional verificado" : "• Aguardando verificação"}</p>
      </div>
      <div class="acoes-card">
        <a href="perfil.html?id=${p.id}">Ver detalhes</a>
        <a class="whatsapp" href="${linkWhatsApp}" target="_blank">Chamar no WhatsApp</a>
      </div>
    </div>
  `;
}

async function mostrarProfissionais(lista = null) {
  const container = document.getElementById("listaProfissionais");
  if (!container) return;

  try {
    const profissionais = ordenarProfissionaisPorPlano(lista || await carregarProfissionais());
    container.innerHTML = "";

    if (!profissionais || profissionais.length === 0) {
      container.innerHTML = `
        <div class="admin-vazio">
          <h3>Nenhum profissional encontrado</h3>
          <p>Tente buscar por outro serviço, profissão ou cidade.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = profissionais.map(cardProfissionalHTML).join("");
  } catch (error) {
    container.innerHTML = `
      <div class="admin-vazio">
        <h3>Erro ao carregar profissionais</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

async function buscarProfissionais() {
  const campo = document.getElementById("campoBusca");
  if (!campo) return;

  const termo = campo.value.trim();
  try {
    const query = termo ? `?q=${encodeURIComponent(termo)}` : "";
    const profissionais = await apiFetch(`/api/profissionais${query}`);
    mostrarProfissionais(ordenarProfissionaisPorPlano(profissionais));
  } catch (error) {
    const container = document.getElementById("listaProfissionais");
    if (container) container.innerHTML = `<div class="admin-vazio"><h3>Erro na busca</h3><p>${error.message}</p></div>`;
  }
}

function buscarCategoria(categoria) {
  const campo = document.getElementById("campoBusca");
  if (!campo) return;
  campo.value = categoria;
  buscarProfissionais();
}

function ativarBuscaComEnter() {
  const campo = document.getElementById("campoBusca");
  if (!campo) return;
  campo.addEventListener("keyup", e => {
    if (e.key === "Enter") buscarProfissionais();
  });
}

/* ================================================= */
/* CADASTRO GUIADO */
/* ================================================= */

function preencherCategoriasCadastro() {
  const selectCategoria = document.getElementById("categoria");
  if (!selectCategoria) return;

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
  if (!selectCategoria || !selectProfissao) return;

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
    .slice(0, 8);
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
  const categoriaSelecionada = document.getElementById("categoria")?.value || "";
  const dados = {
    nome: document.getElementById("nome")?.value.trim() || "",
    tipoProfissional: document.getElementById("tipoProfissional")?.value || "",
    categoria: categoriaSelecionada,
    profissao: document.getElementById("profissao")?.value || "",
    servicos: document.getElementById("servicos")?.value.trim() || "",
    palavrasChave: pegarPalavrasDaCategoria(categoriaSelecionada),
    cidade: document.getElementById("cidade")?.value.trim() || "",
    bairro: document.getElementById("bairro")?.value.trim() || "",
    atendeOutrasCidades: document.getElementById("atendeOutrasCidades")?.value || "",
    cidadesAtendidas: pegarCidadesAtendidasCadastro(),
    formaAtendimento: document.getElementById("formaAtendimento")?.value || "",
    whatsapp: limparNumero(document.getElementById("whatsapp")?.value || ""),
    instagram: document.getElementById("instagram")?.value.trim() || "",
    descricao: document.getElementById("descricao")?.value.trim() || ""
  };

  if (incluirSenha) {
    dados.senha = document.getElementById("senhaCadastro")?.value.trim() || "";
  }

  return dados;
}

function iniciarCadastroBackend() {
  const formCadastro = document.getElementById("formCadastro");
  if (!formCadastro) return;

  formCadastro.addEventListener("submit", async function(e) {
    e.preventDefault();

    const botao = formCadastro.querySelector("button[type='submit']") || formCadastro.querySelector("button");
    const textoOriginal = botao ? botao.innerText : "";
    const mensagemCadastro = document.getElementById("mensagemCadastro");
    const senhaCadastro = document.getElementById("senhaCadastro")?.value.trim() || "";
    const confirmarSenhaCadastro = document.getElementById("confirmarSenhaCadastro")?.value.trim() || "";
    const servicosSelecionados = document.getElementById("servicos")?.value.trim() || "";

    if (senhaCadastro.length < 6) {
      if (mensagemCadastro) mensagemCadastro.innerText = "Crie uma senha com pelo menos 6 caracteres.";
      return;
    }

    if (senhaCadastro !== confirmarSenhaCadastro) {
      if (mensagemCadastro) mensagemCadastro.innerText = "As senhas não conferem. Verifique e tente novamente.";
      return;
    }

    if (!servicosSelecionados) {
      if (mensagemCadastro) mensagemCadastro.innerText = "Selecione pelo menos um serviço que você realiza.";
      return;
    }

    try {
      if (botao) {
        botao.innerText = "Enviando cadastro...";
        botao.disabled = true;
      }
      mostrarLoading("Enviando cadastro...");

      const arquivoFotoPerfil = document.getElementById("fotoPerfil")?.files[0];
      const arquivosTrabalhos = document.getElementById("fotosTrabalhos")?.files;

      const dados = dadosFormularioProfissional(true);
      dados.fotoPerfil = await converterImagemParaBase64(arquivoFotoPerfil);
      dados.fotosTrabalhos = await converterVariasImagensParaBase64(arquivosTrabalhos);

      await apiFetch("/api/cadastro", {
        method: "POST",
        body: JSON.stringify(dados)
      });

      if (mensagemCadastro) mensagemCadastro.innerText = "Cadastro enviado com sucesso! Agora ele passará por análise.";

      formCadastro.reset();
      servicosSelecionadosCadastro = [];
      cidadesSelecionadasCadastro = [];
      preencherCategoriasCadastro();
      atualizarInputServicosSelecionados();
      atualizarCidadesSelecionadasVisual();
      alternarCidadesAtendidas();

      const servicosBox = document.getElementById("servicosTagsBox");
      if (servicosBox) {
        servicosBox.innerHTML = `<p class="servicos-placeholder">Selecione uma profissão para ver os serviços disponíveis.</p>`;
      }
    } catch (error) {
      if (mensagemCadastro) mensagemCadastro.innerText = error.message;
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
/* PERFIL PÚBLICO */
/* ================================================= */

async function carregarPerfilProfissional() {
  const container = document.getElementById("perfilProfissional");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  try {
    const profissional = await carregarProfissionalPorId(id);
    const linkWhatsApp = criarLinkWhatsApp(profissional.whatsapp);
    const inicial = profissional.nome ? profissional.nome.charAt(0).toUpperCase() : "?";
    const fotoPerfil = profissional.fotoPerfil ? `<img src="${profissional.fotoPerfil}" alt="Foto de ${profissional.nome}">` : inicial;
    const servicosArray = (profissional.servicos || "").split(",").map(s => s.trim()).filter(Boolean);
    const cidadesTexto = formatarCidadesAtendidas(profissional);

    const galeriaTrabalhos = Array.isArray(profissional.fotosTrabalhos) && profissional.fotosTrabalhos.length > 0
      ? `<div class="galeria-premium">${profissional.fotosTrabalhos.map(foto => `<img src="${foto}" alt="Foto de trabalho realizado por ${profissional.nome}">`).join("")}</div>`
      : `<p>Este profissional ainda não adicionou fotos dos trabalhos. Mesmo assim, você pode entrar em contato e solicitar referências.</p>`;

    container.innerHTML = `
      <a class="botao-voltar-perfil" href="index.html">← Voltar para a busca</a>
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
          <div class="perfil-hero-texto">
            <span>Perfil profissional</span>
            <h2>Conheça o trabalho de ${profissional.nome}</h2>
            <p>Veja informações, serviços realizados, área de atendimento e dados de confiança antes de entrar em contato.</p>
          </div>
          <div class="perfil-section-clean"><h2>Sobre o profissional</h2><p>${profissional.descricao}</p></div>
          <div class="perfil-section-clean"><h2>Serviços que realiza</h2><div class="servicos-premium">${servicosArray.map(s => `<span>${s}</span>`).join("")}</div></div>
          <div class="perfil-section-clean"><h2>Fotos dos trabalhos</h2>${galeriaTrabalhos}</div>
          <div class="perfil-section-clean">
            <h2>Área de atendimento</h2>
            <p><strong>Cidade principal:</strong> ${profissional.cidade}</p>
            <p><strong>Bairro:</strong> ${profissional.bairro}</p>
            <p><strong>Atende:</strong> ${cidadesTexto}</p>
            <p><strong>Forma de atendimento:</strong> ${profissional.formaAtendimento || "Não informado"}</p>
            <p><strong>Tipo:</strong> ${profissional.tipoProfissional || "Não informado"}</p>
            <p><strong>Categoria:</strong> ${profissional.categoria || "Não informada"}</p>
            <p><strong>Instagram:</strong> ${profissional.instagram || "Não informado"}</p>
          </div>
        </section>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `
      <a class="botao-voltar-perfil" href="index.html">← Voltar para a busca</a>
      <div class="perfil-conteudo"><div class="perfil-hero-texto"><span>Perfil indisponível</span><h2>Profissional não encontrado</h2><p>${error.message}</p></div></div>
    `;
  }
}

/* ================================================= */
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
      window.location.href = "painel-profissional.html";
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
  window.location.href = "login.html";
}

function exigirLoginRedirect() {
  if (!getTokenProfissional()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

async function carregarPainelProfissional() {
  const header = document.getElementById("painelProfissionalHeader");
  const resumo = document.getElementById("painelResumoProfissional");
  const status = document.getElementById("painelStatusProfissional");
  const linkPerfil = document.getElementById("linkPerfilPublico");
  const painelPlano = document.getElementById("painelPlanoProfissional");
  const painelDicas = document.getElementById("painelDicasProfissional");

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

    header.innerHTML = `<span>Painel do profissional</span><h1>Olá, ${profissional.nome}.</h1><p>Gerencie seu perfil, acompanhe sua publicação e mantenha seus dados prontos para receber clientes.</p>`;

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
          <p><strong>Plano:</strong> ${planoAtual}</p>
        </div>
        <p class="painel-descricao-preview">${profissional.descricao || "Adicione uma descrição profissional para aumentar a confiança dos clientes."}</p>
      </div>
    `;

    status.innerHTML = `
      <div class="admin-stat-card"><strong>${planoAtual}</strong><span>Plano atual</span></div>
      <div class="admin-stat-card"><strong>${planoStatus}</strong><span>Status do plano</span></div>
      <div class="admin-stat-card"><strong>${perfilDisponivel ? "Sim" : "Não"}</strong><span>Perfil publicado</span></div>
      <div class="admin-stat-card"><strong>${forcaPerfil}%</strong><span>Força do perfil</span></div>
    `;

    if (painelPlano) {
      painelPlano.innerHTML = `
        <h3>Seu destaque na Norte Servic</h3>
        <p>O plano atual é <strong>${planoAtual}</strong>. Perfis com plano de destaque podem aparecer melhor na vitrine.</p>
        <div class="painel-forca-perfil"><div style="width: ${forcaPerfil}%"></div></div>
        <p style="margin-top: 10px;">Força do perfil: <strong>${forcaPerfil}%</strong>.</p>
        <a href="planos.html" class="painel-plano-cta">Ver planos de destaque</a>
      `;
    }

    if (painelDicas) {
      painelDicas.innerHTML = `
        <h3>Melhore seu perfil</h3>
        <ul>
          <li>Use uma foto real e nítida.</li>
          <li>Selecione todos os serviços que você realmente realiza.</li>
          <li>Informe corretamente as cidades que atende.</li>
          <li>Escreva uma descrição objetiva sobre sua experiência.</li>
          <li>Mantenha o WhatsApp sempre atualizado.</li>
        </ul>
      `;
    }

    if (linkPerfil) {
      if (perfilDisponivel) {
        linkPerfil.href = `perfil.html?id=${profissional.id}`;
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
    window.location.href = "login.html";
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

  alternarCidadesAtendidas();
  atualizarCidadesSelecionadasVisual();
}

function iniciarEditarPerfil() {
  const form = document.getElementById("formEditarPerfil");
  if (!form) return;

  if (!exigirLoginRedirect()) return;

  let profissionalAtual = null;

  carregarMinhaConta()
    .then(profissional => {
      profissionalAtual = profissional;
      preencherFormularioEdicao(profissional);
    })
    .catch(() => {
      removerTokenProfissional();
      window.location.href = "login.html";
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
      dados.fotoPerfil = profissionalAtual?.fotoPerfil || "";
      dados.fotosTrabalhos = profissionalAtual?.fotosTrabalhos || [];

      await apiFetch("/api/me", {
        method: "PUT",
        headers: { Authorization: `Bearer ${getTokenProfissional()}` },
        body: JSON.stringify(dados)
      });

      if (mensagem) mensagem.innerText = "Alterações salvas. Se dados importantes mudaram, seu perfil voltou para análise.";
      setTimeout(() => window.location.href = "painel-profissional.html", 900);
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
/* ADMIN */
/* ================================================= */

function entrarAdmin() {
  const senha = document.getElementById("senhaAdmin")?.value || "";
  const erro = document.getElementById("erroSenha");

  if (!senha) {
    if (erro) erro.innerText = "Digite a senha do admin.";
    return;
  }

  setAdminPassword(senha);
  const loginAdmin = document.getElementById("loginAdmin");
  const painelAdmin = document.getElementById("painelAdmin");
  if (loginAdmin) loginAdmin.classList.add("escondido");
  if (painelAdmin) painelAdmin.classList.remove("escondido");
  mostrarAdmin();
}

function ativarEnterNoAdmin() {
  const campoSenha = document.getElementById("senhaAdmin");
  if (!campoSenha) return;
  campoSenha.addEventListener("keyup", e => {
    if (e.key === "Enter") entrarAdmin();
  });
}

function filtrarAdmin(status, botao = null) {
  filtroAdminAtual = status;
  document.querySelectorAll(".admin-filtros button").forEach(btn => btn.classList.remove("ativo"));
  if (botao) botao.classList.add("ativo");
  mostrarAdmin();
}

async function buscarAdminProfissionais() {
  return apiFetch("/api/admin/profissionais", {
    headers: { "x-admin-password": getAdminPassword() }
  });
}

async function mostrarAdmin() {
  const container = document.getElementById("listaAdmin");
  const stats = document.getElementById("adminStats");
  const buscaInput = document.getElementById("adminBusca");
  if (!container) return;

  try {
    mostrarLoading("Carregando painel...");
    const salvos = await buscarAdminProfissionais();

    const pendentes = salvos.filter(p => p.status === "pendente").length;
    const aprovados = salvos.filter(p => p.status === "aprovado").length;
    const cidadesUnicas = new Set(salvos.map(p => normalizarTextoNorteServic(p.cidade)).filter(Boolean)).size;

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
            <a class="ver-whatsapp" href="${linkWhatsApp}" target="_blank">WhatsApp</a>
            <button onclick="atualizarPlanoAdmin(${p.id})">Plano</button>
            <button class="remover" onclick="removerProfissional(${p.id})">Remover</button>
          </div>
        </div>
      `;
    }).join("");
  } catch (error) {
    container.innerHTML = `<div class="admin-vazio"><h3>Erro no painel</h3><p>${error.message}</p></div>`;
  } finally {
    esconderLoading();
  }
}

async function aprovarProfissional(id) {
  try {
    await apiFetch(`/api/admin/profissionais/${id}/aprovar`, {
      method: "PATCH",
      headers: { "x-admin-password": getAdminPassword() }
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
      headers: { "x-admin-password": getAdminPassword() }
    });
    alert("Cadastro removido.");
    mostrarAdmin();
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
      headers: { "x-admin-password": getAdminPassword() },
      body: JSON.stringify({ planoAtual, planoStatus, planoVencimento })
    });
    alert("Plano atualizado.");
    mostrarAdmin();
  } catch (error) {
    alert(error.message);
  }
}

/* ================================================= */
/* EXPERIÊNCIA / TOPO / POPUP */
/* ================================================= */

function ativarTransicoesDeClique() {
  document.addEventListener("click", function(e) {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href") || "";
    const ehWhatsapp = href.includes("wa.me");

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

function solicitarPlanoProfissional(plano, valor) {
  const mensagem = encodeURIComponent(
    `Olá! Quero contratar o plano ${plano} da Norte Servic.\n\nValor: R$ ${valor}\nNome:\nProfissão:\nCidade:\nWhatsApp do cadastro:`
  );

  window.open(`https://wa.me/5563992229673?text=${mensagem}`, "_blank");
}

/* ================================================= */
/* INICIALIZAÇÃO */
/* ================================================= */

document.addEventListener("DOMContentLoaded", function() {
  ativarTransicoesDeClique();
  ativarBuscaComEnter();
  iniciarBuscaInteligente();
  preencherCategoriasCadastro();
  ativarProfissaoServicos();
  iniciarCidadeInteligente();
  iniciarCadastroBackend();
  iniciarLoginProfissional();
  ativarEnterNoAdmin();
  ativarTopoMenorAoRolar();
  mostrarProfissionais();
  carregarPerfilProfissional();
  carregarPainelProfissional();
  iniciarEditarPerfil();
  alternarCidadesAtendidas();

  const adminBusca = document.getElementById("adminBusca");
  if (adminBusca) adminBusca.addEventListener("input", mostrarAdmin);
});

window.addEventListener("load", mostrarPopCadastro);
