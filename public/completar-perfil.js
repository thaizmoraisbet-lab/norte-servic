'use strict';

const PERFIL_TOKEN_STORAGE = 'norteServicPerfilWhatsappToken';
const SITE_TOKEN_STORAGE = 'norteServicProfissionalToken';
let perfilAtual = null;
let modoAcessoPerfil = '';

function $(id) { return document.getElementById(id); }
function limparNumero(valor) { return String(valor || '').replace(/\D/g, ''); }

function mostrarLoadingPerfil(texto = 'Carregando...') {
  const loading = $('miniLoading');
  if (!loading) return;
  const p = loading.querySelector('p');
  if (p) p.innerText = texto;
  loading.classList.add('ativo');
}
function esconderLoadingPerfil() { $('miniLoading')?.classList.remove('ativo'); }

async function apiPerfil(url, options = {}) {
  const resp = await fetch(url, {
    ...options,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  let data = null;
  try { data = await resp.json(); } catch (_) { data = null; }
  if (!resp.ok) throw new Error(data?.erro || data?.mensagem || 'Erro na solicitação.');
  return data;
}

function tokenPerfilWhatsapp() {
  return localStorage.getItem(PERFIL_TOKEN_STORAGE) || sessionStorage.getItem(PERFIL_TOKEN_STORAGE) || '';
}
function tokenPerfilSite() {
  return localStorage.getItem(SITE_TOKEN_STORAGE) || sessionStorage.getItem(SITE_TOKEN_STORAGE) || '';
}
function setTokenPerfil(token) {
  localStorage.setItem(PERFIL_TOKEN_STORAGE, token);
  sessionStorage.setItem(PERFIL_TOKEN_STORAGE, token);
}

function mostrarEtapa(id) {
  ['etapaTelefone', 'etapaCodigo', 'etapaPerfil'].forEach((etapa) => {
    $(etapa)?.classList.toggle('escondido', etapa !== id);
  });
  const alvo = $(id);
  if (alvo) window.setTimeout(() => alvo.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
}
window.mostrarEtapa = mostrarEtapa;

async function solicitarCodigoPerfil() {
  const whatsapp = limparNumero($('perfilWhatsapp')?.value || '');
  const msg = $('msgTelefone');
  if (msg) { msg.textContent = ''; msg.classList.remove('erro'); }
  if (whatsapp.length < 10) {
    if (msg) { msg.textContent = 'Digite um WhatsApp válido com DDD.'; msg.classList.add('erro'); }
    return;
  }
  try {
    mostrarLoadingPerfil('Enviando código pelo WhatsApp...');
    const data = await apiPerfil('/api/profissional-acesso/solicitar-codigo', {
      method: 'POST', body: JSON.stringify({ whatsapp })
    });
    if (msg) {
      msg.textContent = data.mensagem || 'Código enviado pelo WhatsApp.';
      msg.classList.toggle('erro', data.statusWhatsApp === 'erro');
    }
    mostrarEtapa('etapaCodigo');
    $('perfilCodigo')?.focus();
  } catch (error) {
    if (msg) { msg.textContent = error.message; msg.classList.add('erro'); }
  } finally { esconderLoadingPerfil(); }
}
window.solicitarCodigoPerfil = solicitarCodigoPerfil;

async function validarCodigoPerfil() {
  const whatsapp = limparNumero($('perfilWhatsapp')?.value || '');
  const codigo = limparNumero($('perfilCodigo')?.value || '');
  const msg = $('msgCodigo');
  if (msg) { msg.textContent = ''; msg.classList.remove('erro'); }
  if (codigo.length !== 6) {
    if (msg) { msg.textContent = 'Digite o código de 6 dígitos.'; msg.classList.add('erro'); }
    return;
  }
  try {
    mostrarLoadingPerfil('Validando código...');
    const data = await apiPerfil('/api/profissional-acesso/validar-codigo', {
      method: 'POST', body: JSON.stringify({ whatsapp, codigo })
    });
    setTokenPerfil(data.token);
    modoAcessoPerfil = 'whatsapp';
    await carregarMeuPerfil();
    mostrarEtapa('etapaPerfil');
  } catch (error) {
    if (msg) { msg.textContent = error.message; msg.classList.add('erro'); }
  } finally { esconderLoadingPerfil(); }
}
window.validarCodigoPerfil = validarCodigoPerfil;

function arquivoParaDataURL(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return reject(new Error('Envie apenas JPG, PNG ou WEBP.'));
    if (file.size > 4 * 1024 * 1024) return reject(new Error('A foto deve ter no máximo 4 MB.'));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
  });
}

function valorCampo(id) { return String($(id)?.value || '').trim(); }

function atualizarVisibilidadeCidades() {
  const grupo = $('perfilCidadesGrupo');
  const valor = $('perfilAtendeOutras')?.value || 'Não';
  grupo?.classList.toggle('escondido', valor === 'Não');
}

function atualizarProgressoPerfil() {
  const p = perfilAtual || {};
  const foto = Boolean(p.fotoPerfil || $('previewFotoPerfil')?.src?.startsWith('data:image'));
  const servicos = valorCampo('perfilServicos').length >= 3;
  const descricao = valorCampo('perfilDescricao').length >= 20;
  const local = Boolean(valorCampo('perfilBairro') || ($('perfilAtendeOutras')?.value && $('perfilAtendeOutras').value !== 'Não') || valorCampo('perfilCidades'));
  const contato = Boolean(valorCampo('perfilInstagram') || valorCampo('perfilHorario'));

  const itens = { foto, servicos, descricao, local, contato };
  let percentual = 40;
  if (foto) percentual += 15;
  if (servicos) percentual += 15;
  if (descricao) percentual += 15;
  if (local) percentual += 8;
  if (contato) percentual += 7;
  percentual = Math.min(100, percentual);

  if ($('perfilProgressoNumero')) $('perfilProgressoNumero').textContent = `${percentual}%`;
  if ($('perfilProgressoBarra')) $('perfilProgressoBarra').style.width = `${percentual}%`;
  if ($('perfilProgressoTexto')) $('perfilProgressoTexto').textContent = percentual >= 85
    ? 'Seu perfil já possui ótimas informações para gerar confiança.'
    : 'Complete mais informações para melhorar seu perfil.';

  document.querySelectorAll('.checklist-items [data-check]').forEach((el) => {
    el.classList.toggle('concluido', Boolean(itens[el.dataset.check]));
  });
}

function preencherPerfil(profissional) {
  perfilAtual = profissional || {};
  if ($('perfilNome')) $('perfilNome').value = profissional.nome || '';
  if ($('perfilProfissao')) $('perfilProfissao').value = profissional.profissao || '';
  if ($('perfilServicos')) $('perfilServicos').value = profissional.servicos || profissional.profissao || '';
  if ($('perfilDescricao')) $('perfilDescricao').value = profissional.descricao || '';
  if ($('perfilBairro')) $('perfilBairro').value = profissional.bairro || '';
  if ($('perfilInstagram')) $('perfilInstagram').value = profissional.instagram || '';
  if ($('perfilHorario')) $('perfilHorario').value = profissional.horarioAtendimento || profissional.horario_atendimento || '';
  if ($('perfilAtendeOutras')) $('perfilAtendeOutras').value = profissional.atendeOutrasCidades || profissional.atende_outras_cidades || 'Não';
  if ($('perfilCidades')) $('perfilCidades').value = Array.isArray(profissional.cidadesAtendidas) ? profissional.cidadesAtendidas.join(', ') : '';

  const nome = profissional.nome || 'Seu perfil';
  if ($('resumoNomePerfil')) $('resumoNomePerfil').textContent = nome;
  if ($('resumoProfissaoPerfil')) $('resumoProfissaoPerfil').textContent = profissional.profissao || 'Profissional';
  if ($('previewInicialPerfil')) $('previewInicialPerfil').textContent = nome.charAt(0).toUpperCase() || 'P';

  const img = $('previewFotoPerfil');
  if (img) {
    if (profissional.fotoPerfil) {
      img.src = profissional.fotoPerfil;
      img.classList.remove('sem-foto');
      $('previewInicialPerfil')?.classList.add('escondido');
    } else {
      img.removeAttribute('src');
      img.classList.add('sem-foto');
      $('previewInicialPerfil')?.classList.remove('escondido');
    }
  }
  atualizarVisibilidadeCidades();
  atualizarProgressoPerfil();
}

async function carregarMeuPerfil() {
  const siteToken = tokenPerfilSite();
  const whatsappToken = tokenPerfilWhatsapp();

  if (siteToken) {
    modoAcessoPerfil = 'site';
    const profissional = await apiPerfil('/api/me', { headers: { Authorization: `Bearer ${siteToken}` } });
    preencherPerfil(profissional);
    return profissional;
  }

  if (whatsappToken) {
    modoAcessoPerfil = 'whatsapp';
    const data = await apiPerfil('/api/profissional-acesso/me', { headers: { Authorization: `Bearer ${whatsappToken}` } });
    preencherPerfil(data.profissional);
    return data.profissional;
  }

  return null;
}

async function salvarPerfil(e) {
  e.preventDefault();
  const msg = $('msgPerfil');
  if (msg) { msg.textContent = ''; msg.classList.remove('erro', 'sucesso'); }

  const token = modoAcessoPerfil === 'site' ? tokenPerfilSite() : tokenPerfilWhatsapp();
  if (!token) {
    if (msg) { msg.textContent = 'Sua sessão expirou. Entre novamente para salvar.'; msg.classList.add('erro'); }
    return;
  }

  try {
    mostrarLoadingPerfil('Salvando seu perfil...');
    const arquivo = $('fotoPerfilArquivo')?.files?.[0] || null;
    const fotoPerfil = arquivo ? await arquivoParaDataURL(arquivo) : '';
    const cidades = valorCampo('perfilCidades').split(',').map((item) => item.trim()).filter(Boolean);
    const payload = {
      servicos: valorCampo('perfilServicos'),
      descricao: valorCampo('perfilDescricao'),
      bairro: valorCampo('perfilBairro'),
      instagram: valorCampo('perfilInstagram'),
      horarioAtendimento: valorCampo('perfilHorario'),
      atendeOutrasCidades: $('perfilAtendeOutras')?.value || 'Não',
      cidadesAtendidas: cidades
    };
    if (fotoPerfil) payload.fotoPerfil = fotoPerfil;

    let data;
    if (modoAcessoPerfil === 'site') {
      data = await apiPerfil('/api/me/completar', {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload)
      });
    } else {
      data = await apiPerfil('/api/profissional-acesso/me', {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload)
      });
    }

    preencherPerfil(data.profissional || data);
    if (msg) { msg.textContent = data.mensagem || 'Perfil salvo com sucesso.'; msg.classList.add('sucesso'); }
    $('onboardingSuccess')?.classList.remove('escondido');
    atualizarProgressoPerfil();
  } catch (error) {
    if (msg) { msg.textContent = error.message; msg.classList.add('erro'); }
  } finally { esconderLoadingPerfil(); }
}

function registrarEventosPerfil() {
  $('formCompletarPerfil')?.addEventListener('submit', salvarPerfil);
  $('perfilAtendeOutras')?.addEventListener('change', () => { atualizarVisibilidadeCidades(); atualizarProgressoPerfil(); });
  ['perfilServicos', 'perfilDescricao', 'perfilBairro', 'perfilInstagram', 'perfilHorario', 'perfilCidades'].forEach((id) => {
    $(id)?.addEventListener('input', atualizarProgressoPerfil);
  });
  $('fotoPerfilArquivo')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await arquivoParaDataURL(file);
      const img = $('previewFotoPerfil');
      if (img) { img.src = dataUrl; img.classList.remove('sem-foto'); }
      $('previewInicialPerfil')?.classList.add('escondido');
      atualizarProgressoPerfil();
    } catch (error) {
      alert(error.message);
      e.target.value = '';
    }
  });
}

async function iniciarCompletarPerfil() {
  registrarEventosPerfil();
  const params = new URLSearchParams(window.location.search);
  const whatsapp = params.get('whatsapp') || '';
  const origem = params.get('origem') || '';
  if (whatsapp && $('perfilWhatsapp')) $('perfilWhatsapp').value = whatsapp;
  if (origem === 'cadastro' && $('onboardingOrigemSelo')) $('onboardingOrigemSelo').textContent = 'Conta criada com sucesso';

  try {
    mostrarLoadingPerfil('Carregando seu perfil...');
    const profissional = await carregarMeuPerfil();
    if (profissional) mostrarEtapa('etapaPerfil');
    else mostrarEtapa('etapaTelefone');
  } catch (error) {
    if (tokenPerfilSite()) {
      localStorage.removeItem(SITE_TOKEN_STORAGE);
      sessionStorage.removeItem(SITE_TOKEN_STORAGE);
    }
    if (tokenPerfilWhatsapp()) {
      localStorage.removeItem(PERFIL_TOKEN_STORAGE);
      sessionStorage.removeItem(PERFIL_TOKEN_STORAGE);
    }
    mostrarEtapa('etapaTelefone');
    const msg = $('msgTelefone');
    if (msg) { msg.textContent = 'Sua sessão expirou. Confirme seu WhatsApp para continuar.'; msg.classList.add('erro'); }
  } finally { esconderLoadingPerfil(); }
}

document.addEventListener('DOMContentLoaded', iniciarCompletarPerfil, { once: true });
