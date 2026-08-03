'use strict';

// Inicialização centralizada da aplicação. Cada chamada só roda quando a função existe.
function nsExecutarInicializador(nome, ...args) {
  const fn = window[nome];
  if (typeof fn !== 'function') return;
  try {
    const resultado = fn(...args);
    if (resultado && typeof resultado.catch === 'function') resultado.catch(console.error);
  } catch (erro) {
    console.error(`[Norte Servic] Falha ao iniciar ${nome}:`, erro);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  [
    'iniciarCarregamentoNorteServic','iniciarAnimacoesSuavesNorteServic','inserirPerfilLogadoCabecalho',
    'ativarTransicoesDeClique','preencherCategoriasHomeV36','ativarBuscaComEnter','iniciarBuscaInteligente','iniciarProfissaoCadastroSimples','preencherCategoriasCadastro',
    'ativarProfissaoServicos','iniciarCidadeInteligente','mostrarAvisoIndicacaoCadastro','iniciarCadastroBackend',
    'iniciarLoginProfissional','iniciarRecuperacaoSenha','ativarEnterNoAdmin','prepararAdminColetores',
    'iniciarAdminPersistente','ativarTopoMenorAoRolar','mostrarProfissionais','carregarPerfilProfissional',
    'carregarPainelProfissional','iniciarEditarPerfil','alternarCidadesAtendidas','adicionarAdminNoRodape',
    'iniciarDocumentosLegais','iniciarCarrosselBannersMobile','iniciarAutoScrollFaixasHome','prepararPaginaPlanosEfi'
  ].forEach((nome) => nsExecutarInicializador(nome));

  const adminBusca = document.getElementById('adminBusca');
  if (adminBusca && typeof window.mostrarAdmin === 'function') {
    adminBusca.addEventListener('input', window.mostrarAdmin);
  }
}, { once: true });

window.addEventListener('load', () => nsExecutarInicializador('mostrarPopCadastro'), { once: true });
