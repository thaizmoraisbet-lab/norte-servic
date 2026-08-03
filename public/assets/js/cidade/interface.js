'use strict';

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


function cidadeCopiarTextoSeguroV24(texto) {
  try {
    if (navigator.clipboard && texto) {
      navigator.clipboard.writeText(texto);
      mostrarToastCidade('Link copiado.');
      return;
    }
  } catch (_) {}
  mostrarToastCidade('Link disponível no perfil publicado.');
}

function mostrarSucessoColetaCidade(mensagem = 'Cadastro enviado com sucesso.', resposta = {}) {
  const box = $('cidadeSucessoColeta');
  const texto = $('cidadeSucessoTexto');
  const status = $('cidadeSucessoStatus');
  const acoes = $('cidadeSucessoAcoesExtras');
  const card = box?.querySelector('.cidade-sucesso-card');
  const whatsappMsg = resposta?.whatsappMensagem || null;
  const profissionalId = resposta?.profissional?.id || resposta?.coleta?.profissionalSiteId || null;

  if (!box) return;

  // Importantíssimo no mobile: o modal sai de dentro do bloco do formulário
  // e vai para o body. Assim position: fixed cobre a tela inteira atual,
  // sem mostrar o cadastro por baixo.
  if (box.parentElement !== document.body) {
    document.body.appendChild(box);
  }

  if (texto) {
    texto.textContent = mensagem || 'Cadastro salvo. O profissional foi registrado na base de dados.';
  }

  if (status) {
    const whatsappLinha = whatsappMsg && whatsappMsg.status === 'erro'
      ? '<p class="cidade-status-linha alerta"><strong>WhatsApp</strong><span>Não enviado. Confira API, token, template ou destinatário.</span></p>'
      : whatsappMsg
        ? '<p class="cidade-status-linha ok"><strong>WhatsApp</strong><span>Mensagem enviada para completar o perfil.</span></p>'
        : '<p class="cidade-status-linha neutro"><strong>WhatsApp</strong><span>Envio não solicitado ou não configurado.</span></p>';

    status.className = 'cidade-sucesso-status premium-v24';
    status.innerHTML = `
      <p class="cidade-status-linha ok"><strong>Cadastro salvo</strong><span>Registro enviado para a base de dados.</span></p>
      <p class="cidade-status-linha ok"><strong>Site oficial</strong><span>${profissionalId ? 'Profissional publicado/relacionado ao perfil.' : 'Cadastro salvo para relatório e acompanhamento.'}</span></p>
      ${whatsappLinha}
    `;
  }

  // A pedido: tela final limpa. Nada de vários botões/link na frente do coletor.
  if (acoes) {
    acoes.innerHTML = '';
    acoes.style.display = 'none';
  }

  if (card) {
    card.scrollTop = 0;
  }

  document.documentElement.classList.add('cidade-sucesso-aberto');
  document.body?.classList.add('cidade-sucesso-aberto');
  document.documentElement.style.overflow = 'hidden';
  if (document.body) {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  }

  box.classList.remove('escondido');
  box.classList.add('ativo', 'cidade-sucesso-v24');
  box.setAttribute('aria-hidden', 'false');
}

function fecharSucessoColetaCidade() {
  const box = $('cidadeSucessoColeta');
  if (box) {
    box.classList.add('escondido');
    box.classList.remove('ativo', 'cidade-sucesso-v24');
    box.setAttribute('aria-hidden', 'true');
  }
  document.documentElement.classList.remove('cidade-sucesso-aberto');
  document.body?.classList.remove('cidade-sucesso-aberto');
  document.documentElement.style.overflow = '';
  if (document.body) {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }
}

function proximoCadastroColetaCidade() {
  fecharSucessoColetaCidade();
  const form = $('formColetaCidade');
  const nome = $('nomeColetaCidade');
  setTimeout(() => {
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (nome) nome.focus();
  }, 80);
}
