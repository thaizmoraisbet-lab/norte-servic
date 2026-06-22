const CIDADE_TOKEN_KEY = 'norteServicCidadeParceiraToken';
const CIDADE_COLETOR_TOKEN_KEY = 'norteServicCidadeColetorToken';
const CIDADE_COLETOR_DADOS_KEY = 'norteServicCidadeColetorDados';
const CIDADE_WHATSAPP_SAQUE_PADRAO = '5563992472236';

const PROFISSOES_CIDADE = [
  { profissao: "Pedreiro", categoria: "Construção e Reforma", servicos: ["Construção", "Reforma", "Reboco", "Piso", "Calçada"] },
  { profissao: "Servente", categoria: "Construção e Reforma", servicos: ["Ajudante de obra", "Limpeza de obra", "Carga e descarga"] },
  { profissao: "Mestre de obras", categoria: "Construção e Reforma", servicos: ["Coordenação de obra", "Orçamento", "Acompanhamento"] },
  { profissao: "Pintor", categoria: "Construção e Reforma", servicos: ["Pintura residencial", "Textura", "Massa corrida", "Grafiato"] },
  { profissao: "Eletricista", categoria: "Elétrica", servicos: ["Instalação elétrica", "Manutenção", "Tomadas", "Padrão de energia"] },
  { profissao: "Encanador", categoria: "Hidráulica", servicos: ["Vazamento", "Caixa d’água", "Tubulação", "Instalação hidráulica"] },
  { profissao: "Gesseiro", categoria: "Construção e Reforma", servicos: ["Gesso", "Forro", "Sanca", "Acabamento"] },
  { profissao: "Drywall", categoria: "Construção e Reforma", servicos: ["Parede drywall", "Forro drywall", "Divisórias"] },
  { profissao: "Azulejista", categoria: "Construção e Reforma", servicos: ["Azulejo", "Cerâmica", "Porcelanato", "Revestimento"] },
  { profissao: "Carpinteiro", categoria: "Construção e Reforma", servicos: ["Madeiramento", "Telhado", "Forma de obra"] },
  { profissao: "Marceneiro", categoria: "Móveis e Madeira", servicos: ["Móveis", "Portas", "Armários", "Reparos em madeira"] },
  { profissao: "Serralheiro", categoria: "Metalúrgica", servicos: ["Portões", "Grades", "Estruturas metálicas", "Solda"] },
  { profissao: "Soldador", categoria: "Metalúrgica", servicos: ["Solda", "Reparo metálico", "Portões", "Grades"] },
  { profissao: "Telhadista", categoria: "Construção e Reforma", servicos: ["Telhado", "Goteira", "Calha", "Reparo de cobertura"] },
  { profissao: "Calheiro", categoria: "Construção e Reforma", servicos: ["Calhas", "Rufos", "Condutores", "Manutenção"] },
  { profissao: "Vidraceiro", categoria: "Construção e Reforma", servicos: ["Vidros", "Box", "Janelas", "Espelhos"] },
  { profissao: "Instalador de forro", categoria: "Construção e Reforma", servicos: ["Forro PVC", "Forro gesso", "Acabamento"] },
  { profissao: "Montador de móveis", categoria: "Casa e Manutenção", servicos: ["Montagem", "Desmontagem", "Reparos em móveis"] },
  { profissao: "Diarista", categoria: "Limpeza", servicos: ["Faxina", "Limpeza residencial", "Organização"] },
  { profissao: "Faxineira", categoria: "Limpeza", servicos: ["Faxina", "Limpeza pesada", "Organização"] },
  { profissao: "Doméstica", categoria: "Limpeza", servicos: ["Limpeza da casa", "Organização", "Cozinha básica"] },
  { profissao: "Lavadeira", categoria: "Limpeza", servicos: ["Lavar roupas", "Passar roupas", "Organização"] },
  { profissao: "Passadeira", categoria: "Limpeza", servicos: ["Passar roupas", "Organização de peças"] },
  { profissao: "Jardineiro", categoria: "Limpeza e Jardim", servicos: ["Roçagem", "Poda", "Limpeza de quintal", "Jardinagem"] },
  { profissao: "Horteiro", categoria: "Rural e Quintal", servicos: ["Plantio de horta", "Cuidado com canteiros", "Colheita", "Irrigação"] },
  { profissao: "Capinador", categoria: "Limpeza e Jardim", servicos: ["Capina manual", "Limpeza de quintal", "Limpeza de lote", "Retirada de mato"] },
  { profissao: "Roçador", categoria: "Limpeza e Jardim", servicos: ["Roçagem", "Limpeza de lote", "Capina"] },
  { profissao: "Podador de árvores", categoria: "Limpeza e Jardim", servicos: ["Poda", "Limpeza de galhos", "Manutenção de árvores"] },
  { profissao: "Limpador de lote", categoria: "Limpeza e Jardim", servicos: ["Limpeza de terreno", "Retirada de entulho leve", "Capina", "Roçagem"] },
  { profissao: "Piscineiro", categoria: "Casa e Manutenção", servicos: ["Limpeza de piscina", "Tratamento de água", "Manutenção"] },
  { profissao: "Dedetizador", categoria: "Casa e Manutenção", servicos: ["Dedetização", "Controle de pragas", "Limpeza técnica"] },
  { profissao: "Chaveiro", categoria: "Casa e Manutenção", servicos: ["Cópia de chave", "Abertura de fechadura", "Troca de segredo"] },
  { profissao: "Marido de aluguel", categoria: "Casa e Manutenção", servicos: ["Pequenos reparos", "Instalação", "Manutenção doméstica"] },
  { profissao: "Técnico de ar-condicionado", categoria: "Casa e Manutenção", servicos: ["Instalação", "Limpeza", "Manutenção", "Carga de gás"] },
  { profissao: "Técnico de geladeira", categoria: "Casa e Manutenção", servicos: ["Conserto de geladeira", "Freezer", "Manutenção"] },
  { profissao: "Técnico de máquina de lavar", categoria: "Casa e Manutenção", servicos: ["Conserto", "Instalação", "Manutenção"] },
  { profissao: "Técnico de celular", categoria: "Tecnologia", servicos: ["Troca de tela", "Formatação", "Manutenção", "Acessórios"] },
  { profissao: "Técnico de computador", categoria: "Tecnologia", servicos: ["Formatação", "Manutenção", "Rede", "Instalação de programas"] },
  { profissao: "Instalador de internet", categoria: "Tecnologia", servicos: ["Roteador", "Cabo de rede", "Wi-Fi", "Configuração"] },
  { profissao: "Instalador de câmera", categoria: "Segurança", servicos: ["Câmeras", "DVR", "Monitoramento", "Cerca elétrica"] },
  { profissao: "Manicure", categoria: "Beleza", servicos: ["Unhas", "Pé e mão", "Unha em gel"] },
  { profissao: "Pedicure", categoria: "Beleza", servicos: ["Pé", "Mão", "Cuidados com unhas"] },
  { profissao: "Nail designer", categoria: "Beleza", servicos: ["Alongamento", "Fibra", "Gel", "Decoração"] },
  { profissao: "Cabeleireiro", categoria: "Beleza", servicos: ["Corte", "Escova", "Coloração", "Progressiva"] },
  { profissao: "Cabeleireira", categoria: "Beleza", servicos: ["Corte", "Escova", "Coloração", "Progressiva"] },
  { profissao: "Barbeiro", categoria: "Beleza", servicos: ["Corte masculino", "Barba", "Sobrancelha"] },
  { profissao: "Maquiadora", categoria: "Beleza", servicos: ["Maquiagem social", "Maquiagem para eventos", "Design"] },
  { profissao: "Designer de sobrancelhas", categoria: "Beleza", servicos: ["Sobrancelha", "Design", "Henna"] },
  { profissao: "Depiladora", categoria: "Beleza", servicos: ["Depilação", "Cuidados estéticos"] },
  { profissao: "Trancista", categoria: "Beleza", servicos: ["Tranças", "Penteados", "Mega hair"] },
  { profissao: "Costureira", categoria: "Serviços Gerais", servicos: ["Ajustes", "Consertos", "Confecção"] },
  { profissao: "Bordadeira", categoria: "Artesanato e Produção", servicos: ["Bordado", "Costura manual", "Peças personalizadas"] },
  { profissao: "Artesão", categoria: "Artesanato e Produção", servicos: ["Artesanato", "Peças manuais", "Decoração"] },
  { profissao: "Cozinheira", categoria: "Alimentação", servicos: ["Comida caseira", "Marmita", "Eventos pequenos"] },
  { profissao: "Confeiteira", categoria: "Alimentação", servicos: ["Bolos", "Doces", "Salgados"] },
  { profissao: "Salgadeira", categoria: "Alimentação", servicos: ["Salgados", "Encomendas", "Festas"] },
  { profissao: "Padeiro", categoria: "Alimentação", servicos: ["Pães", "Bolos", "Produção artesanal"] },
  { profissao: "Churrasqueiro", categoria: "Alimentação", servicos: ["Churrasco", "Eventos", "Assados"] },
  { profissao: "Dono de boteco", categoria: "Comércio Local", servicos: ["Bar", "Bebidas", "Petiscos", "Atendimento local"] },
  { profissao: "Bar e lanchonete", categoria: "Comércio Local", servicos: ["Lanches", "Bebidas", "Atendimento local"] },
  { profissao: "Restaurante", categoria: "Comércio Local", servicos: ["Refeições", "Marmitas", "Comida caseira"] },
  { profissao: "Comerciante", categoria: "Comércio Local", servicos: ["Comércio varejista", "Venda local", "Atendimento ao público"] },
  { profissao: "Mercearia", categoria: "Comércio Local", servicos: ["Alimentos", "Bebidas", "Produtos de casa"] },
  { profissao: "Sacoleira", categoria: "Comércio Local", servicos: ["Roupas", "Acessórios", "Venda por encomenda"] },
  { profissao: "Vendedor ambulante", categoria: "Comércio Local", servicos: ["Venda ambulante", "Produtos variados", "Atendimento local"] },
  { profissao: "Feirante", categoria: "Comércio Local", servicos: ["Venda em feira", "Hortifruti", "Produtos locais"] },
  { profissao: "Dono de comércio", categoria: "Comércio Local", servicos: ["Loja", "Vendas", "Atendimento local"] },
  { profissao: "Mecânico", categoria: "Automotivo", servicos: ["Manutenção", "Troca de peças", "Revisão"] },
  { profissao: "Mecânico de moto", categoria: "Automotivo", servicos: ["Manutenção de moto", "Revisão", "Peças"] },
  { profissao: "Borracheiro", categoria: "Automotivo", servicos: ["Troca de pneu", "Conserto de pneu", "Calibragem"] },
  { profissao: "Lava-jato", categoria: "Automotivo", servicos: ["Lavagem simples", "Lavagem completa", "Higienização"] },
  { profissao: "Funileiro", categoria: "Automotivo", servicos: ["Funilaria", "Pintura automotiva", "Reparos"] },
  { profissao: "Mototaxista", categoria: "Transporte", servicos: ["Corrida urbana", "Entrega rápida"] },
  { profissao: "Entregador", categoria: "Transporte", servicos: ["Entrega local", "Motoboy", "Retirada de encomenda"] },
  { profissao: "Motorista particular", categoria: "Transporte", servicos: ["Viagens", "Corridas", "Transporte local"] },
  { profissao: "Freteiro", categoria: "Transporte", servicos: ["Frete local", "Mudança pequena", "Carga"] },
  { profissao: "Carroceiro", categoria: "Transporte", servicos: ["Frete local", "Retirada de entulho leve", "Transporte de materiais"] },
  { profissao: "Trabalhador rural", categoria: "Rural e Fazenda", servicos: ["Serviço rural", "Plantio", "Colheita", "Cuidado com animais"] },
  { profissao: "Vaqueiro", categoria: "Rural e Fazenda", servicos: ["Manejo de gado", "Cuidado com animais", "Serviço em fazenda"] },
  { profissao: "Tratorista", categoria: "Rural e Fazenda", servicos: ["Serviço com trator", "Gradagem", "Roçagem mecanizada"] },
  { profissao: "Caseiro", categoria: "Rural e Fazenda", servicos: ["Cuidado de chácara", "Manutenção de quintal", "Vigia de propriedade"] },
  { profissao: "Ajudante geral", categoria: "Serviços Gerais", servicos: ["Carga e descarga", "Serviços avulsos", "Apoio em obra", "Limpeza"] },
  { profissao: "Cuidador de idosos", categoria: "Cuidados", servicos: ["Acompanhamento", "Cuidados diários", "Plantão"] },
  { profissao: "Cuidador infantil", categoria: "Cuidados", servicos: ["Cuidado infantil", "Acompanhamento", "Apoio familiar"] },
  { profissao: "Professor particular", categoria: "Educação", servicos: ["Aulas particulares", "Reforço escolar", "Acompanhamento"] },
  { profissao: "Babá", categoria: "Cuidados", servicos: ["Cuidado infantil", "Acompanhamento", "Rotina da criança"] },
  { profissao: "Fotógrafo", categoria: "Eventos e Comunicação", servicos: ["Fotos", "Eventos", "Ensaios"] },
  { profissao: "Decorador de eventos", categoria: "Eventos e Comunicação", servicos: ["Decoração", "Festa", "Montagem"] },
  { profissao: "Diarista de evento", categoria: "Eventos e Comunicação", servicos: ["Limpeza de evento", "Apoio", "Organização"] },
  { profissao: "Locutor", categoria: "Eventos e Comunicação", servicos: ["Locução", "Som", "Eventos"] },
  { profissao: "Outra profissão", categoria: "", servicos: [] }
];

function $(id) { return document.getElementById(id); }

function paginaCidadeAtual() {
  return document.body?.dataset?.cidadePage || '';
}

function tokenCidade() {
  return sessionStorage.getItem(CIDADE_TOKEN_KEY) || '';
}

function tokenColetorCidade() {
  return sessionStorage.getItem(CIDADE_COLETOR_TOKEN_KEY) || '';
}

function dadosColetorCidade() {
  try { return JSON.parse(sessionStorage.getItem(CIDADE_COLETOR_DADOS_KEY) || '{}'); }
  catch (_) { return {}; }
}

function travarTelaCidadeLoading() {
  const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
  if (!document.body?.dataset.nsCidadeLoadingTravado) {
    document.body.dataset.nsCidadeLoadingScrollY = String(scrollY);
    document.body.dataset.nsCidadeLoadingTravado = "true";
  }

  document.documentElement.classList.add('loading-travado');
  document.body?.classList.add('loading-travado');

  // Mantém o carregamento preso ao viewport atual, sem jogar para o topo.
  document.documentElement.style.overflow = 'hidden';
  if (document.body) {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  }

  requestAnimationFrame(() => {
    const ativos = document.querySelectorAll('.mini-loading.ativo, .ns-page-loader.ativo');
    ativos.forEach((loader) => {
      loader.style.position = 'fixed';
      loader.style.inset = '0';
      loader.style.top = '0';
      loader.style.left = '0';
      loader.style.width = '100vw';
      loader.style.height = '100dvh';
    });
  });
}

function liberarTelaCidadeLoading() {
  const scrollY = Number(document.body?.dataset.nsCidadeLoadingScrollY || 0);

  document.documentElement.classList.remove('loading-travado');
  document.body?.classList.remove('loading-travado');

  document.documentElement.style.overflow = '';
  if (document.body) {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    delete document.body.dataset.nsCidadeLoadingTravado;
    delete document.body.dataset.nsCidadeLoadingScrollY;
  }

  if (scrollY > 0) window.scrollTo(0, scrollY);
}

function moverLoadingCidadeParaBody(loading) {
  if (!loading || !document.body) return loading;
  if (loading.parentElement !== document.body) document.body.appendChild(loading);
  return loading;
}

function esconderLoadingCidade() {
  const loading = $('miniLoading');
  if (loading) loading.classList.remove('ativo');
  const ativos = document.querySelectorAll('.mini-loading.ativo, .ns-page-loader.ativo:not(.saindo)');
  if (!ativos.length) liberarTelaCidadeLoading();
}

function mostrarTransicaoCidade(texto = 'Carregando Cidade Parceira...') {
  let loader = document.querySelector('.ns-page-loader.cidade-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.className = 'ns-page-loader cidade-loader ativo';
    loader.innerHTML = `
      <div class="ns-loader-card">
        <div class="ns-loader-logo" aria-hidden="true"><span>✓</span></div>
        <strong>Norte Servic</strong>
        <p>${texto}</p>
        <div class="ns-loader-bar"><span></span></div>
      </div>
    `;
    document.body.appendChild(loader);
  }
  moverLoadingCidadeParaBody(loader);
  const p = loader.querySelector('p');
  if (p) p.textContent = texto;
  loader.classList.remove('saindo');
  travarTelaCidadeLoading();
  loader.classList.add('ativo');
}

function fecharTransicaoCidade(delay = 280) {
  const loader = document.querySelector('.ns-page-loader.cidade-loader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('saindo');
    setTimeout(() => {
      loader.remove();
      const ativos = document.querySelectorAll('.mini-loading.ativo, .ns-page-loader.ativo:not(.saindo)');
      if (!ativos.length) liberarTelaCidadeLoading();
    }, 420);
  }, delay);
}

function navegarCidade(url, texto = 'Abrindo Cidade Parceira...') {
  document.body?.classList.add('cidade-page-saindo');
  mostrarTransicaoCidade(texto);
  setTimeout(() => { window.location.href = url; }, 450);
}

function ativarBotaoCidade(botao, texto = 'Carregando...') {
  if (!botao) return '';
  const original = botao.innerHTML;
  botao.disabled = true;
  botao.classList.add('cidade-btn-loading');
  botao.innerHTML = `<span class="spinner-botao"></span><span>${texto}</span>`;
  return original;
}

function restaurarBotaoCidade(botao, original) {
  if (!botao) return;
  botao.disabled = false;
  botao.classList.remove('cidade-btn-loading');
  if (original) botao.innerHTML = original;
}

function mostrarToastCidade(texto, tipo = 'ok') {
  const toast = $('cidadeToast');
  if (!toast) return;
  toast.textContent = texto;
  toast.className = `cidade-toast ativo ${tipo}`;
  setTimeout(() => toast.classList.remove('ativo'), 3200);
}

async function cidadeFetch(path, options = {}, usarTokenColetor = false) {
  const token = usarTokenColetor ? tokenColetorCidade() : tokenCidade();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const resposta = await fetch(path, { ...options, headers });
  const texto = await resposta.text();
  let dados = {};
  try { dados = texto ? JSON.parse(texto) : {}; } catch (_) { dados = { erro: texto }; }

  if (!resposta.ok) {
    throw new Error(dados.erro || dados.detalhe || 'Erro na solicitação.');
  }

  return dados;
}

async function entrarCidadeParceira() {
  const senha = $('senhaCidade')?.value.trim() || '';
  const erro = $('erroCidade');
  const botao = $('btnEntrarCidade');
  if (erro) erro.textContent = '';

  if (!senha) {
    if (erro) erro.textContent = 'Digite a senha para continuar.';
    $('senhaCidade')?.focus();
    return;
  }

  const original = ativarBotaoCidade(botao, 'Validando...');
  mostrarTransicaoCidade('Validando senha e abrindo a home...');

  try {
    const dados = await cidadeFetch('/api/cidade/login', {
      method: 'POST',
      body: JSON.stringify({ senha })
    });
    sessionStorage.setItem(CIDADE_TOKEN_KEY, dados.token);
    setTimeout(() => { window.location.href = 'home.html'; }, 520);
  } catch (error) {
    fecharTransicaoCidade(0);
    restaurarBotaoCidade(botao, original);
    if (erro) erro.textContent = error.message;
  }
}

function sairCidadeParceira() {
  sessionStorage.removeItem(CIDADE_TOKEN_KEY);
  sessionStorage.removeItem(CIDADE_COLETOR_TOKEN_KEY);
  sessionStorage.removeItem(CIDADE_COLETOR_DADOS_KEY);
  navegarCidade('index.html', 'Saindo da Cidade Parceira...');
}

function protegerPaginaCidade() {
  const pagina = paginaCidadeAtual();
  if ((pagina === 'home' || pagina === 'profissionais' || pagina === 'coletor') && !tokenCidade()) {
    navegarCidade('index.html', 'Acesso privado. Informe a senha...');
    return false;
  }

  if (pagina === 'login' && tokenCidade()) {
    navegarCidade('home.html', 'Acesso já liberado. Abrindo home...');
    return false;
  }

  return true;
}

function animarNumeroCidade(el, valor) {
  if (!el) return;
  const alvo = Number(valor || 0);
  let atual = 0;
  const passo = Math.max(1, Math.ceil(alvo / 45));
  const timer = setInterval(() => {
    atual += passo;
    if (atual >= alvo) { atual = alvo; clearInterval(timer); }
    el.textContent = atual.toLocaleString('pt-BR');
  }, 18);
}

async function carregarResumoCidade() {
  try {
    const resumo = await cidadeFetch('/api/cidade/resumo');
    animarNumeroCidade($('cidadeTotalProfissionais'), resumo.totalProfissionais || 0);
    animarNumeroCidade($('cidadeCategorias'), resumo.categoriasMapeadas || 0);
    animarNumeroCidade($('cidadeSetores'), 3);
    animarNumeroCidade($('cidadeAceitosSite'), resumo.aceitosSite || 0);

    const setoresFixos = resumo.setoresFixos || ['Nova Canaã', 'Nova Muricilândia', 'Centro'];
    const porSetor = resumo.porSetor || [];
    const listaSetores = $('cidadeSetoresLista');
    if (listaSetores) {
      listaSetores.innerHTML = setoresFixos.map((setor) => {
        const item = porSetor.find((s) => s.setor === setor) || { total: 0 };
        return `<div class="cidade-setor-item cidade-card-transicao"><span>${setor}</span><strong>${Number(item.total || 0)}</strong></div>`;
      }).join('');
      aplicarAnimacoesCidade(listaSetores);
    }

    const ranking = $('cidadeRankingProfissoes');
    if (ranking) {
      const top = resumo.topProfissoes || [];
      ranking.innerHTML = top.length
        ? top.map((item, index) => `<div class="cidade-ranking-item cidade-card-transicao"><span>${index + 1}. ${item.profissao}</span><strong>${item.total}</strong></div>`).join('')
        : '<p class="cidade-vazio">Nenhuma profissão coletada ainda.</p>';
      aplicarAnimacoesCidade(ranking);
    }
  } catch (error) {
    const setores = $('cidadeSetoresLista');
    if (setores) setores.innerHTML = `<p class="cidade-msg erro">${error.message}</p>`;
  }
}

async function entrarColetorCidade() {
  const email = $('emailColetor')?.value.trim() || '';
  const senha = $('senhaColetor')?.value.trim() || '';
  const erro = $('erroColetor');
  const botao = $('btnEntrarColetor');
  if (erro) erro.textContent = '';

  if (!email || !senha) {
    if (erro) erro.textContent = 'Informe o e-mail e a senha do coletor.';
    return;
  }

  const original = ativarBotaoCidade(botao, 'Entrando...');
  mostrarTransicaoCidade('Conectando coletor ao setor...');

  try {
    const dados = await cidadeFetch('/api/cidade/coletor/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });
    sessionStorage.setItem(CIDADE_COLETOR_TOKEN_KEY, dados.token);
    sessionStorage.setItem(CIDADE_COLETOR_DADOS_KEY, JSON.stringify(dados.coletor));
    prepararColetorCidade();
    fecharTransicaoCidade(380);
    mostrarToastCidade('Coletor conectado. Questionário liberado.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => $('nomeColetaCidade')?.focus(), 450);
  } catch (error) {
    fecharTransicaoCidade(0);
    if (erro) erro.textContent = error.message;
  } finally {
    restaurarBotaoCidade(botao, original);
  }
}

function sairColetorCidade() {
  sessionStorage.removeItem(CIDADE_COLETOR_TOKEN_KEY);
  sessionStorage.removeItem(CIDADE_COLETOR_DADOS_KEY);
  prepararColetorCidade();
  mostrarToastCidade('Coletor desconectado.');
}

function prepararColetorCidade() {
  const loginBox = $('coletorLoginBox');
  const painelBox = $('coletorPainelBox');
  if (!loginBox || !painelBox) return;

  const temToken = Boolean(tokenColetorCidade());
  loginBox.classList.toggle('escondido', temToken);
  painelBox.classList.toggle('escondido', !temToken);
  animarTrocaPainelCidade(temToken ? painelBox : loginBox);
  aplicarAnimacoesCidade(temToken ? painelBox : loginBox);

  if (temToken) {
    const coletor = dadosColetorCidade();
    if ($('coletorNomeTitulo')) $('coletorNomeTitulo').textContent = coletor.nome || 'Coletor conectado';
    if ($('coletorSetorTitulo')) $('coletorSetorTitulo').textContent = coletor.setor || '---';
    if ($('cidadeSucessoColeta')) $('cidadeSucessoColeta').classList.add('escondido');
    carregarMinhasColetasCidade();
    carregarComissaoColetorCidade();
  }
}

async function carregarMinhasColetasCidade() {
  const lista = $('listaMinhasColetas');
  if (!lista || !tokenColetorCidade()) return;

  lista.innerHTML = '<div class="cidade-mini-loader-lista"><span></span> Atualizando últimos cadastros...</div>';

  try {
    const coletas = await cidadeFetch('/api/cidade/coleta/minhas', {}, true);
    lista.innerHTML = coletas.length
      ? coletas.map((item) => `
        <div class="cidade-coleta-item cidade-card-transicao">
          <div><strong>${item.nome}</strong><span>${item.profissao} • ${item.setor}</span></div>
          <small>${item.aceitaSite ? 'Publicado no site oficial' : 'Somente relatório'}</small>
        </div>
      `).join('')
      : '<p class="cidade-vazio">Nenhum cadastro feito por este coletor ainda.</p>';
    aplicarAnimacoesCidade(lista);
  } catch (error) {
    lista.innerHTML = `<p class="cidade-msg erro">${error.message}</p>`;
  }
}

function formatarDinheiroCidade(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function carregarComissaoColetorCidade() {
  if (!tokenColetorCidade() || !$('cidadeComissaoValor')) return;

  try {
    const dados = await cidadeFetch('/api/cidade/coletor/comissao', {}, true);
    const valor = Number(dados.valorDisponivel || 0);
    const cadastrosHoje = Number(dados.cadastrosHoje || 0);
    const limite = Number(dados.metaSaque || dados.limiteDiario || 50);
    const valorCadastro = Number(dados.valorPorCadastro || 2);
    const percentual = Math.max(0, Math.min(100, Number(dados.percentualLimite || 0)));
    const saqueLiberado = Boolean(dados.saqueLiberado || valor >= limite);
    const regraSaque = dados.regraSaque || 'O saque só é liberado ao completar R$ 50,00 no dia. Todos os cadastros são avaliados pelo time da Norte Servic antes do pagamento.';

    $('cidadeComissaoValor').textContent = formatarDinheiroCidade(valor);
    $('cidadeComissaoDetalhe').textContent = `${cadastrosHoje} cadastro(s) hoje • ${formatarDinheiroCidade(valorCadastro)} por cadastro • saque libera em ${formatarDinheiroCidade(limite)}`;
    $('cidadeComissaoBarra').style.width = `${percentual}%`;
    if ($('cidadeCadastrosHojeCompacto')) $('cidadeCadastrosHojeCompacto').textContent = cadastrosHoje;
    if ($('cidadeComissaoCompacta')) $('cidadeComissaoCompacta').textContent = formatarDinheiroCidade(valor);
    if ($('cidadeMetaCompacta')) $('cidadeMetaCompacta').textContent = `meta ${formatarDinheiroCidade(limite)}`;

    const resumo = $('cidadeComissaoResumo');
    if (resumo) resumo.textContent = dados.mensagem || `Cada cadastro finalizado soma ${formatarDinheiroCidade(valorCadastro)}. O saque só libera ao completar ${formatarDinheiroCidade(limite)} no dia.`;

    const link = $('btnSolicitarSaqueColetor');
    if (link) {
      link.href = '#';
      link.textContent = dados.saquePendente
        ? 'Saque enviado para análise'
        : saqueLiberado ? 'Solicitar saque para análise' : `Saque libera em ${formatarDinheiroCidade(limite)}`;
      link.classList.toggle('cidade-btn-desativado', !saqueLiberado || dados.saquePendente);
      link.setAttribute('aria-disabled', (!saqueLiberado || dados.saquePendente) ? 'true' : 'false');
      link.onclick = async (evento) => {
        evento.preventDefault();
        if (!saqueLiberado) {
          mostrarToastCidade(`${regraSaque} Valor atual: ${formatarDinheiroCidade(valor)}.`, 'erro');
          return false;
        }
        if (dados.saquePendente) {
          mostrarToastCidade('Sua solicitação de saque já está no Painel Admin aguardando análise.', 'ok');
          return false;
        }
        try {
          mostrarTransicaoCidade('Enviando solicitação de saque para o Painel Admin...');
          const resposta = await cidadeFetch('/api/cidade/coletor/saques', { method: 'POST', body: JSON.stringify({}) }, true);
          mostrarToastCidade(resposta.mensagem || 'Solicitação enviada para análise.', 'ok');
          await carregarComissaoColetorCidade();
        } catch (error) {
          mostrarToastCidade(error.message, 'erro');
        } finally {
          fecharTransicaoCidade(300);
        }
        return false;
      };
    }
  } catch (error) {
    const detalhe = $('cidadeComissaoDetalhe');
    if (detalhe) detalhe.textContent = error.message;
  }
}

function prepararBuscaProfissaoCidade() {
  const busca = $('buscaProfissaoColetaCidade');
  renderizarProfissoesRapidasCidade('');

  if (busca) {
    busca.addEventListener('input', () => renderizarProfissoesRapidasCidade(busca.value));
    busca.addEventListener('focus', () => renderizarProfissoesRapidasCidade(busca.value));
  }
}

function renderizarProfissoesRapidasCidade(filtro = '') {
  const box = $('cidadeProfissoesRapidas');
  if (!box) return;

  const termo = String(filtro || '').trim().toLowerCase();
  let lista = termo
    ? PROFISSOES_CIDADE.filter((item) =>
        item.profissao.toLowerCase().includes(termo) ||
        item.categoria.toLowerCase().includes(termo) ||
        (item.servicos || []).join(' ').toLowerCase().includes(termo)
      )
    : PROFISSOES_CIDADE.filter((item) => ['Pedreiro','Diarista','Manicure','Pintor','Eletricista','Mecânico'].includes(item.profissao));

  if (!lista.some((item) => item.profissao === 'Outra profissão')) {
    lista = [...lista.slice(0, 7), PROFISSOES_CIDADE.find((item) => item.profissao === 'Outra profissão')].filter(Boolean);
  } else {
    lista = lista.slice(0, 8);
  }

  if (!lista.length) {
    box.innerHTML = '<span class="cidade-servicos-vazio">Nenhuma profissão encontrada. Digite manualmente no campo abaixo.</span>';
    return;
  }

  box.innerHTML = lista.map((item) => `
    <button type="button" class="cidade-chip-profissao" data-profissao="${item.profissao}">
      ${item.profissao}
    </button>
  `).join('');

  box.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => selecionarProfissaoCidade(btn.dataset.profissao));
  });
}

function selecionarProfissaoCidade(nomeProfissao) {
  const item = PROFISSOES_CIDADE.find((p) => p.profissao === nomeProfissao) || null;
  const profissao = $('profissaoColetaCidade');
  const categoria = $('categoriaColetaCidade');
  const servicos = $('servicosColetaCidade');
  const busca = $('buscaProfissaoColetaCidade');

  document.querySelectorAll('.cidade-chip-profissao').forEach((btn) => {
    btn.classList.toggle('ativo', btn.dataset.profissao === nomeProfissao);
  });

  if (item?.profissao === 'Outra profissão') {
    if (busca) busca.value = '';
    if (profissao) { profissao.value = ''; profissao.focus(); }
    if (categoria) categoria.value = '';
    if (servicos) servicos.value = '';
    renderizarProfissoesRapidasCidade('');
    renderizarServicosRapidosCidade([]);
    return;
  }

  if (busca) busca.value = item?.profissao || '';
  if (profissao) profissao.value = item?.profissao || '';
  if (categoria) categoria.value = item?.categoria || '';
  if (servicos && item?.servicos?.length) servicos.value = item.servicos.join(', ');
  renderizarServicosRapidosCidade(item?.servicos || []);
}

function renderizarServicosRapidosCidade(lista = []) {
  const box = $('cidadeServicosRapidos');
  if (!box) return;

  if (!lista.length) {
    box.innerHTML = '<span class="cidade-servicos-vazio">Escolha uma profissão para ver sugestões de serviços.</span>';
    return;
  }

  box.innerHTML = lista.map((servico) => `
    <button type="button" class="cidade-chip-servico ativo" data-servico="${servico}">${servico}</button>
  `).join('');

  box.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => alternarServicoCidade(btn));
  });
}

function alternarServicoCidade(botao) {
  botao.classList.toggle('ativo');
  const campo = $('servicosColetaCidade');
  const ativos = Array.from(document.querySelectorAll('.cidade-chip-servico.ativo')).map((el) => el.dataset.servico);
  if (campo) campo.value = ativos.join(', ');
}

function detectarCategoriaCidade() {
  const profissao = $('profissaoColetaCidade')?.value.trim().toLowerCase() || '';
  const categoria = $('categoriaColetaCidade');
  if (!categoria || categoria.value.trim()) return;

  const achado = PROFISSOES_CIDADE.find((p) => p.profissao.toLowerCase() === profissao);
  if (achado && achado.categoria) {
    categoria.value = achado.categoria;
    renderizarServicosRapidosCidade(achado.servicos || []);
  }
}

function formatarTelefoneCidade(valor) {
  const digitos = String(valor || '').replace(/\D/g, '').slice(0, 11);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}


function alternarPainelComissaoCidade() {
  const card = $('cidadeComissaoCard');
  if (!card) return;
  card.classList.toggle('escondido');
  if (!card.classList.contains('escondido')) {
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function atualizarBotaoMobileSalvando(ativo = false) {
  const botao = $('btnSalvarColetaCidadeMobile');
  if (!botao) return;
  botao.disabled = ativo;
  botao.innerHTML = ativo ? '<span class="spinner-botao"></span><span>Salvando...</span>' : 'Salvar cadastro';
}

function mostrarSucessoColetaCidade(mensagem = 'O profissional foi enviado para a base de dados.', resposta = {}) {
  const box = $('cidadeSucessoColeta');
  const texto = $('cidadeSucessoTexto');
  const status = $('cidadeSucessoStatus');
  const acoes = $('cidadeSucessoAcoesExtras');
  const whatsappMsg = resposta?.whatsappMensagem || null;
  const profissionalId = resposta?.profissional?.id || resposta?.coleta?.profissionalSiteId || null;

  if (texto) texto.textContent = mensagem;
  if (status) {
    if (whatsappMsg && whatsappMsg.status === 'erro') {
      status.className = 'cidade-sucesso-status alerta';
      status.innerHTML = '<strong>Cadastro salvo.</strong><span>WhatsApp não enviado. Confira API, token, template ou destinatário permitido.</span>';
    } else if (whatsappMsg) {
      status.className = 'cidade-sucesso-status ok';
      status.innerHTML = '<strong>Cadastro salvo e WhatsApp enviado.</strong><span>O profissional recebeu o link para completar o perfil.</span>';
    } else {
      status.className = 'cidade-sucesso-status neutro';
      status.innerHTML = '<strong>Cadastro salvo.</strong><span>Registro criado para relatório e acompanhamento da Cidade Parceira.</span>';
    }
  }
  if (acoes) {
    acoes.innerHTML = profissionalId
      ? `<a class="cidade-btn cidade-btn-claro" href="../perfil.html?id=${profissionalId}" target="_blank">Ver perfil publicado</a>`
      : '';
  }
  if (!box) return;
  document.body?.classList.add('cidade-sucesso-aberto');
  box.classList.remove('escondido');
}

function fecharSucessoColetaCidade() {
  const box = $('cidadeSucessoColeta');
  if (box) box.classList.add('escondido');
  document.body?.classList.remove('cidade-sucesso-aberto');
}

function proximoCadastroColetaCidade() {
  fecharSucessoColetaCidade();
  const nome = $('nomeColetaCidade');
  if (nome) {
    nome.focus();
    nome.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

let cidadeDuplicadoTimer = null;
let coletaCidadeEnviando = false;
async function verificarWhatsappDuplicadoCidade() {
  const campo = $('whatsappColetaCidade');
  const alerta = $('alertaWhatsappDuplicado');
  if (!campo || !alerta || !tokenColetorCidade()) return;
  const numero = String(campo.value || '').replace(/\D/g, '');
  alerta.textContent = '';
  alerta.className = 'cidade-alerta-duplicado';
  if (numero.length < 10) return;

  try {
    const dados = await cidadeFetch(`/api/cidade/coleta/verificar-whatsapp?whatsapp=${encodeURIComponent(numero)}`, {}, true);
    if (dados.existe) {
      alerta.textContent = `Atenção: este WhatsApp já aparece em ${dados.origem || 'um cadastro'}. Confira antes de salvar para evitar duplicidade.`;
      alerta.classList.add('ativo', 'erro');
    } else {
      alerta.textContent = 'Número ainda não encontrado na base.';
      alerta.classList.add('ativo', 'ok');
    }
  } catch (_) {
    // A verificação é auxiliar. Se falhar, o cadastro normal continua funcionando.
  }
}

function prepararFormularioColetaCidade() {
  prepararBuscaProfissaoCidade();
  renderizarServicosRapidosCidade([]);

  const tel = $('whatsappColetaCidade');
  if (tel) {
    tel.addEventListener('input', () => {
      tel.value = formatarTelefoneCidade(tel.value);
      const alerta = $('alertaWhatsappDuplicado');
      if (alerta) { alerta.textContent = ''; alerta.className = 'cidade-alerta-duplicado'; }
      clearTimeout(cidadeDuplicadoTimer);
      cidadeDuplicadoTimer = setTimeout(verificarWhatsappDuplicadoCidade, 650);
    });
    tel.addEventListener('blur', verificarWhatsappDuplicadoCidade);
  }

  const profissao = $('profissaoColetaCidade');
  if (profissao) {
    profissao.addEventListener('input', () => {
      const categoria = $('categoriaColetaCidade');
      if (categoria) categoria.value = '';
      detectarCategoriaCidade();
    });
  }

  const form = $('formColetaCidade');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (coletaCidadeEnviando) return;
    const msg = $('msgColetaCidade');
    const botao = $('btnSalvarColetaCidade');
    if (msg) { msg.textContent = ''; msg.classList.remove('erro'); }

    const nomeObrigatorio = $('nomeColetaCidade')?.value.trim() || '';
    const profissaoObrigatoria = $('profissaoColetaCidade')?.value.trim() || '';
    const whatsappObrigatorio = String($('whatsappColetaCidade')?.value || '').replace(/\D/g, '');
    if (!nomeObrigatorio || !profissaoObrigatoria || whatsappObrigatorio.length < 10) {
      const aviso = 'Preencha nome, WhatsApp válido e profissão antes de salvar.';
      if (msg) { msg.textContent = aviso; msg.classList.add('erro'); }
      mostrarToastCidade(aviso, 'erro');
      return;
    }

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    payload.aceitaSite = fd.get('aceitaSite') === 'true';
    payload.autorizouMensagem = fd.get('autorizouMensagem') === 'true';
    payload.necessidadesEmpreendedor = fd.getAll('necessidadesEmpreendedor');
    payload.whatsapp = String(payload.whatsapp || '').replace(/\D/g, '');
    payload.instagram = String(payload.instagram || '').trim().replace(/^https?:\/\/((www\.)?instagram\.com\/)?/i, '').replace(/^@?/, '@');
    if (payload.instagram === '@') payload.instagram = '';

    const original = ativarBotaoCidade(botao, 'Salvando...');
    coletaCidadeEnviando = true;
    if ($('cidadeSucessoColeta')) $('cidadeSucessoColeta').classList.add('escondido');
    document.body?.classList.remove('cidade-sucesso-aberto');
    atualizarBotaoMobileSalvando(true);
    mostrarTransicaoCidade('Enviando cadastro para análise...');

    try {
      const resposta = await cidadeFetch('/api/cidade/coleta/profissionais', {
        method: 'POST',
        body: JSON.stringify(payload)
      }, true);
      limparFormularioColetaCidade(false);
      if (msg) msg.textContent = resposta.mensagem;
      mostrarToastCidade(resposta.mensagem);
      mostrarSucessoColetaCidade(resposta.mensagem || 'Cadastro enviado para a base de dados.', resposta);
      if ($('cidadeTotalProfissionais')) await carregarResumoCidade();
      await carregarMinhasColetasCidade();
      await carregarComissaoColetorCidade();
      mostrarTransicaoCidade('Cadastro enviado com sucesso.');
    } catch (error) {
      if (msg) { msg.textContent = error.message; msg.classList.add('erro'); }
      mostrarToastCidade(error.message, 'erro');
    } finally {
      fecharTransicaoCidade(250);
      restaurarBotaoCidade(botao, original);
      atualizarBotaoMobileSalvando(false);
      coletaCidadeEnviando = false;
    }
  });
}

function limparFormularioColetaCidade(mostrarMensagem = true) {
  const form = $('formColetaCidade');
  if (!form) return;
  form.reset();
  if ($('buscaProfissaoColetaCidade')) $('buscaProfissaoColetaCidade').value = '';
  if ($('alertaWhatsappDuplicado')) { $('alertaWhatsappDuplicado').textContent = ''; $('alertaWhatsappDuplicado').className = 'cidade-alerta-duplicado'; }
  if ($('cidadeSucessoColeta')) $('cidadeSucessoColeta').classList.add('escondido');
  document.querySelectorAll('.cidade-chip-profissao, .cidade-chip-servico').forEach((el) => el.classList.remove('ativo'));
  renderizarProfissoesRapidasCidade('');
  renderizarServicosRapidosCidade([]);
  const msg = $('msgColetaCidade');
  if (msg) { msg.textContent = ''; msg.classList.remove('erro'); }
  if (mostrarMensagem) mostrarToastCidade('Formulário limpo.');
  setTimeout(() => $('nomeColetaCidade')?.focus(), 150);
}

async function carregarProfissoesCidade() {
  const lista = $('listaProfissoesCidade');
  if (!lista) return;

  try {
    const q = $('buscaCidadeProfissao')?.value.trim() || '';
    const setor = $('filtroSetorCidade')?.value || '';
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (setor) params.set('setor', setor);

    lista.innerHTML = '<div class="cidade-mini-loader-lista"><span></span> Carregando profissionais agrupados...</div>';
    const grupos = await cidadeFetch(`/api/cidade/profissoes${params.toString() ? '?' + params.toString() : ''}`);

    if (!grupos.length) {
      lista.innerHTML = '<div class="cidade-vazio-card cidade-card-transicao"><h3>Nenhum profissional encontrado</h3><p>Os cadastros dos coletores aparecerão aqui agrupados por profissão.</p></div>';
      aplicarAnimacoesCidade(lista);
      return;
    }

    lista.innerHTML = grupos.map((grupo, index) => {
      const profissionais = grupo.profissionais || [];
      const maior = Math.max(...grupos.map(g => Number(g.total || 0)), 1);
      const largura = Math.max(8, Math.round((Number(grupo.total || 0) / maior) * 100));

      return `
        <article class="cidade-profissao-card cidade-card-transicao" style="animation-delay:${Math.min(index * 60, 420)}ms">
          <div class="cidade-profissao-topo">
            <div>
              <span>${String(index + 1).padStart(2, '0')} • ${grupo.categoria || 'Profissionais locais'}</span>
              <h2>${grupo.profissao}</h2>
              <p>${grupo.total} profissional(is) coletado(s) • ${grupo.aceitosSite} no site oficial</p>
            </div>
            <strong>${grupo.total}</strong>
          </div>
          <div class="cidade-barra"><i style="width:${largura}%"></i></div>
          <div class="cidade-profissionais-mini">
            ${profissionais.map((p) => `
              <div>
                <strong>${p.nome || 'Profissional'}</strong>
                <span>${p.setor || ''}${p.bairro ? ' • ' + p.bairro : ''}</span>
                <small>${p.aceitaSite ? 'Aceitou aparecer no site oficial' : 'Somente relatório Cidade Parceira'}</small>
              </div>
            `).join('')}
          </div>
        </article>
      `;
    }).join('');
    aplicarAnimacoesCidade(lista);
  } catch (error) {
    lista.innerHTML = `<div class="cidade-vazio-card cidade-card-transicao"><h3>Erro ao carregar consulta</h3><p>${error.message}</p></div>`;
    aplicarAnimacoesCidade(lista);
  }
}

function prepararLoginSenhaCidade() {
  const form = $('formSenhaCidade');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      entrarCidadeParceira();
    });
  }

  const toggle = $('toggleSenhaCidade');
  const senha = $('senhaCidade');
  if (toggle && senha) {
    toggle.addEventListener('click', () => {
      senha.type = senha.type === 'password' ? 'text' : 'password';
      toggle.textContent = senha.type === 'password' ? '👁' : '🙈';
    });
  }
}

function iniciarAtualizacaoResumoCidade() {
  if (!$('cidadeTotalProfissionais')) return;
  setInterval(() => {
    carregarResumoCidade();
  }, 12000);
}




function prepararLinksTransicaoCidade() {
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || link.target === '_blank') return;
    link.addEventListener('click', (event) => {
      const destino = link.getAttribute('href');
      if (!destino || destino === '#') return;
      const atual = window.location.pathname.split('/').pop() || 'index.html';
      const destinoLimpo = destino.split('#')[0].split('?')[0];
      if (destinoLimpo === atual) return;
      event.preventDefault();
      const texto = destino.includes('coletor') ? 'Abrindo área do coletor...'
        : destino.includes('profissionais') ? 'Abrindo consulta de profissionais...'
        : destino.includes('home') ? 'Abrindo Cidade Parceira...'
        : 'Abrindo Norte Servic...';
      navegarCidade(destino, texto);
    });
  });
}

function animarElementoCidade(elemento, delay = 0, lateral = '') {
  if (!elemento || elemento.classList.contains('cidade-revelado')) return;
  const classe = lateral === 'left' ? 'cidade-reveal-left' : lateral === 'right' ? 'cidade-reveal-right' : 'cidade-reveal';
  elemento.classList.add(classe);
  elemento.style.setProperty('--cidade-delay', `${delay}ms`);
  requestAnimationFrame(() => {
    setTimeout(() => elemento.classList.add('cidade-revelado'), 35);
  });
}

function aplicarAnimacoesCidade(raiz = document) {
  const seletores = [
    '.cidade-login-card',
    '.cidade-login-visual',
    '.cidade-login-passos article',
    '.cidade-hero-premium',
    '.cidade-numero-box',
    '.cidade-hero-acoes .cidade-btn',
    '.cidade-metricas article',
    '.cidade-grid-section > *',
    '.cidade-coletor-cta-card',
    '.cidade-coletor-hero',
    '.cidade-coletor-mini-passos article',
    '.cidade-coletor-login',
    '.cidade-coletor-form',
    '.cidade-coletor-status-row > *',
    '.cidade-comissao-card',
    '.cidade-bloco-form',
    '.cidade-switch-site',
    '.cidade-acesso-profissional-info',
    '.cidade-form-acoes',
    '.cidade-minhas-coletas',
    '.cidade-consulta-hero',
    '.cidade-filtros-consulta',
    '.cidade-profissao-card',
    '.cidade-vazio-card',
    '.cidade-setor-item',
    '.cidade-ranking-item',
    '.cidade-coleta-item'
  ];

  const elementos = [...raiz.querySelectorAll(seletores.join(','))]
    .filter((el, index, arr) => arr.indexOf(el) === index && !el.classList.contains('escondido'));

  elementos.forEach((el, index) => {
    const lateral = el.matches('.cidade-login-card, .cidade-grid-section > :first-child, .cidade-coletor-login') ? 'left'
      : el.matches('.cidade-login-visual, .cidade-grid-section > :last-child') ? 'right'
      : '';
    const delay = Math.min(index * 42, 420);
    animarElementoCidade(el, delay, lateral);
  });
}

function animarTrocaPainelCidade(elemento) {
  if (!elemento) return;
  elemento.classList.remove('cidade-reveal', 'cidade-reveal-left', 'cidade-reveal-right', 'cidade-revelado');
  animarElementoCidade(elemento, 0);
}

window.addEventListener('DOMContentLoaded', async () => {
  esconderLoadingCidade();
  prepararLoginSenhaCidade();
  prepararLinksTransicaoCidade();
  aplicarAnimacoesCidade(document);

  if (!protegerPaginaCidade()) return;

  const pagina = paginaCidadeAtual();
  if (pagina === 'home') {
    mostrarTransicaoCidade('Carregando dados reais em tempo real...');
    await carregarResumoCidade();
    iniciarAtualizacaoResumoCidade();
    fecharTransicaoCidade(350);
    aplicarAnimacoesCidade(document);
  }

  if (pagina === 'coletor') {
    mostrarTransicaoCidade('Preparando login do coletor...');
    prepararFormularioColetaCidade();
    prepararColetorCidade();
    fecharTransicaoCidade(320);
    aplicarAnimacoesCidade(document);
  }

  if (pagina === 'profissionais') {
    mostrarTransicaoCidade('Carregando consulta de profissionais...');
    await carregarProfissoesCidade();
    fecharTransicaoCidade(350);
    aplicarAnimacoesCidade(document);
  }
});



/* =========================================================
   V22 — COLETOR MOBILE PREMIUM / LOADING / SUCESSO
   ========================================================= */

function travarTelaCidadeLoading() {
  document.documentElement.classList.add('loading-travado');
  document.body?.classList.add('loading-travado');
  document.documentElement.style.overflow = 'hidden';
  if (document.body) {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  }
  requestAnimationFrame(() => {
    document.querySelectorAll('.mini-loading.ativo, .ns-page-loader.ativo').forEach((loader) => {
      loader.style.position = 'fixed';
      loader.style.inset = '0';
      loader.style.width = '100vw';
      loader.style.height = '100dvh';
      loader.style.display = 'flex';
      loader.style.alignItems = 'center';
      loader.style.justifyContent = 'center';
      loader.style.zIndex = '2147483647';
    });
  });
}

function liberarTelaCidadeLoading() {
  document.documentElement.classList.remove('loading-travado');
  document.body?.classList.remove('loading-travado');
  document.documentElement.style.overflow = '';
  if (document.body) {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    delete document.body.dataset.nsCidadeLoadingTravado;
    delete document.body.dataset.nsCidadeLoadingScrollY;
  }
}

function garantirLoadingCidadePadrao(loading, texto = 'Carregando informações...') {
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

function mostrarSucessoColetaCidade(mensagem = 'O profissional foi enviado para a base de dados.', resposta = {}) {
  const box = $('cidadeSucessoColeta');
  const texto = $('cidadeSucessoTexto');
  const status = $('cidadeSucessoStatus');
  const acoes = $('cidadeSucessoAcoesExtras');
  const whatsappMsg = resposta?.whatsappMensagem || null;
  const profissionalId = resposta?.profissional?.id || resposta?.coleta?.profissionalSiteId || null;
  const linkPerfil = profissionalId ? `${window.location.origin}/perfil.html?id=${profissionalId}` : '';
  const linkCompletar = `${window.location.origin}/completar-perfil.html`;

  if (texto) texto.textContent = mensagem;
  if (status) {
    const linhas = [
      '<p class="cidade-status-linha ok"><strong>Cadastro salvo</strong><span>Registro enviado para a base de dados.</span></p>',
      profissionalId
        ? '<p class="cidade-status-linha ok"><strong>Site oficial</strong><span>Profissional publicado/relacionado ao perfil.</span></p>'
        : '<p class="cidade-status-linha neutro"><strong>Site oficial</strong><span>Cadastro salvo para relatório e acompanhamento.</span></p>',
      whatsappMsg && whatsappMsg.status === 'erro'
        ? '<p class="cidade-status-linha alerta"><strong>WhatsApp</strong><span>Não enviado. Confira API, token, template ou destinatário.</span></p>'
        : whatsappMsg
          ? '<p class="cidade-status-linha ok"><strong>WhatsApp</strong><span>Mensagem enviada para completar o perfil.</span></p>'
          : '<p class="cidade-status-linha neutro"><strong>WhatsApp</strong><span>Envio não solicitado ou não configurado.</span></p>'
    ];
    status.className = 'cidade-sucesso-status premium-v22';
    status.innerHTML = linhas.join('');
  }

  if (acoes) {
    acoes.innerHTML = `
      ${profissionalId ? `<a class="cidade-btn cidade-btn-claro" href="${linkPerfil}" target="_blank">Ver perfil publicado</a>` : ''}
      <button type="button" class="cidade-btn cidade-btn-claro" onclick="navigator.clipboard?.writeText('${profissionalId ? linkPerfil : linkCompletar}'); mostrarToastCidade('Link copiado.');">Copiar link do perfil</button>
      <button type="button" class="cidade-btn" onclick="proximoCadastroColetaCidade()">Cadastrar próximo</button>
    `;
  }

  if (!box) return;
  document.body?.classList.add('cidade-sucesso-aberto');
  box.classList.remove('escondido');
  setTimeout(() => {
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 80);
}
