'use strict';

function normalizarCpfCnpjCidade(valor = '') {
  return String(valor || '').replace(/\D/g, '');
}

function tipoPixRotuloCidade(tipo = '') {
  return {
    cpf: 'CPF',
    cnpj: 'CNPJ',
    telefone: 'Telefone',
    email: 'E-mail',
    aleatoria: 'Chave aleatória'
  }[String(tipo || '').toLowerCase()] || 'Não informado';
}

function preencherFormularioPixColetor(dados = {}) {
  const form = $('formDadosPixColetor');
  if (!form) return;
  if ($('pixNomeTitularColetor')) $('pixNomeTitularColetor').value = dados.nomeTitular || '';
  if ($('pixCpfCnpjColetor')) $('pixCpfCnpjColetor').value = dados.cpfCnpj || '';
  if ($('pixTipoChaveColetor')) $('pixTipoChaveColetor').value = dados.tipoChavePix || '';
  if ($('pixChaveColetor')) $('pixChaveColetor').value = dados.chavePix || '';
  if ($('pixBancoColetor')) $('pixBancoColetor').value = dados.banco || '';
  atualizarStatusPixColetor(dados.completo);
}

function atualizarStatusPixColetor(completo = false) {
  const status = $('cidadePixStatus');
  if (!status) return;
  status.textContent = completo ? 'Pix cadastrado' : 'Pendente';
  status.classList.toggle('ok', Boolean(completo));
}

async function carregarDadosPagamentoColetorCidade() {
  if (!tokenColetorCidade() || !$('formDadosPixColetor')) return;
  try {
    const resposta = await cidadeFetch('/api/cidade/coletor/dados-pagamento', {}, true);
    preencherFormularioPixColetor(resposta.dadosPagamento || {});
  } catch (error) {
    const msg = $('msgDadosPixColetor');
    if (msg) {
      msg.textContent = error.message;
      msg.classList.add('erro');
    }
  }
}

function prepararFormularioPixColetorCidade() {
  const form = $('formDadosPixColetor');
  if (!form || form.dataset.pronto === 'true') return;
  form.dataset.pronto = 'true';
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const msg = $('msgDadosPixColetor');
    const botao = $('btnSalvarPixColetor');
    const textoOriginal = botao?.textContent || 'Salvar dados Pix';
    if (msg) { msg.textContent = ''; msg.classList.remove('erro'); }
    try {
      if (botao) { botao.disabled = true; botao.textContent = 'Salvando...'; }
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      payload.cpfCnpj = normalizarCpfCnpjCidade(payload.cpfCnpj);
      const resposta = await cidadeFetch('/api/cidade/coletor/dados-pagamento', {
        method: 'PUT',
        body: JSON.stringify(payload)
      }, true);
      preencherFormularioPixColetor(resposta.dadosPagamento || {});
      if (msg) msg.textContent = resposta.mensagem || 'Dados Pix salvos.';
      mostrarToastCidade(resposta.mensagem || 'Dados Pix salvos.', 'ok');
      await carregarComissaoColetorCidade();
    } catch (error) {
      if (msg) { msg.textContent = error.message; msg.classList.add('erro'); }
      mostrarToastCidade(error.message, 'erro');
    } finally {
      if (botao) { botao.disabled = false; botao.textContent = textoOriginal; }
    }
  });
}

// Reforça inicialização do formulário Pix sem mexer nas funções antigas.
document.addEventListener('DOMContentLoaded', () => {
  prepararFormularioPixColetorCidade();
});

function alternarPainelComissaoCidade() {
  const card = $('cidadeComissaoCard');
  const pix = $('cidadePixCard');
  if (!card) return;
  const vaiAbrir = card.classList.contains('escondido');
  card.classList.toggle('escondido', !vaiAbrir);
  if (pix) pix.classList.toggle('escondido', !vaiAbrir);
  if (vaiAbrir) {
    prepararFormularioPixColetorCidade();
    carregarDadosPagamentoColetorCidade();
    carregarComissaoColetorCidade();
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

async function carregarComissaoColetorCidade() {
  if (!tokenColetorCidade() || !$('cidadeComissaoValor')) return;

  try {
    const dados = await cidadeFetch('/api/cidade/coletor/comissao', {}, true);
    const valor = Number(dados.valorDisponivel || 0);
    const cadastrosHoje = Number(dados.cadastrosHoje || 0);
    const cadastrosDisponiveis = Number(dados.cadastrosDisponiveis || 0);
    const limite = Number(dados.metaSaque || dados.limiteDiario || 50);
    const valorCadastro = Number(dados.valorPorCadastro || 2);
    const percentual = Math.max(0, Math.min(100, Number(dados.percentualLimite || 0)));
    const saqueLiberado = Boolean(dados.saqueLiberado || valor >= limite);
    const dadosPixOk = Boolean(dados.dadosPagamentoCompleto);
    const saquePendente = Boolean(dados.saquePendente);
    const saquePagoHoje = Boolean(dados.saquePagoHoje);
    const metaBatidaHoje = Boolean(dados.metaBatidaHoje || dados.saqueHojeBloqueado);
    const ultimo = dados.saqueHoje || dados.ultimoSaque || null;

    if (dados.dadosPagamento) preencherFormularioPixColetor(dados.dadosPagamento);

    $('cidadeComissaoValor').textContent = formatarDinheiroCidade(valor);
    $('cidadeComissaoDetalhe').textContent = `${cadastrosDisponiveis} disponível(is) hoje • ${formatarDinheiroCidade(valorCadastro)} por cadastro`;
    $('cidadeComissaoBarra').style.width = `${percentual}%`;

    if ($('cidadeCadastrosHojeCompacto')) $('cidadeCadastrosHojeCompacto').textContent = cadastrosHoje;
    if ($('cidadeComissaoCompacta')) $('cidadeComissaoCompacta').textContent = formatarDinheiroCidade(valor);
    if ($('cidadeMetaCompacta')) {
      $('cidadeMetaCompacta').textContent = metaBatidaHoje ? 'meta batida hoje' : `${cadastrosDisponiveis}/25 disp.`;
    }

    const resumo = $('cidadeComissaoResumo');
    if (resumo) {
      resumo.textContent = dados.mensagem || `Meta diária: ${formatarDinheiroCidade(limite)}. Após solicitar, não será possível pedir outro saque no mesmo dia.`;
    }

    const status = $('cidadeStatusSaqueColetor');
    if (status) {
      if (saquePagoHoje) {
        status.textContent = `✅ Meta batida no dia. Pagamento enviado com sucesso${ultimo?.pagoEm ? ' em ' + formatarDataHoraCidade(ultimo.pagoEm) : ''}. Novo saque só amanhã.`;
        status.className = 'cidade-saque-status pago';
      } else if (saquePendente) {
        status.textContent = '⏳ Meta batida no dia. Saque aguardando análise do Admin. Não solicite outro hoje.';
        status.className = 'cidade-saque-status aguardando';
      } else if (!dadosPixOk) {
        status.textContent = '⚠️ Preencha os dados Pix para liberar o saque quando atingir a meta.';
        status.className = 'cidade-saque-status alerta';
      } else if (saqueLiberado) {
        status.textContent = '✅ Meta atingida hoje. Solicite o saque para análise. Após solicitar, a meta do dia fica encerrada.';
        status.className = 'cidade-saque-status ok';
      } else {
        status.textContent = `Faltam ${dados.faltamCadastrosParaSaque || 0} cadastro(s) para liberar o saque do dia.`;
        status.className = 'cidade-saque-status';
      }
    }

    const link = $('btnSolicitarSaqueColetor');
    if (link) {
      link.href = '#';
      let texto = `Saque libera em ${formatarDinheiroCidade(limite)}`;
      let desativado = true;

      if (saquePagoHoje) {
        texto = 'Meta do dia já paga';
      } else if (saquePendente) {
        texto = 'Saque aguardando análise';
      } else if (!dadosPixOk) {
        texto = 'Preencha os dados Pix';
      } else if (saqueLiberado) {
        texto = 'Solicitar saque do dia';
        desativado = false;
      }

      link.textContent = texto;
      link.classList.toggle('cidade-btn-desativado', desativado);
      link.setAttribute('aria-disabled', desativado ? 'true' : 'false');
      link.onclick = async (evento) => {
        evento.preventDefault();
        if (saquePagoHoje) {
          mostrarToastCidade('A meta de hoje já foi paga. Novo saque só no próximo dia.', 'ok');
          return false;
        }
        if (saquePendente) {
          mostrarToastCidade('Sua solicitação já está aguardando análise do Admin.', 'ok');
          return false;
        }
        if (!dadosPixOk) {
          mostrarToastCidade('Preencha e salve seus dados Pix antes de solicitar o saque.', 'erro');
          $('pixNomeTitularColetor')?.focus();
          return false;
        }
        if (!saqueLiberado) {
          mostrarToastCidade(`Ainda faltam ${dados.faltamCadastrosParaSaque || 0} cadastro(s) para liberar o saque.`, 'erro');
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
