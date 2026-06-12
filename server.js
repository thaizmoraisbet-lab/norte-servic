require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const sharp = require('sharp');
const https = require('https');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'troque_essa_senha_em_producao';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'indica123';
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'norte-servic';
const CIDADE_PARCEIRA_PASSWORD = process.env.CIDADE_PARCEIRA_PASSWORD || 'cidade123';
const CIDADE_JWT_SECRET = process.env.CIDADE_JWT_SECRET || JWT_SECRET;
const CIDADE_MUNICIPIO_PADRAO = process.env.CIDADE_MUNICIPIO_PADRAO || 'Muricilândia - TO';
const CIDADE_WHATSAPP_SAQUE = (process.env.CIDADE_WHATSAPP_SAQUE || process.env.WHATSAPP_EMPRESA || '5563992472236').replace(/\D/g, '');
const CIDADE_COMISSAO_VALOR_CADASTRO = Number(process.env.CIDADE_COMISSAO_VALOR_CADASTRO || 2);
const CIDADE_COMISSAO_META_SAQUE = Number(process.env.CIDADE_COMISSAO_META_SAQUE || process.env.CIDADE_COMISSAO_LIMITE_DIARIO || 50);
const CIDADE_COMISSAO_LIMITE_DIARIO = CIDADE_COMISSAO_META_SAQUE;


// Integração Pix Efí Bank
const EFI_AMBIENTE = (process.env.EFI_AMBIENTE || 'homologacao').toLowerCase();
const EFI_CLIENT_ID = process.env.EFI_CLIENT_ID || process.env.ID_do_cliente_EFI || process.env.ID_DO_CLIENTE_EFI || '';
const EFI_CLIENT_SECRET = process.env.EFI_CLIENT_SECRET || process.env.SECRET_DO_CLIENTE_EFI || process.env.CLIENT_SECRET_EFI || '';
const EFI_PIX_KEY = process.env.EFI_PIX_KEY || process.env.CHAVE_PIX_EFI || process.env.PIX_KEY_EFI || '';
const EFI_CERT_BASE64 = process.env.EFI_CERT_BASE64 || process.env.CERTIFICADO_EFI_BASE64 || process.env.EFI_CERTIFICADO_BASE64 || '';
const EFI_CERT_PASSWORD = process.env.EFI_CERT_PASSWORD || '';
const EFI_WEBHOOK_SECRET = process.env.EFI_WEBHOOK_SECRET || '';
const EFI_PIX_EXPIRACAO = Number(process.env.EFI_PIX_EXPIRACAO || 3600);
const EFI_SCOPE = process.env.EFI_SCOPE || 'cob.write cob.read pix.read webhook.write webhook.read payloadlocation.write payloadlocation.read';
const EFI_BASE_URL = EFI_AMBIENTE === 'producao'
  ? 'https://pix.api.efipay.com.br'
  : 'https://pix-h.api.efipay.com.br';
const BONUS_DIAS_PLANO = Number(process.env.BONUS_DIAS_PLANO || 5);

// Sistema de indicações Norte Servic
const INDICACAO_COMISSAO_TOP = Number(process.env.INDICACAO_COMISSAO_TOP || 10);
const INDICACAO_SAQUE_MINIMO = Number(process.env.INDICACAO_SAQUE_MINIMO || 100);
const INDICACAO_DIAS_LIBERACAO = Number(process.env.INDICACAO_DIAS_LIBERACAO || 5);
const TERMOS_VERSAO_ATUAL = process.env.TERMOS_VERSAO_ATUAL || '2026.06';
const PRIVACIDADE_VERSAO_ATUAL = process.env.PRIVACIDADE_VERSAO_ATUAL || '2026.06';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function limparNumero(valor) {
  return String(valor || '').replace(/\D/g, '');
}

function parseJsonArray(valor) {
  if (Array.isArray(valor)) return valor;
  if (!valor) return [];
  try {
    const parsed = JSON.parse(valor);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return String(valor)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}



const PLANOS_EFI = {
  essencial: {
    nome: 'Essencial Destaque',
    planoAtual: 'Destaque',
    valor: 19.90,
    dias: 30
  },
  profissional: {
    nome: 'Profissional Plus',
    planoAtual: 'Profissional',
    valor: 29.90,
    dias: 30
  },
  top: {
    nome: 'Top Norte',
    planoAtual: 'Top',
    valor: 39.90,
    dias: 30
  }
};

let efiTokenCache = {
  token: '',
  expiraEm: 0
};

function efiConfigurado() {
  return Boolean(EFI_CLIENT_ID && EFI_CLIENT_SECRET && EFI_PIX_KEY && EFI_CERT_BASE64);
}

function diagnosticoEfiConfiguracao() {
  return {
    ambiente: EFI_AMBIENTE,
    clientId: Boolean(EFI_CLIENT_ID),
    clientSecret: Boolean(EFI_CLIENT_SECRET),
    pixKey: Boolean(EFI_PIX_KEY),
    certBase64: Boolean(EFI_CERT_BASE64),
    certPassword: Boolean(EFI_CERT_PASSWORD),
    scope: EFI_SCOPE,
    expiracao: EFI_PIX_EXPIRACAO
  };
}

function efiHttpsAgent() {
  if (!EFI_CERT_BASE64) {
    throw new Error('Certificado da Efí não configurado. Configure EFI_CERT_BASE64 no Railway.');
  }

  return new https.Agent({
    pfx: Buffer.from(EFI_CERT_BASE64, 'base64'),
    passphrase: EFI_CERT_PASSWORD || undefined,
    rejectUnauthorized: true
  });
}

function efiRequest(method, caminho, body = null, token = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(caminho, EFI_BASE_URL);
    const dados = body ? JSON.stringify(body) : '';
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };

    if (dados) headers['Content-Length'] = Buffer.byteLength(dados);
    if (token) headers.Authorization = `Bearer ${token}`;
    else if (caminho === '/oauth/token') {
      const basic = Buffer.from(`${EFI_CLIENT_ID}:${EFI_CLIENT_SECRET}`).toString('base64');
      headers.Authorization = `Basic ${basic}`;
    }

    const req = https.request({
      method,
      hostname: url.hostname,
      path: `${url.pathname}${url.search}`,
      headers,
      agent: efiHttpsAgent()
    }, (resposta) => {
      let respostaTexto = '';
      resposta.on('data', (chunk) => { respostaTexto += chunk; });
      resposta.on('end', () => {
        let json = null;
        try { json = respostaTexto ? JSON.parse(respostaTexto) : {}; } catch (_) { json = { raw: respostaTexto }; }

        if (resposta.statusCode < 200 || resposta.statusCode >= 300) {
          const detalhe = json?.mensagem || json?.message || json?.erro || json?.detail || respostaTexto || `HTTP ${resposta.statusCode}`;
          return reject(new Error(`Erro Efí HTTP ${resposta.statusCode}: ${detalhe}`));
        }

        resolve(json || {});
      });
    });

    req.on('error', reject);
    if (dados) req.write(dados);
    req.end();
  });
}

async function obterTokenEfi() {
  if (!efiConfigurado()) {
    throw new Error('Integração Efí incompleta. Configure credenciais, chave Pix e certificado.');
  }

  const agora = Date.now();
  if (efiTokenCache.token && efiTokenCache.expiraEm > agora + 60000) {
    return efiTokenCache.token;
  }

  const resposta = await efiRequest('POST', '/oauth/token', {
    grant_type: 'client_credentials',
    scope: EFI_SCOPE
  });
  const token = resposta.access_token;
  const expiresIn = Number(resposta.expires_in || 300);

  if (!token) throw new Error('Efí não retornou access_token.');

  efiTokenCache = {
    token,
    expiraEm: agora + (expiresIn * 1000)
  };

  return token;
}

function gerarTxidNorteServic() {
  return `NS${Date.now()}${crypto.randomBytes(6).toString('hex')}`.slice(0, 35);
}

function limparCodigoIndicacao(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 24);
}

function gerarCodigoIndicacaoLocal(nome = '', whatsapp = '') {
  const baseNome = String(nome || 'NS')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 5) || 'NS';
  const finalWhatsapp = String(whatsapp || '').slice(-4) || crypto.randomBytes(2).toString('hex').toUpperCase();
  const aleatorio = crypto.randomBytes(2).toString('hex').toUpperCase();
  return limparCodigoIndicacao(`${baseNome}${finalWhatsapp}${aleatorio}`);
}

async function garantirSistemaIndicacoes() {
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS codigo_indicacao TEXT`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS indicado_por_id BIGINT REFERENCES profissionais(id) ON DELETE SET NULL`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS indicado_por_codigo TEXT`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_profissionais_codigo_indicacao ON profissionais(codigo_indicacao) WHERE codigo_indicacao IS NOT NULL`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_profissionais_indicado_por ON profissionais(indicado_por_id)`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS indicacoes (
      id BIGSERIAL PRIMARY KEY,
      indicador_id BIGINT NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
      indicado_id BIGINT NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
      pagamento_id BIGINT,
      saque_id BIGINT,
      codigo_indicacao TEXT,
      plano_key TEXT,
      valor_comissao NUMERIC(10,2) NOT NULL DEFAULT 10,
      status TEXT NOT NULL DEFAULT 'pendente',
      motivo TEXT,
      liberado_em TIMESTAMPTZ,
      confirmado_em TIMESTAMPTZ,
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(indicado_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS saques_indicacoes (
      id BIGSERIAL PRIMARY KEY,
      profissional_id BIGINT NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
      valor NUMERIC(10,2) NOT NULL,
      chave_pix TEXT NOT NULL,
      tipo_chave_pix TEXT,
      status TEXT NOT NULL DEFAULT 'aguardando',
      indicacoes_ids JSONB DEFAULT '[]'::jsonb,
      observacao_admin TEXT,
      solicitado_em TIMESTAMPTZ DEFAULT NOW(),
      pago_em TIMESTAMPTZ,
      atualizado_em TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_indicacoes_indicador_status ON indicacoes(indicador_id, status)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_saques_indicacoes_profissional ON saques_indicacoes(profissional_id, status)`);
}



async function garantirSistemaLegal() {
  await garantirSistemaIndicacoes();
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS aceitou_termos BOOLEAN DEFAULT false`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS aceitou_privacidade BOOLEAN DEFAULT false`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS termos_versao TEXT`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS privacidade_versao TEXT`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS aceite_data TIMESTAMPTZ`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS aceite_ip TEXT`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS aceite_user_agent TEXT`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS indicacao_tipo_chave_pix TEXT`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS indicacao_chave_pix TEXT`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS indicacao_nome_titular TEXT`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS indicacao_cpf_cnpj_titular TEXT`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS indicacao_pix_atualizado_em TIMESTAMPTZ`);

  await pool.query(`ALTER TABLE saques_indicacoes ADD COLUMN IF NOT EXISTS nome_titular TEXT`);
  await pool.query(`ALTER TABLE saques_indicacoes ADD COLUMN IF NOT EXISTS cpf_cnpj_titular TEXT`);
  await pool.query(`ALTER TABLE saques_indicacoes ADD COLUMN IF NOT EXISTS saldo_disponivel NUMERIC(10,2)`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS solicitacoes_exclusao_conta (
      id BIGSERIAL PRIMARY KEY,
      profissional_id BIGINT REFERENCES profissionais(id) ON DELETE SET NULL,
      motivo TEXT,
      status TEXT NOT NULL DEFAULT 'aguardando',
      observacao_admin TEXT,
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW(),
      finalizado_em TIMESTAMPTZ
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_solicitacoes_exclusao_profissional_status ON solicitacoes_exclusao_conta(profissional_id, status)`);
}

async function garantirCodigoIndicacao(profissionalId) {
  await garantirSistemaIndicacoes();
  const atual = await pool.query('SELECT id, nome, whatsapp, codigo_indicacao FROM profissionais WHERE id=$1', [profissionalId]);
  if (atual.rowCount === 0) return '';
  if (atual.rows[0].codigo_indicacao) return atual.rows[0].codigo_indicacao;

  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const codigo = gerarCodigoIndicacaoLocal(atual.rows[0].nome, atual.rows[0].whatsapp);
    try {
      const result = await pool.query('UPDATE profissionais SET codigo_indicacao=$1 WHERE id=$2 RETURNING codigo_indicacao', [codigo, profissionalId]);
      return result.rows[0]?.codigo_indicacao || codigo;
    } catch (error) {
      if (!String(error.message || '').includes('duplicate')) throw error;
    }
  }

  const fallback = limparCodigoIndicacao(`NS${profissionalId}${crypto.randomBytes(3).toString('hex')}`);
  await pool.query('UPDATE profissionais SET codigo_indicacao=$1 WHERE id=$2', [fallback, profissionalId]);
  return fallback;
}

async function liberarIndicacoesVencidas(indicadorId = null) {
  await garantirSistemaIndicacoes();
  const params = [];
  let filtro = '';
  if (indicadorId) {
    params.push(indicadorId);
    filtro = ` AND indicador_id=$${params.length}`;
  }
  await pool.query(
    `UPDATE indicacoes
     SET status='disponivel', atualizado_em=NOW()
     WHERE status='pendente_liberacao'
       AND liberado_em IS NOT NULL
       AND liberado_em <= NOW()
       ${filtro}`,
    params
  );
}

async function processarIndicacaoPorPagamento(pagamento, planoKey = '') {
  try {
    await garantirSistemaIndicacoes();
    const chavePlano = String(planoKey || pagamento?.plano_key || pagamento?.plano || '').toLowerCase();
    if (chavePlano !== 'top') return;

    const indicadoRes = await pool.query(
      `SELECT id, nome, email, whatsapp, status, indicado_por_id, indicado_por_codigo
       FROM profissionais
       WHERE id=$1`,
      [pagamento.profissional_id]
    );

    if (indicadoRes.rowCount === 0) return;
    const indicado = indicadoRes.rows[0];
    if (!indicado.indicado_por_id) return;

    const indicadorRes = await pool.query('SELECT id, email, whatsapp FROM profissionais WHERE id=$1', [indicado.indicado_por_id]);
    if (indicadorRes.rowCount === 0) return;
    const indicador = indicadorRes.rows[0];

    const mesmoWhatsapp = limparNumero(indicador.whatsapp) && limparNumero(indicador.whatsapp) === limparNumero(indicado.whatsapp);
    const mesmoEmail = String(indicador.email || '').trim().toLowerCase() && String(indicador.email || '').trim().toLowerCase() === String(indicado.email || '').trim().toLowerCase();
    if (Number(indicador.id) === Number(indicado.id) || mesmoWhatsapp || mesmoEmail) {
      await pool.query(
        `INSERT INTO indicacoes (indicador_id, indicado_id, pagamento_id, codigo_indicacao, plano_key, valor_comissao, status, motivo, confirmado_em)
         VALUES ($1,$2,$3,$4,$5,$6,'cancelada','Indicação cancelada por dados iguais ao indicador.',NOW())
         ON CONFLICT (indicado_id) DO UPDATE SET status='cancelada', motivo=EXCLUDED.motivo, atualizado_em=NOW()`,
        [indicador.id, indicado.id, pagamento.id, indicado.indicado_por_codigo || '', chavePlano, INDICACAO_COMISSAO_TOP]
      );
      return;
    }

    const aprovado = indicado.status === 'aprovado';
    const liberadoEm = aprovado ? new Date(Date.now() + INDICACAO_DIAS_LIBERACAO * 24 * 60 * 60 * 1000).toISOString() : null;
    const status = aprovado ? 'pendente_liberacao' : 'aguardando_aprovacao';
    const motivo = aprovado
      ? `Comissão confirmada. Liberação automática após ${INDICACAO_DIAS_LIBERACAO} dias.`
      : 'Aguardando aprovação/publicação do profissional indicado.';

    await pool.query(
      `INSERT INTO indicacoes
       (indicador_id, indicado_id, pagamento_id, codigo_indicacao, plano_key, valor_comissao, status, motivo, liberado_em, confirmado_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
       ON CONFLICT (indicado_id) DO UPDATE SET
         pagamento_id=EXCLUDED.pagamento_id,
         plano_key=EXCLUDED.plano_key,
         valor_comissao=EXCLUDED.valor_comissao,
         status=CASE WHEN indicacoes.status IN ('saque_solicitado','pago') THEN indicacoes.status ELSE EXCLUDED.status END,
         motivo=EXCLUDED.motivo,
         liberado_em=EXCLUDED.liberado_em,
         confirmado_em=COALESCE(indicacoes.confirmado_em, NOW()),
         atualizado_em=NOW()`,
      [indicador.id, indicado.id, pagamento.id, indicado.indicado_por_codigo || '', chavePlano, INDICACAO_COMISSAO_TOP, status, motivo, liberadoEm]
    );
  } catch (error) {
    console.error('Erro ao processar comissão de indicação:', error.message);
  }
}

async function processarIndicacaoDoIndicado(indicadoId) {
  const pagamento = await pool.query(
    `SELECT * FROM pagamentos
     WHERE profissional_id=$1 AND status='pago' AND COALESCE(plano_key, plano)='top'
     ORDER BY pago_em DESC NULLS LAST, criado_em DESC
     LIMIT 1`,
    [indicadoId]
  );
  if (pagamento.rowCount > 0) {
    await processarIndicacaoPorPagamento(pagamento.rows[0], 'top');
  }
}

function statusIndicacaoLabel(status) {
  const mapa = {
    pendente: 'Pendente',
    aguardando_aprovacao: 'Aguardando aprovação',
    pendente_liberacao: 'Em liberação',
    disponivel: 'Disponível',
    saque_solicitado: 'Saque solicitado',
    pago: 'Pago',
    cancelada: 'Cancelada'
  };
  return mapa[status] || status || 'Pendente';
}

function dinheiroEfi(valor) {
  return Number(valor || 0).toFixed(2);
}

async function criarCobrancaPixEfi({ txid, plano, profissional }) {
  const token = await obterTokenEfi();
  const body = {
    calendario: { expiracao: EFI_PIX_EXPIRACAO },
    valor: { original: dinheiroEfi(plano.valor) },
    chave: EFI_PIX_KEY,
    solicitacaoPagador: `Norte Servic - ${plano.nome} - ${profissional.nome || 'Profissional'}`
  };

  const cobranca = await efiRequest('PUT', `/v2/cob/${encodeURIComponent(txid)}`, body, token);
  const locId = cobranca?.loc?.id || cobranca?.loc?.idLoc || null;

  let qrcode = {};
  if (locId) {
    qrcode = await efiRequest('GET', `/v2/loc/${encodeURIComponent(locId)}/qrcode`, null, token);
  }

  return { cobranca, qrcode, locId };
}

async function consultarCobrancaPixEfi(txid) {
  const token = await obterTokenEfi();
  return efiRequest('GET', `/v2/cob/${encodeURIComponent(txid)}`, null, token);
}

function isoSemMilissegundos(data) {
  return new Date(data).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

async function consultarPixRecebidoPorTxidEfi(txid, criadoEm = null) {
  const token = await obterTokenEfi();

  const inicio = new Date(criadoEm || Date.now());
  inicio.setDate(inicio.getDate() - 2);

  const fim = new Date();
  fim.setDate(fim.getDate() + 1);

  const query = new URLSearchParams({
    inicio: isoSemMilissegundos(inicio),
    fim: isoSemMilissegundos(fim),
    txid: String(txid || '')
  });

  return efiRequest('GET', `/v2/pix?${query.toString()}`, null, token);
}

async function ativarPlanoPorPagamento(pagamento, raw = {}) {
  if (!pagamento || pagamento.status === 'pago') return pagamento;

  const planoKey = pagamento.plano_key || pagamento.plano;
  const plano = PLANOS_EFI[planoKey];
  if (!plano) throw new Error('Plano do pagamento não encontrado.');

  const vencimento = new Date();
  vencimento.setDate(vencimento.getDate() + Number(plano.dias || 30) + BONUS_DIAS_PLANO);

  await pool.query('BEGIN');
  try {
    const pagamentoAtualizado = await pool.query(
      `UPDATE pagamentos
       SET status='pago', efi_status='CONCLUIDA', pago_em=NOW(), raw_retorno=$1, atualizado_em=NOW()
       WHERE id=$2
       RETURNING *`,
      [raw, pagamento.id]
    );

    await pool.query(
      `UPDATE profissionais
       SET plano_atual=$1,
           plano_status='ativo',
           plano_vencimento=$2,
           verificado=true
       WHERE id=$3`,
      [plano.planoAtual, vencimento.toISOString().slice(0, 10), pagamento.profissional_id]
    );

    await pool.query('COMMIT');
    await processarIndicacaoPorPagamento(pagamentoAtualizado.rows[0], planoKey);
    return pagamentoAtualizado.rows[0];
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}

async function verificarEAtualizarPagamento(pagamento) {
  if (!pagamento) return null;
  if (pagamento.status === 'pago') return pagamento;

  const cobranca = await consultarCobrancaPixEfi(pagamento.txid);

  if (cobranca?.status === 'CONCLUIDA') {
    return ativarPlanoPorPagamento(pagamento, { origem: 'cobranca', cobranca });
  }

  let pixConsulta = null;
  try {
    pixConsulta = await consultarPixRecebidoPorTxidEfi(pagamento.txid, pagamento.criado_em);
    const pixRecebidos = Array.isArray(pixConsulta?.pix) ? pixConsulta.pix : [];
    const pixConfirmado = pixRecebidos.find((pix) => String(pix.txid || pix.txId || '') === String(pagamento.txid));

    if (pixConfirmado) {
      return ativarPlanoPorPagamento(pagamento, { origem: 'consulta_pix', cobranca, pixConsulta, pixConfirmado });
    }
  } catch (erroPix) {
    pixConsulta = { erro: erroPix.message };
  }

  await pool.query(
    `UPDATE pagamentos
     SET raw_retorno=$1, atualizado_em=NOW()
     WHERE id=$2`,
    [{ cobranca, pixConsulta }, pagamento.id]
  );

  return {
    ...pagamento,
    status_efi: cobranca?.status || '',
    mensagem_status: 'Pagamento não identificado pela Norte Servic. Tente novamente em alguns instantes.'
  };
}

function storageConfigurado() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && SUPABASE_STORAGE_BUCKET);
}

function dataUrlParaBuffer(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null;

  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;

  const mime = match[1];
  const base64 = match[2];
  const buffer = Buffer.from(base64, 'base64');

  let extensao = 'jpg';
  if (mime.includes('png')) extensao = 'png';
  if (mime.includes('webp')) extensao = 'webp';
  if (mime.includes('jpeg') || mime.includes('jpg')) extensao = 'jpg';

  return { buffer, mime, extensao };
}

function caminhoStorageFromUrl(url) {
  if (!url || typeof url !== 'string' || !storageConfigurado()) return '';

  const marcador = `/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/`;
  const index = url.indexOf(marcador);
  if (index === -1) return '';

  return decodeURIComponent(url.slice(index + marcador.length).split('?')[0]);
}

async function excluirArquivoStorage(url) {
  const caminho = caminhoStorageFromUrl(url);
  if (!caminho) return;

  try {
    await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${encodeURI(caminho)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY
      }
    });
  } catch (_) {
    // Falha ao apagar no Storage não deve impedir o salvamento do perfil.
  }
}

const FONTE_BLOCO_NORTE_SERVIC = {
  N: ['1001', '1101', '1011', '1001', '1001'],
  O: ['111', '101', '101', '101', '111'],
  R: ['1110', '1001', '1110', '1010', '1001'],
  T: ['11111', '00100', '00100', '00100', '00100'],
  E: ['1111', '1000', '1110', '1000', '1111'],
  S: ['1111', '1000', '1110', '0001', '1110'],
  V: ['1001', '1001', '1001', '0101', '0010'],
  I: ['111', '010', '010', '010', '111'],
  C: ['1111', '1000', '1000', '1000', '1111'],
  ' ': ['0', '0', '0', '0', '0']
};

function textoBlocoSvgNorteServic(texto, x, y, escala, opcoes = {}) {
  const fill = opcoes.fill || '#ffffff';
  const opacity = opcoes.opacity ?? 0.36;
  const stroke = opcoes.stroke || 'rgba(17,24,39,0.28)';
  const strokeWidth = opcoes.strokeWidth ?? 0.35;
  const radius = Math.max(0.6, escala * 0.18);
  let cursorX = x;
  let saida = '';

  String(texto || '').toUpperCase().split('').forEach((letra) => {
    const matriz = FONTE_BLOCO_NORTE_SERVIC[letra] || FONTE_BLOCO_NORTE_SERVIC[' '];
    const larguraLetra = Math.max(...matriz.map((linha) => linha.length));

    matriz.forEach((linha, linhaIndex) => {
      linha.split('').forEach((pixel, colunaIndex) => {
        if (pixel !== '1') return;
        saida += `<rect x="${(cursorX + colunaIndex * escala).toFixed(2)}" y="${(y + linhaIndex * escala).toFixed(2)}" width="${(escala * 0.86).toFixed(2)}" height="${(escala * 0.86).toFixed(2)}" rx="${radius.toFixed(2)}" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
      });
    });

    cursorX += (larguraLetra + 1.15) * escala;
  });

  return saida;
}

async function processarImagemNorteServic(buffer, opcoes = {}) {
  const {
    marcaDagua = false,
    largura = 800,
    altura = 800,
    qualidade = 82
  } = opcoes;

  let imagem = sharp(buffer)
    .rotate()
    .resize(largura, altura, {
      fit: 'cover',
      position: 'center'
    });

  if (marcaDagua) {
    const blocoSelo = Math.max(3.2, largura * 0.0052);

    const seloW = largura * 0.34;
    const seloH = altura * 0.058;
    const seloX = largura - seloW - largura * 0.035;
    const seloY = altura * 0.035;
    const seloTexto = textoBlocoSvgNorteServic('NORTE SERVIC', seloX + largura * 0.028, seloY + altura * 0.019, blocoSelo, {
      opacity: 0.95,
      fill: '#ffffff',
      stroke: 'rgba(255,255,255,0)',
      strokeWidth: 0
    });

    const marca = `
      <svg width="${largura}" height="${altura}" viewBox="0 0 ${largura} ${altura}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.45"/>
          </filter>
        </defs>
        <rect x="${seloX}" y="${seloY}" width="${seloW}" height="${seloH}" rx="${seloH / 2}" fill="#0f172a" fill-opacity="0.72"/>
        <rect x="${seloX + 2}" y="${seloY + 2}" width="${seloW - 4}" height="${seloH - 4}" rx="${(seloH - 4) / 2}" fill="#2563eb" fill-opacity="0.34"/>
        ${seloTexto}
      </svg>
    `;

    imagem = imagem.composite([
      {
        input: Buffer.from(marca),
        gravity: 'center'
      }
    ]);
  }

  return await imagem
    .jpeg({
      quality: qualidade,
      mozjpeg: true
    })
    .toBuffer();
}

async function enviarImagemStorage(imagem, pasta, nomeBase, opcoesImagem = {}) {
  if (!imagem) return '';

  // Compatibilidade com imagens antigas/salvas como URL.
  if (typeof imagem === 'string' && !imagem.startsWith('data:')) return imagem;

  const arquivo = dataUrlParaBuffer(imagem);
  if (!arquivo) return '';

  if (!storageConfigurado()) {
    // Fallback local/teste: se o Storage ainda não foi configurado, mantém Base64.
    return imagem;
  }

  arquivo.buffer = await processarImagemNorteServic(arquivo.buffer, opcoesImagem);
  arquivo.mime = 'image/jpeg';
  arquivo.extensao = 'jpg';

  const safePasta = String(pasta || 'profissionais').replace(/[^a-zA-Z0-9/_-]/g, '-');
  const safeNome = String(nomeBase || `foto-${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '-');
  const caminho = `${safePasta}/${safeNome}-${Date.now()}-${Math.random().toString(36).slice(2)}.${arquivo.extensao}`;

  const resposta = await fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${encodeURI(caminho)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': arquivo.mime,
      'x-upsert': 'true'
    },
    body: arquivo.buffer
  });

  if (!resposta.ok) {
    const texto = await resposta.text().catch(() => '');
    throw new Error(`Erro ao enviar imagem para o Supabase Storage. ${texto}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${encodeURI(caminho)}`;
}

async function processarImagensProfissional(dados, pasta, imagensAnteriores = {}) {
  const fotoAnterior = imagensAnteriores.fotoPerfil || '';
  const fotosAnteriores = Array.isArray(imagensAnteriores.fotosTrabalhos) ? imagensAnteriores.fotosTrabalhos : [];

  let fotoPerfil = dados.fotoPerfil || dados.foto_perfil || fotoAnterior || '';

  if (fotoPerfil && typeof fotoPerfil === 'string' && fotoPerfil.startsWith('data:')) {
    const novaFoto = await enviarImagemStorage(fotoPerfil, pasta, 'foto-perfil', {
      marcaDagua: false,
      largura: 700,
      altura: 700,
      qualidade: 86
    });
    if (fotoAnterior && fotoAnterior !== novaFoto) await excluirArquivoStorage(fotoAnterior);
    fotoPerfil = novaFoto;
  }

  const fotosRecebidas = Array.isArray(dados.fotosTrabalhos || dados.fotos_trabalhos)
    ? (dados.fotosTrabalhos || dados.fotos_trabalhos)
    : [];

  const fotosTrabalhos = [];

  for (let i = 0; i < fotosRecebidas.length; i += 1) {
    const foto = fotosRecebidas[i];
    if (!foto) continue;

    if (typeof foto === 'string' && foto.startsWith('data:')) {
      fotosTrabalhos.push(await enviarImagemStorage(foto, `${pasta}/trabalhos`, `servico-${i + 1}`, {
        marcaDagua: true,
        largura: 850,
        altura: 850,
        qualidade: 80
      }));
    } else {
      fotosTrabalhos.push(foto);
    }
  }

  const removidas = fotosAnteriores.filter((foto) => foto && !fotosTrabalhos.includes(foto));
  await Promise.all(removidas.map(excluirArquivoStorage));

  return { fotoPerfil, fotosTrabalhos };
}

function profissionalParaFrontend(row, opcoes = {}) {
  const { incluirFotosTrabalhos = true } = opcoes;
  if (!row) return null;

  return {
    id: Number(row.id),
    nome: row.nome,
    email: row.email || '',
    tipoProfissional: row.tipo_profissional || '',
    categoria: row.categoria || '',
    profissao: row.profissao || '',
    servicos: row.servicos || '',
    palavrasChave: row.palavras_chave || '',
    cidade: row.cidade || '',
    bairro: row.bairro || '',
    atendeOutrasCidades: row.atende_outras_cidades || '',
    cidadesAtendidas: parseJsonArray(row.cidades_atendidas),
    formaAtendimento: row.forma_atendimento || '',
    whatsapp: row.whatsapp || '',
    instagram: row.instagram || '',
    descricao: row.descricao || '',
    fotoPerfil: row.foto_perfil || '',
    fotosTrabalhos: incluirFotosTrabalhos ? parseJsonArray(row.fotos_trabalhos) : [],
    avaliacao: row.avaliacao || 'Novo',
    avaliacoes: Number(row.avaliacoes || 0),
    verificado: Boolean(row.verificado),
    status: row.status || 'pendente',
    planoAtual: row.plano_atual || 'Gratuito',
    planoStatus: row.plano_status || 'ativo',
    planoVencimento: row.plano_vencimento || '',
    codigoIndicacao: row.codigo_indicacao || '',
    indicadoPorId: row.indicado_por_id || null,
    indicadoPorCodigo: row.indicado_por_codigo || '',
    indicacaoTipoChavePix: row.indicacao_tipo_chave_pix || '',
    indicacaoChavePix: row.indicacao_chave_pix || '',
    indicacaoNomeTitular: row.indicacao_nome_titular || '',
    indicacaoCpfCnpjTitular: row.indicacao_cpf_cnpj_titular || '',
    stripeCustomerId: row.stripe_customer_id || '',
    stripeSubscriptionId: row.stripe_subscription_id || '',
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em
  };
}

function gerarToken(profissional) {
  return jwt.sign(
    { id: profissional.id, whatsapp: profissional.whatsapp },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}


function autenticar(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ erro: 'Login necessário.' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (_) {
    return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' });
  }
}

function autenticarProfissional(req, res, next) {
  autenticar(req, res, () => {
    req.profissional = req.user;
    next();
  });
}


async function garantirTabelaAvaliacoes() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS avaliacoes (
      id BIGSERIAL PRIMARY KEY,
      profissional_id BIGINT REFERENCES profissionais(id) ON DELETE CASCADE,
      nome_cliente TEXT NOT NULL,
      nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
      comentario TEXT,
      status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'recusado')),
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_avaliacoes_profissional ON avaliacoes(profissional_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_avaliacoes_status ON avaliacoes(status)`);
}

async function recalcularMediaProfissional(profissionalId) {
  const media = await pool.query(
    `SELECT COUNT(*)::int AS total, ROUND(AVG(nota)::numeric, 1) AS media
     FROM avaliacoes
     WHERE profissional_id=$1 AND status='aprovado'`,
    [profissionalId]
  );

  const total = Number(media.rows[0]?.total || 0);
  const valor = media.rows[0]?.media;
  const avaliacaoTexto = total > 0 ? String(valor).replace('.', ',') : 'Novo';

  await pool.query(
    `UPDATE profissionais SET avaliacao=$1, avaliacoes=$2 WHERE id=$3`,
    [avaliacaoTexto, total, profissionalId]
  );
}

function avaliacaoParaFrontend(row) {
  if (!row) return null;

  return {
    id: row.id !== undefined && row.id !== null ? String(row.id) : '',
    profissionalId: Number(row.profissional_id),
    nomeCliente: row.nome_cliente,
    nota: Number(row.nota),
    comentario: row.comentario || '',
    status: row.status || 'pendente',
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    profissionalNome: row.profissional_nome || '',
    profissionalProfissao: row.profissional_profissao || '',
    profissionalCidade: row.profissional_cidade || ''
  };
}

garantirTabelaAvaliacoes().catch((error) => {
  console.error('Erro ao garantir tabela de avaliações:', error.message);
});


/* ================================================= */
/* NORTE SERVIC CIDADE PARCEIRA / COLETA EM CAMPO */
/* ================================================= */

const SETORES_CIDADE_PARCEIRA = ['Nova Canaã', 'Nova Muricilândia', 'Centro'];

function normalizarBooleanoCidade(valor) {
  return valor === true || valor === 'true' || valor === 'sim' || valor === 'Sim' || valor === 'SIM' || valor === 1 || valor === '1';
}

function gerarTokenCidade(payload, expira = '12h') {
  return jwt.sign(payload, CIDADE_JWT_SECRET, { expiresIn: expira });
}

function autenticarCidadeParceira(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ erro: 'Senha da Cidade Parceira necessária.' });
  }

  try {
    const dados = jwt.verify(token, CIDADE_JWT_SECRET);
    if (dados.tipo !== 'cidade-parceira') {
      return res.status(401).json({ erro: 'Acesso da Cidade Parceira inválido.' });
    }
    req.cidadeParceira = dados;
    next();
  } catch (_) {
    return res.status(401).json({ erro: 'Sessão da Cidade Parceira expirada. Digite a senha novamente.' });
  }
}

function autenticarColetorCidade(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ erro: 'Login do coletor necessário.' });
  }

  try {
    const dados = jwt.verify(token, CIDADE_JWT_SECRET);
    if (dados.tipo !== 'coletor-cidade') {
      return res.status(401).json({ erro: 'Acesso do coletor inválido.' });
    }
    req.coletorCidade = dados;
    next();
  } catch (_) {
    return res.status(401).json({ erro: 'Sessão do coletor expirada. Faça login novamente.' });
  }
}

async function garantirSistemaCidadeParceira() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cidade_coletores (
      id BIGSERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      setor_fixo TEXT NOT NULL,
      ativo BOOLEAN DEFAULT true,
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cidade_coleta_profissionais (
      id BIGSERIAL PRIMARY KEY,
      coletor_id BIGINT REFERENCES cidade_coletores(id) ON DELETE SET NULL,
      nome TEXT NOT NULL,
      whatsapp TEXT,
      email_profissional TEXT,
      instagram TEXT,
      categoria TEXT,
      profissao TEXT NOT NULL,
      servicos TEXT,
      cidade TEXT DEFAULT 'Muricilândia - TO',
      setor TEXT NOT NULL,
      bairro TEXT,
      descricao TEXT,
      aceita_site BOOLEAN DEFAULT false,
      profissional_site_id BIGINT REFERENCES profissionais(id) ON DELETE SET NULL,
      status_coleta TEXT DEFAULT 'coletado',
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`ALTER TABLE cidade_coleta_profissionais ADD COLUMN IF NOT EXISTS email_profissional TEXT`);
  await pool.query(`ALTER TABLE cidade_coleta_profissionais ADD COLUMN IF NOT EXISTS instagram TEXT`);
  await pool.query(`ALTER TABLE cidade_coletores ADD COLUMN IF NOT EXISTS telefone TEXT`);
  await pool.query(`ALTER TABLE cidade_coletores ADD COLUMN IF NOT EXISTS valor_comissao_cadastro NUMERIC(10,2) DEFAULT ${CIDADE_COMISSAO_VALOR_CADASTRO}`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cidade_saques_coletores (
      id BIGSERIAL PRIMARY KEY,
      coletor_id BIGINT REFERENCES cidade_coletores(id) ON DELETE SET NULL,
      valor NUMERIC(10,2) NOT NULL DEFAULT 0,
      cadastros_contados INTEGER DEFAULT 0,
      data_referencia DATE DEFAULT CURRENT_DATE,
      status TEXT DEFAULT 'aguardando',
      observacao_admin TEXT,
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS origem_cidade_parceira BOOLEAN DEFAULT false`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS cidade_coleta_id BIGINT`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS setor_coleta TEXT`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS aceita_aparecer_site BOOLEAN DEFAULT false`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS perfil_coleta_pendente BOOLEAN DEFAULT false`);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_cidade_coletores_email ON cidade_coletores(email)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_cidade_coleta_setor ON cidade_coleta_profissionais(setor)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_cidade_coleta_profissao ON cidade_coleta_profissionais(profissao)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_cidade_coleta_aceita_site ON cidade_coleta_profissionais(aceita_site)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_cidade_saques_coletores_status ON cidade_saques_coletores(status)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_cidade_saques_coletores_coletor_data ON cidade_saques_coletores(coletor_id, data_referencia)`);

  const coletoresPadrao = [
    { nome: 'Coletor Nova Canaã', email: 'coletor.novacanaa@norteservic.com.br', senha: 'Nova123', setor: 'Nova Canaã' },
    { nome: 'Coletor Nova Muricilândia', email: 'coletor.novamuricilandia@norteservic.com.br', senha: 'Moricilandia123', setor: 'Nova Muricilândia' },
    { nome: 'Coletor Centro', email: 'coletor.centro@norteservic.com.br', senha: 'Centro123', setor: 'Centro' }
  ];

  for (const coletor of coletoresPadrao) {
    const existe = await pool.query('SELECT id FROM cidade_coletores WHERE email=$1 LIMIT 1', [coletor.email]);
    if (existe.rowCount === 0) {
      const senhaHash = await bcrypt.hash(coletor.senha, 10);
      await pool.query(
        `INSERT INTO cidade_coletores (nome, email, senha_hash, setor_fixo, valor_comissao_cadastro, ativo)
         VALUES ($1,$2,$3,$4,$5,true)`,
        [coletor.nome, coletor.email, senhaHash, coletor.setor, CIDADE_COMISSAO_VALOR_CADASTRO]
      );
    }
  }
}

async function publicarColetaNoSiteOficial(coleta, coletorId) {
  const whatsapp = limparNumero(coleta.whatsapp);
  const senhaHash = await bcrypt.hash(crypto.randomBytes(14).toString('hex'), 10);
  const descricao = String(coleta.descricao || `Profissional mapeado pela coleta Cidade Parceira no setor ${coleta.setor}.`).trim();
  const cidade = coleta.cidade || CIDADE_MUNICIPIO_PADRAO;
  const emailProfissional = String(coleta.email_profissional || '').trim().toLowerCase() || null;
  const instagram = String(coleta.instagram || '').trim() || null;

  if (whatsapp) {
    const existente = await pool.query('SELECT id FROM profissionais WHERE whatsapp=$1 LIMIT 1', [whatsapp]);
    if (existente.rowCount > 0) {
      const atualizado = await pool.query(
        `UPDATE profissionais SET
          nome=$1,
          categoria=$2,
          profissao=$3,
          servicos=$4,
          cidade=$5,
          bairro=$6,
          descricao=$7,
          status='aprovado',
          verificado=COALESCE(verificado, false),
          origem_cidade_parceira=true,
          cidade_coleta_id=$8,
          setor_coleta=$9,
          aceita_aparecer_site=true,
          instagram=COALESCE($10, instagram),
          email=COALESCE($11, email),
          perfil_coleta_pendente=true
         WHERE id=$12
         RETURNING *`,
        [
          coleta.nome,
          coleta.categoria || 'Profissionais locais',
          coleta.profissao,
          coleta.servicos || coleta.profissao,
          cidade,
          coleta.bairro || coleta.setor,
          descricao,
          coleta.id,
          coleta.setor,
          instagram,
          emailProfissional,
          existente.rows[0].id
        ]
      );
      return atualizado.rows[0];
    }
  }

  const whatsappFinal = whatsapp || `cidade${coleta.id}${Date.now()}`;

  const result = await pool.query(
    `INSERT INTO profissionais (
      nome, email, senha_hash, tipo_profissional, categoria, profissao, servicos,
      palavras_chave, cidade, bairro, atende_outras_cidades, cidades_atendidas,
      forma_atendimento, whatsapp, instagram, descricao, foto_perfil, fotos_trabalhos,
      status, verificado, plano_atual, plano_status,
      origem_cidade_parceira, cidade_coleta_id, setor_coleta, aceita_aparecer_site,
      perfil_coleta_pendente
    ) VALUES (
      $1,$2,$3,'Profissional local',$4,$5,$6,
      $7,$8,$9,'Não',$10::jsonb,
      'Presencial',$11,$12,$13,NULL,'[]'::jsonb,
      'aprovado',false,'Gratuito','ativo',
      true,$14,$15,true,
      true
    ) RETURNING *`,
    [
      coleta.nome,
      emailProfissional,
      senhaHash,
      coleta.categoria || 'Profissionais locais',
      coleta.profissao,
      coleta.servicos || coleta.profissao,
      `${coleta.profissao} ${coleta.servicos || ''} ${coleta.setor}`,
      cidade,
      coleta.bairro || coleta.setor,
      JSON.stringify([cidade]),
      whatsappFinal,
      instagram,
      descricao,
      coleta.id,
      coleta.setor
    ]
  );

  return result.rows[0];
}

function coletaParaFrontend(row) {
  return {
    id: Number(row.id),
    nome: row.nome || '',
    whatsapp: row.whatsapp || '',
    emailProfissional: row.email_profissional || '',
    instagram: row.instagram || '',
    categoria: row.categoria || '',
    profissao: row.profissao || '',
    servicos: row.servicos || '',
    cidade: row.cidade || CIDADE_MUNICIPIO_PADRAO,
    setor: row.setor || '',
    bairro: row.bairro || '',
    descricao: row.descricao || '',
    aceitaSite: Boolean(row.aceita_site),
    profissionalSiteId: row.profissional_site_id ? Number(row.profissional_site_id) : null,
    statusColeta: row.status_coleta || 'coletado',
    criadoEm: row.criado_em,
    coletorNome: row.coletor_nome || ''
  };
}


function coletorCidadeParaFrontend(row) {
  return {
    id: Number(row.id),
    nome: row.nome || '',
    email: row.email || '',
    telefone: row.telefone || '',
    setor: row.setor_fixo || '',
    ativo: row.ativo !== false,
    valorComissaoCadastro: Number(row.valor_comissao_cadastro || CIDADE_COMISSAO_VALOR_CADASTRO),
    totalCadastros: Number(row.total_cadastros || 0),
    cadastrosHoje: Number(row.cadastros_hoje || 0),
    aceitosSite: Number(row.aceitos_site || 0),
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em
  };
}

function saqueColetorParaFrontend(row) {
  return {
    id: Number(row.id),
    coletorId: row.coletor_id ? Number(row.coletor_id) : null,
    coletorNome: row.coletor_nome || 'Coletor',
    coletorEmail: row.coletor_email || '',
    coletorTelefone: row.coletor_telefone || '',
    setor: row.setor_fixo || '',
    valor: Number(row.valor || 0),
    cadastrosContados: Number(row.cadastros_contados || 0),
    dataReferencia: row.data_referencia,
    status: row.status || 'aguardando',
    observacaoAdmin: row.observacao_admin || '',
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em
  };
}

async function buscarComissaoColetorCidade(coletorId) {
  const result = await pool.query(
    `SELECT id, valor_comissao_cadastro FROM cidade_coletores WHERE id=$1 LIMIT 1`,
    [coletorId]
  );
  return Number(result.rows[0]?.valor_comissao_cadastro || CIDADE_COMISSAO_VALOR_CADASTRO);
}

garantirSistemaIndicacoes().catch((error) => {
  console.error('Erro ao garantir sistema de indicações:', error.message);
});

garantirSistemaLegal().catch((error) => {
  console.error('Erro ao garantir sistema legal/LGPD:', error.message);
});

garantirSistemaCidadeParceira().catch((error) => {
  console.error('Erro ao garantir sistema Cidade Parceira:', error.message);
});


function autenticarAdmin(req, res, next) {
  const senha = req.headers['x-admin-password'];

  if (senha !== ADMIN_PASSWORD) {
    return res.status(401).json({ erro: 'Acesso administrativo negado.' });
  }

  next();
}

app.get('/api/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as agora');
    res.json({ ok: true, banco: true, storage: storageConfigurado(), agora: result.rows[0].agora });
  } catch (error) {
    res.status(500).json({ ok: false, banco: false, erro: error.message });
  }
});

app.get('/api/profissionais', async (req, res) => {
  try {
    const { q = '', cidade = '' } = req.query;
    const termo = `%${String(q).toLowerCase()}%`;
    const cidadeTermo = `%${String(cidade).toLowerCase()}%`;

    const params = [];
    let where = "WHERE status = 'aprovado'";

    if (q) {
      params.push(termo);
      where += ` AND LOWER(CONCAT_WS(' ', nome, tipo_profissional, categoria, profissao, servicos, palavras_chave, cidade, bairro, forma_atendimento, descricao)) LIKE $${params.length}`;
    }

    if (cidade) {
      params.push(cidadeTermo);
      where += ` AND (LOWER(cidade) LIKE $${params.length} OR LOWER(cidades_atendidas::text) LIKE $${params.length})`;
    }

    const sql = `
      SELECT * FROM profissionais
      ${where}
      ORDER BY
        CASE plano_atual
          WHEN 'Premium' THEN 1
          WHEN 'Profissional' THEN 2
          WHEN 'Destaque' THEN 3
          ELSE 4
        END,
        verificado DESC,
        criado_em DESC
    `;

    const result = await pool.query(sql, params);
    res.json(result.rows.map((row) => profissionalParaFrontend(row, { incluirFotosTrabalhos: false })));
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar profissionais.', detalhe: error.message });
  }
});

app.get('/api/profissionais/:id', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM profissionais WHERE id = $1 AND status = 'aprovado'",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Profissional não encontrado.' });
    }

    res.json(profissionalParaFrontend(result.rows[0]));
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao carregar perfil.', detalhe: error.message });
  }
});


app.get('/api/profissionais/:id/avaliacoes', async (req, res) => {
  try {
    await garantirTabelaAvaliacoes();

    const result = await pool.query(
      `SELECT * FROM avaliacoes
       WHERE profissional_id=$1 AND status='aprovado'
       ORDER BY criado_em DESC
       LIMIT 20`,
      [req.params.id]
    );

    res.json(result.rows.map(avaliacaoParaFrontend));
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao carregar avaliações.', detalhe: error.message });
  }
});

app.post('/api/profissionais/:id/avaliacoes', async (req, res) => {
  try {
    await garantirTabelaAvaliacoes();

    const profissional = await pool.query(
      "SELECT id FROM profissionais WHERE id=$1 AND status='aprovado'",
      [req.params.id]
    );

    if (profissional.rowCount === 0) {
      return res.status(404).json({ erro: 'Profissional não encontrado para avaliação.' });
    }

    const nomeCliente = String(req.body.nomeCliente || req.body.nome_cliente || '').trim();
    const nota = Number(req.body.nota);
    const comentario = String(req.body.comentario || '').trim();

    if (!nomeCliente || nomeCliente.length < 2) {
      return res.status(400).json({ erro: 'Informe seu nome para enviar a avaliação.' });
    }

    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
      return res.status(400).json({ erro: 'Escolha uma nota de 1 a 5 estrelas.' });
    }

    if (!comentario || comentario.length < 8) {
      return res.status(400).json({ erro: 'Escreva um comentário curto sobre o atendimento.' });
    }

    const result = await pool.query(
      `INSERT INTO avaliacoes (profissional_id, nome_cliente, nota, comentario, status)
       VALUES ($1, $2, $3, $4, 'pendente')
       RETURNING *`,
      [req.params.id, nomeCliente, nota, comentario]
    );

    res.status(201).json({
      mensagem: 'Avaliação enviada para análise. Ela aparecerá no perfil após aprovação.',
      avaliacao: avaliacaoParaFrontend(result.rows[0])
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao enviar avaliação.', detalhe: error.message });
  }
});


app.post('/api/cadastro', async (req, res) => {
  try {
    const dados = req.body;
    const senha = String(dados.senha || dados.senhaCadastro || '').trim();
    const whatsapp = limparNumero(dados.whatsapp);

    if (!dados.nome || !whatsapp || !senha) {
      return res.status(400).json({ erro: 'Nome, WhatsApp e senha são obrigatórios.' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
    }

    const aceitouTermos = dados.aceitouTermos === true || dados.aceitou_termos === true;
    const aceitouPrivacidade = dados.aceitouPrivacidade === true || dados.aceitou_privacidade === true;

    if (!aceitouTermos || !aceitouPrivacidade) {
      return res.status(400).json({ erro: 'Para concluir o cadastro, aceite os Termos de Uso e a Política de Privacidade.' });
    }

    const existe = await pool.query('SELECT id FROM profissionais WHERE whatsapp = $1', [whatsapp]);

    if (existe.rowCount > 0) {
      return res.status(409).json({ erro: 'Esse WhatsApp já possui cadastro.' });
    }

    await garantirSistemaIndicacoes();
    await garantirSistemaLegal();

    const refIndicacao = limparCodigoIndicacao(dados.refIndicacao || dados.ref || req.query.ref || '');
    let indicadoPorId = null;
    let indicadoPorCodigo = '';

    if (refIndicacao) {
      const indicador = await pool.query(
        'SELECT id, whatsapp, email FROM profissionais WHERE codigo_indicacao=$1 LIMIT 1',
        [refIndicacao]
      );

      if (indicador.rowCount > 0 && limparNumero(indicador.rows[0].whatsapp) !== whatsapp) {
        indicadoPorId = indicador.rows[0].id;
        indicadoPorCodigo = refIndicacao;
      }
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const imagens = await processarImagensProfissional(dados, `profissionais/${whatsapp}`);
    const codigoIndicacaoNovo = gerarCodigoIndicacaoLocal(dados.nome, whatsapp);

    const result = await pool.query(
      `INSERT INTO profissionais (
        nome, email, senha_hash, tipo_profissional, categoria, profissao, servicos,
        palavras_chave, cidade, bairro, atende_outras_cidades, cidades_atendidas,
        forma_atendimento, whatsapp, instagram, descricao, foto_perfil, fotos_trabalhos,
        codigo_indicacao, indicado_por_id, indicado_por_codigo,
        aceitou_termos, aceitou_privacidade, termos_versao, privacidade_versao, aceite_data, aceite_ip, aceite_user_agent,
        status, verificado, plano_atual, plano_status
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16,$17,$18::jsonb,
        $19,$20,$21,
        $22,$23,$24,$25,NOW(),$26,$27,
        'pendente', false, 'Gratuito', 'ativo'
      ) RETURNING *`,
      [
        dados.nome,
        dados.email || null,
        senhaHash,
        dados.tipoProfissional || dados.tipo_profissional || null,
        dados.categoria || null,
        dados.profissao || null,
        dados.servicos || null,
        dados.palavrasChave || dados.palavras_chave || null,
        dados.cidade || null,
        dados.bairro || null,
        dados.atendeOutrasCidades || dados.atende_outras_cidades || null,
        JSON.stringify(dados.cidadesAtendidas || dados.cidades_atendidas || []),
        dados.formaAtendimento || dados.forma_atendimento || null,
        whatsapp,
        dados.instagram || null,
        dados.descricao || null,
        imagens.fotoPerfil || null,
        JSON.stringify(imagens.fotosTrabalhos || []),
        codigoIndicacaoNovo,
        indicadoPorId,
        indicadoPorCodigo || null,
        true,
        true,
        String(dados.termosVersao || dados.termos_versao || TERMOS_VERSAO_ATUAL),
        String(dados.privacidadeVersao || dados.privacidade_versao || PRIVACIDADE_VERSAO_ATUAL),
        req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
        req.headers['user-agent'] || ''
      ]
    );

    res.status(201).json({ mensagem: 'Cadastro enviado para análise.', profissional: profissionalParaFrontend(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cadastrar profissional.', detalhe: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const whatsapp = limparNumero(req.body.whatsapp);
    const senha = String(req.body.senha || '').trim();

    const result = await pool.query('SELECT * FROM profissionais WHERE whatsapp = $1', [whatsapp]);

    if (result.rowCount === 0) {
      return res.status(401).json({ erro: 'WhatsApp ou senha incorretos.' });
    }

    const profissional = result.rows[0];
    const senhaOk = await bcrypt.compare(senha, profissional.senha_hash);

    if (!senhaOk) {
      return res.status(401).json({ erro: 'WhatsApp ou senha incorretos.' });
    }

    const token = gerarToken(profissional);

    res.json({ token, profissional: profissionalParaFrontend(profissional) });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao fazer login.', detalhe: error.message });
  }
});

app.get('/api/me', autenticar, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM profissionais WHERE id = $1', [req.user.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Profissional não encontrado.' });
    }

    if (!result.rows[0].codigo_indicacao) {
      result.rows[0].codigo_indicacao = await garantirCodigoIndicacao(req.user.id);
    }

    res.json(profissionalParaFrontend(result.rows[0]));
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao carregar conta.', detalhe: error.message });
  }
});

app.put('/api/me', autenticar, async (req, res) => {
  try {
    const dados = req.body;

    const atual = await pool.query('SELECT * FROM profissionais WHERE id = $1', [req.user.id]);

    if (atual.rowCount === 0) {
      return res.status(404).json({ erro: 'Profissional não encontrado.' });
    }

    const anterior = atual.rows[0];
    const novoWhatsapp = limparNumero(dados.whatsapp || anterior.whatsapp);
    const imagens = await processarImagensProfissional(dados, `profissionais/${req.user.id}`, {
      fotoPerfil: anterior.foto_perfil || '',
      fotosTrabalhos: parseJsonArray(anterior.fotos_trabalhos)
    });

    const dadosImportantesMudaram =
      String(anterior.nome || '').toLowerCase() !== String(dados.nome || '').toLowerCase() ||
      String(anterior.categoria || '').toLowerCase() !== String(dados.categoria || '').toLowerCase() ||
      String(anterior.profissao || '').toLowerCase() !== String(dados.profissao || '').toLowerCase() ||
      String(anterior.whatsapp || '') !== novoWhatsapp;

    let senhaHash = anterior.senha_hash;

    if (dados.senha && String(dados.senha).trim().length >= 6) {
      senhaHash = await bcrypt.hash(String(dados.senha).trim(), 10);
    }

    const result = await pool.query(
      `UPDATE profissionais SET
        nome=$1, email=$2, senha_hash=$3, tipo_profissional=$4, categoria=$5,
        profissao=$6, servicos=$7, palavras_chave=$8, cidade=$9, bairro=$10,
        atende_outras_cidades=$11, cidades_atendidas=$12::jsonb, forma_atendimento=$13,
        whatsapp=$14, instagram=$15, descricao=$16, foto_perfil=$17, fotos_trabalhos=$18::jsonb,
        status=$19
      WHERE id=$20 RETURNING *`,
      [
        dados.nome,
        dados.email || null,
        senhaHash,
        dados.tipoProfissional || null,
        dados.categoria || null,
        dados.profissao || null,
        dados.servicos || null,
        dados.palavrasChave || null,
        dados.cidade || null,
        dados.bairro || null,
        dados.atendeOutrasCidades || null,
        JSON.stringify(dados.cidadesAtendidas || []),
        dados.formaAtendimento || null,
        novoWhatsapp,
        dados.instagram || null,
        dados.descricao || null,
        imagens.fotoPerfil || anterior.foto_perfil || null,
        JSON.stringify(imagens.fotosTrabalhos || parseJsonArray(anterior.fotos_trabalhos)),
        dadosImportantesMudaram ? 'pendente' : anterior.status,
        req.user.id
      ]
    );

    res.json({ mensagem: 'Perfil atualizado.', profissional: profissionalParaFrontend(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar perfil.', detalhe: error.message });
  }
});



async function listarAvaliacoesAdmin(req, res) {
  try {
    await garantirTabelaAvaliacoes();

    const statusSolicitado = String(req.query.status || 'pendente').trim().toLowerCase();
    const params = [];
    const filtros = [
      'a.id IS NOT NULL',
      'a.profissional_id IS NOT NULL',
      'a.nome_cliente IS NOT NULL',
      'a.nota IS NOT NULL'
    ];

    if (statusSolicitado && statusSolicitado !== 'todos') {
      params.push(statusSolicitado);
      filtros.push(`LOWER(TRIM(COALESCE(a.status, 'pendente')))=$${params.length}`);
    }

    const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT
         a.id::text AS id,
         a.profissional_id,
         a.nome_cliente,
         a.nota,
         a.comentario,
         LOWER(TRIM(COALESCE(a.status, 'pendente'))) AS status,
         a.criado_em,
         a.atualizado_em,
         COALESCE(p.nome, 'Profissional removido') AS profissional_nome,
         COALESCE(p.profissao, '') AS profissional_profissao,
         COALESCE(p.cidade, '') AS profissional_cidade
       FROM avaliacoes a
       LEFT JOIN profissionais p ON p.id = a.profissional_id
       ${where}
       ORDER BY a.criado_em DESC
       LIMIT 100`,
      params
    );

    res.json(result.rows.map(avaliacaoParaFrontend).filter(item => item && item.id));
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao carregar avaliações.', detalhe: error.message });
  }
}





app.get('/api/me/dados', autenticar, async (req, res) => {
  try {
    await garantirSistemaLegal();
    const result = await pool.query('SELECT * FROM profissionais WHERE id=$1', [req.user.id]);
    if (result.rowCount === 0) return res.status(404).json({ erro: 'Profissional não encontrado.' });
    const row = result.rows[0];
    res.json({
      exportadoEm: new Date().toISOString(),
      dados: profissionalParaFrontend(row, { incluirFotosTrabalhos: true }),
      aceite: {
        aceitouTermos: !!row.aceitou_termos,
        aceitouPrivacidade: !!row.aceitou_privacidade,
        termosVersao: row.termos_versao || '',
        privacidadeVersao: row.privacidade_versao || '',
        aceiteData: row.aceite_data || null
      }
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao baixar dados.', detalhe: error.message });
  }
});

app.post('/api/me/solicitar-exclusao', autenticar, async (req, res) => {
  try {
    await garantirSistemaLegal();
    const motivo = String(req.body.motivo || '').trim();
    const existente = await pool.query(
      `SELECT id FROM solicitacoes_exclusao_conta WHERE profissional_id=$1 AND status='aguardando' LIMIT 1`,
      [req.user.id]
    );
    if (existente.rowCount > 0) return res.status(409).json({ erro: 'Já existe uma solicitação de exclusão aguardando análise.' });
    const result = await pool.query(
      `INSERT INTO solicitacoes_exclusao_conta (profissional_id, motivo, status)
       VALUES ($1,$2,'aguardando') RETURNING *`,
      [req.user.id, motivo || null]
    );
    res.status(201).json({ mensagem: 'Solicitação de exclusão enviada para análise do administrador.', solicitacao: result.rows[0] });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao solicitar exclusão.', detalhe: error.message });
  }
});

app.get('/api/admin/lgpd/exclusoes', autenticarAdmin, async (_req, res) => {
  try {
    await garantirSistemaLegal();
    const result = await pool.query(
      `SELECT s.*, p.nome AS profissional_nome, p.whatsapp AS profissional_whatsapp, p.email AS profissional_email
       FROM solicitacoes_exclusao_conta s
       LEFT JOIN profissionais p ON p.id = s.profissional_id
       ORDER BY CASE WHEN s.status='aguardando' THEN 0 ELSE 1 END, s.criado_em DESC
       LIMIT 200`
    );
    res.json({ solicitacoes: result.rows });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar solicitações de exclusão.', detalhe: error.message });
  }
});

app.patch('/api/admin/lgpd/exclusoes/:id/aprovar', autenticarAdmin, async (req, res) => {
  try {
    await garantirSistemaLegal();
    const id = Number(req.params.id);
    const observacao = String(req.body.observacao || '').trim();
    await pool.query('BEGIN');
    try {
      const solicitacao = await pool.query(
        `UPDATE solicitacoes_exclusao_conta
         SET status='aprovado', observacao_admin=$1, finalizado_em=NOW(), atualizado_em=NOW()
         WHERE id=$2 AND status='aguardando'
         RETURNING *`,
        [observacao || 'Conta anonimizada conforme solicitação LGPD.', id]
      );
      if (solicitacao.rowCount === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ erro: 'Solicitação não encontrada ou já finalizada.' });
      }
      const profissionalId = solicitacao.rows[0].profissional_id;
      if (profissionalId) {
        await pool.query(
          `UPDATE profissionais SET
             nome='Conta removida', email=NULL, whatsapp=CONCAT('removido_', id::text, '_', COALESCE(whatsapp,'')),
             instagram=NULL, descricao='Conta removida a pedido do titular dos dados.',
             foto_perfil=NULL, fotos_trabalhos='[]'::jsonb, status='recusado', atualizado_em=NOW()
           WHERE id=$1`,
          [profissionalId]
        );
      }
      await pool.query('COMMIT');
      res.json({ mensagem: 'Solicitação aprovada e conta anonimizada.', solicitacao: solicitacao.rows[0] });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao aprovar exclusão.', detalhe: error.message });
  }
});

app.patch('/api/admin/lgpd/exclusoes/:id/recusar', autenticarAdmin, async (req, res) => {
  try {
    await garantirSistemaLegal();
    const id = Number(req.params.id);
    const observacao = String(req.body.observacao || '').trim();
    const result = await pool.query(
      `UPDATE solicitacoes_exclusao_conta
       SET status='recusado', observacao_admin=$1, finalizado_em=NOW(), atualizado_em=NOW()
       WHERE id=$2 AND status='aguardando'
       RETURNING *`,
      [observacao || 'Solicitação recusada pelo administrador.', id]
    );
    if (result.rowCount === 0) return res.status(404).json({ erro: 'Solicitação não encontrada ou já finalizada.' });
    res.json({ mensagem: 'Solicitação recusada.', solicitacao: result.rows[0] });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao recusar exclusão.', detalhe: error.message });
  }
});

app.get('/api/me/indicacoes', autenticarProfissional, async (req, res) => {
  try {
    await garantirSistemaIndicacoes();
    await garantirCodigoIndicacao(req.profissional.id);
    await liberarIndicacoesVencidas(req.profissional.id);

    const profissional = await pool.query(`SELECT id, nome, codigo_indicacao, indicacao_tipo_chave_pix, indicacao_chave_pix, indicacao_nome_titular, indicacao_cpf_cnpj_titular FROM profissionais WHERE id=$1`, [req.profissional.id]);
    if (profissional.rowCount === 0) return res.status(404).json({ erro: 'Profissional não encontrado.' });

    const codigo = profissional.rows[0].codigo_indicacao || await garantirCodigoIndicacao(req.profissional.id);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const link = `${baseUrl}/cadastro.html?ref=${encodeURIComponent(codigo)}`;

    const indicacoes = await pool.query(
      `SELECT i.*, p.nome AS indicado_nome, p.whatsapp AS indicado_whatsapp, p.email AS indicado_email, p.status AS indicado_status, p.plano_atual AS indicado_plano
       FROM indicacoes i
       LEFT JOIN profissionais p ON p.id = i.indicado_id
       WHERE i.indicador_id=$1
       ORDER BY i.criado_em DESC`,
      [req.profissional.id]
    );

    const saques = await pool.query(
      `SELECT * FROM saques_indicacoes
       WHERE profissional_id=$1
       ORDER BY solicitado_em DESC
       LIMIT 30`,
      [req.profissional.id]
    );

    const resumo = indicacoes.rows.reduce((acc, item) => {
      const valor = Number(item.valor_comissao || 0);
      acc.totalIndicacoes += 1;
      if (item.status === 'disponivel') acc.saldoDisponivel += valor;
      if (item.status === 'pendente_liberacao' || item.status === 'aguardando_aprovacao' || item.status === 'pendente') acc.saldoPendente += valor;
      if (item.status === 'pago') acc.totalPago += valor;
      if (item.status === 'saque_solicitado') acc.saldoEmSaque += valor;
      if (['disponivel','pendente_liberacao','saque_solicitado','pago'].includes(item.status)) acc.assinaturasConfirmadas += 1;
      return acc;
    }, { totalIndicacoes: 0, assinaturasConfirmadas: 0, saldoDisponivel: 0, saldoPendente: 0, saldoEmSaque: 0, totalPago: 0 });

    res.json({
      codigo,
      link,
      comissaoPorIndicacao: INDICACAO_COMISSAO_TOP,
      saqueMinimo: INDICACAO_SAQUE_MINIMO,
      diasLiberacao: INDICACAO_DIAS_LIBERACAO,
      resumo,
      dadosPix: {
        tipoChavePix: profissional.rows[0].indicacao_tipo_chave_pix || '',
        chavePix: profissional.rows[0].indicacao_chave_pix || '',
        nomeTitular: profissional.rows[0].indicacao_nome_titular || '',
        cpfCnpjTitular: profissional.rows[0].indicacao_cpf_cnpj_titular || ''
      },
      indicacoes: indicacoes.rows.map(row => ({
        id: row.id,
        indicadoNome: row.indicado_nome || 'Profissional indicado',
        indicadoWhatsapp: row.indicado_whatsapp || '',
        indicadoStatus: row.indicado_status || '',
        indicadoPlano: row.indicado_plano || 'Gratuito',
        planoKey: row.plano_key || '',
        valorComissao: Number(row.valor_comissao || 0),
        status: row.status,
        statusLabel: statusIndicacaoLabel(row.status),
        motivo: row.motivo || '',
        liberadoEm: row.liberado_em,
        criadoEm: row.criado_em,
        confirmadoEm: row.confirmado_em
      })),
      saques: saques.rows
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao carregar indicações.', detalhe: error.message });
  }
});


app.post('/api/me/indicacoes/dados-pix', autenticarProfissional, async (req, res) => {
  try {
    await garantirSistemaLegal();

    const chavePix = String(req.body.chavePix || req.body.chave_pix || '').trim();
    const tipoChavePix = String(req.body.tipoChavePix || req.body.tipo_chave_pix || '').trim();
    const nomeTitular = String(req.body.nomeTitular || req.body.nome_titular || '').trim();
    const cpfCnpjTitular = String(req.body.cpfCnpjTitular || req.body.cpf_cnpj_titular || '').trim();

    if (!tipoChavePix || !chavePix || chavePix.length < 4 || !nomeTitular || !cpfCnpjTitular) {
      return res.status(400).json({ erro: 'Preencha tipo de chave Pix, chave Pix, nome do titular e CPF/CNPJ do titular.' });
    }

    const result = await pool.query(
      `UPDATE profissionais
       SET indicacao_tipo_chave_pix=$1,
           indicacao_chave_pix=$2,
           indicacao_nome_titular=$3,
           indicacao_cpf_cnpj_titular=$4,
           indicacao_pix_atualizado_em=NOW(),
           atualizado_em=NOW()
       WHERE id=$5
       RETURNING indicacao_tipo_chave_pix, indicacao_chave_pix, indicacao_nome_titular, indicacao_cpf_cnpj_titular`,
      [tipoChavePix, chavePix, nomeTitular, cpfCnpjTitular, req.profissional.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ erro: 'Profissional não encontrado.' });

    res.json({
      mensagem: 'Dados Pix salvos com sucesso.',
      dadosPix: {
        tipoChavePix: result.rows[0].indicacao_tipo_chave_pix || '',
        chavePix: result.rows[0].indicacao_chave_pix || '',
        nomeTitular: result.rows[0].indicacao_nome_titular || '',
        cpfCnpjTitular: result.rows[0].indicacao_cpf_cnpj_titular || ''
      }
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao salvar dados Pix.', detalhe: error.message });
  }
});

app.post('/api/me/indicacoes/saques', autenticarProfissional, async (req, res) => {
  try {
    await garantirSistemaIndicacoes();
    await liberarIndicacoesVencidas(req.profissional.id);

    await garantirSistemaLegal();
    const chavePix = String(req.body.chavePix || req.body.chave_pix || '').trim();
    const tipoChavePix = String(req.body.tipoChavePix || req.body.tipo_chave_pix || '').trim();
    const nomeTitular = String(req.body.nomeTitular || req.body.nome_titular || '').trim();
    const cpfCnpjTitular = String(req.body.cpfCnpjTitular || req.body.cpf_cnpj_titular || '').trim();

    if (!tipoChavePix || !chavePix || chavePix.length < 4 || !nomeTitular || !cpfCnpjTitular) {
      return res.status(400).json({ erro: 'Informe tipo de chave Pix, chave Pix, nome do titular e CPF/CNPJ do titular.' });
    }

    const disponiveis = await pool.query(
      `SELECT id, valor_comissao FROM indicacoes
       WHERE indicador_id=$1 AND status='disponivel'
       ORDER BY confirmado_em ASC NULLS LAST, criado_em ASC`,
      [req.profissional.id]
    );

    const total = disponiveis.rows.reduce((soma, item) => soma + Number(item.valor_comissao || 0), 0);
    if (total < INDICACAO_SAQUE_MINIMO) {
      return res.status(400).json({ erro: `Saldo insuficiente. O saque mínimo é R$ ${INDICACAO_SAQUE_MINIMO.toFixed(2).replace('.', ',')}.` });
    }

    const ids = disponiveis.rows.map(item => item.id);
    await pool.query('BEGIN');
    try {
      const saque = await pool.query(
        `INSERT INTO saques_indicacoes (profissional_id, valor, chave_pix, tipo_chave_pix, nome_titular, cpf_cnpj_titular, saldo_disponivel, status, indicacoes_ids)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'aguardando',$8::jsonb)
         RETURNING *`,
        [req.profissional.id, total, chavePix, tipoChavePix || null, nomeTitular, cpfCnpjTitular, total, JSON.stringify(ids)]
      );

      await pool.query(
        `UPDATE indicacoes
         SET status='saque_solicitado', saque_id=$1, atualizado_em=NOW()
         WHERE indicador_id=$2 AND status='disponivel'`,
        [saque.rows[0].id, req.profissional.id]
      );

      await pool.query('COMMIT');
      res.status(201).json({ mensagem: 'Solicitação de saque enviada para análise do admin.', saque: saque.rows[0] });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao solicitar saque.', detalhe: error.message });
  }
});

app.get('/api/admin/indicacoes', autenticarAdmin, async (_req, res) => {
  try {
    await garantirSistemaIndicacoes();
    await liberarIndicacoesVencidas();

    const indicacoes = await pool.query(
      `SELECT i.*, ind.nome AS indicador_nome, ind.whatsapp AS indicador_whatsapp,
              p.nome AS indicado_nome, p.whatsapp AS indicado_whatsapp, p.status AS indicado_status, p.plano_atual AS indicado_plano
       FROM indicacoes i
       LEFT JOIN profissionais ind ON ind.id = i.indicador_id
       LEFT JOIN profissionais p ON p.id = i.indicado_id
       ORDER BY i.criado_em DESC
       LIMIT 500`
    );

    const saques = await pool.query(
      `SELECT s.*, p.nome AS profissional_nome, p.whatsapp AS profissional_whatsapp, p.email AS profissional_email
       FROM saques_indicacoes s
       LEFT JOIN profissionais p ON p.id = s.profissional_id
       ORDER BY s.solicitado_em DESC
       LIMIT 300`
    );

    res.json({ indicacoes: indicacoes.rows, saques: saques.rows, saqueMinimo: INDICACAO_SAQUE_MINIMO, comissaoPorIndicacao: INDICACAO_COMISSAO_TOP });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar indicações.', detalhe: error.message });
  }
});

app.patch('/api/admin/indicacoes/saques/:id/pagar', autenticarAdmin, async (req, res) => {
  try {
    await garantirSistemaIndicacoes();
    const id = Number(req.params.id);
    const observacao = String(req.body.observacao || '').trim();

    await pool.query('BEGIN');
    try {
      const saque = await pool.query(
        `UPDATE saques_indicacoes
         SET status='pago', pago_em=NOW(), observacao_admin=$1, atualizado_em=NOW()
         WHERE id=$2 AND status='aguardando'
         RETURNING *`,
        [observacao || null, id]
      );

      if (saque.rowCount === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ erro: 'Saque não encontrado ou já finalizado.' });
      }

      await pool.query(
        `UPDATE indicacoes SET status='pago', atualizado_em=NOW() WHERE saque_id=$1 AND status='saque_solicitado'`,
        [id]
      );

      await pool.query('COMMIT');
      res.json({ mensagem: 'Saque marcado como pago.', saque: saque.rows[0] });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao marcar saque como pago.', detalhe: error.message });
  }
});

app.patch('/api/admin/indicacoes/saques/:id/recusar', autenticarAdmin, async (req, res) => {
  try {
    await garantirSistemaIndicacoes();
    const id = Number(req.params.id);
    const observacao = String(req.body.observacao || '').trim();

    await pool.query('BEGIN');
    try {
      const saque = await pool.query(
        `UPDATE saques_indicacoes
         SET status='recusado', observacao_admin=$1, atualizado_em=NOW()
         WHERE id=$2 AND status='aguardando'
         RETURNING *`,
        [observacao || 'Saque recusado pelo admin.', id]
      );

      if (saque.rowCount === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ erro: 'Saque não encontrado ou já finalizado.' });
      }

      await pool.query(
        `UPDATE indicacoes SET status='disponivel', saque_id=NULL, atualizado_em=NOW() WHERE saque_id=$1 AND status='saque_solicitado'`,
        [id]
      );

      await pool.query('COMMIT');
      res.json({ mensagem: 'Saque recusado e saldo devolvido ao profissional.', saque: saque.rows[0] });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao recusar saque.', detalhe: error.message });
  }
});

app.get('/api/debug/efi', (req, res) => {
  const senha = req.headers['x-admin-password'] || req.query.admin || '';
  if (senha !== ADMIN_PASSWORD) return res.status(401).json({ erro: 'Acesso negado.' });
  res.json(diagnosticoEfiConfiguracao());
});

app.post('/api/pagamentos/efi/criar', autenticarProfissional, async (req, res) => {
  try {
    if (!efiConfigurado()) {
      return res.status(500).json({
        erro: 'Integração Efí ainda não configurada no servidor.',
        detalhe: JSON.stringify(diagnosticoEfiConfiguracao())
      });
    }

    const planoKey = String(req.body.plano || '').trim().toLowerCase();
    const plano = PLANOS_EFI[planoKey];

    if (!plano) {
      return res.status(400).json({ erro: 'Plano inválido.' });
    }

    const profissional = await pool.query('SELECT * FROM profissionais WHERE id=$1', [req.profissional.id]);
    if (profissional.rowCount === 0) {
      return res.status(404).json({ erro: 'Profissional não encontrado.' });
    }

    const txid = gerarTxidNorteServic();

    const insertPagamento = await pool.query(
      `INSERT INTO pagamentos
       (profissional_id, plano, plano_key, plano_nome, valor, valor_centavos, status, txid, efi_txid, ambiente, profissional_nome, profissional_whatsapp)
       VALUES ($1, $2, $2, $3, $4, $5, 'aguardando', $6, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.profissional.id,
        planoKey,
        plano.nome,
        plano.valor,
        Math.round(Number(plano.valor || 0) * 100),
        txid,
        EFI_AMBIENTE,
        profissional.rows[0].nome || '',
        profissional.rows[0].whatsapp || ''
      ]
    );

    const pagamento = insertPagamento.rows[0];

    try {
      const efi = await criarCobrancaPixEfi({ txid, plano, profissional: profissional.rows[0] });
      const pixCopiaCola = efi.qrcode?.qrcode || efi.cobranca?.pixCopiaECola || '';
      const qrCodeImagem = efi.qrcode?.imagemQrcode || '';

      const atualizado = await pool.query(
        `UPDATE pagamentos
         SET loc_id=$1,
             efi_loc_id=$1,
             pix_copia_cola=$2,
             qr_code_imagem=$3,
             efi_status=$4,
             raw_retorno=$5,
             atualizado_em=NOW()
         WHERE id=$6
         RETURNING *`,
        [efi.locId, pixCopiaCola, qrCodeImagem, efi.cobranca?.status || 'ATIVA', { cobranca: efi.cobranca, qrcode: efi.qrcode }, pagamento.id]
      );

      return res.json({
        mensagem: 'Cobrança Pix gerada com sucesso.',
        pagamento: atualizado.rows[0]
      });
    } catch (error) {
      await pool.query(
        `UPDATE pagamentos SET status='erro', raw_retorno=$1, atualizado_em=NOW() WHERE id=$2`,
        [{ erro: error.message }, pagamento.id]
      );
      throw error;
    }
  } catch (error) {
    console.error('Erro ao gerar cobrança Pix Efí:', error.message, diagnosticoEfiConfiguracao());
    res.status(500).json({ erro: 'Erro ao gerar cobrança Pix.', detalhe: error.message });
  }
});

app.get('/api/pagamentos/:id/status', autenticarProfissional, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erro: 'Pagamento inválido.' });
    }

    const result = await pool.query(
      'SELECT * FROM pagamentos WHERE id=$1 AND profissional_id=$2',
      [id, req.profissional.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Pagamento não encontrado.' });
    }

    const pagamento = await verificarEAtualizarPagamento(result.rows[0]);
    res.json({ pagamento });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao consultar pagamento.', detalhe: error.message });
  }
});

app.get('/api/me/pagamentos', autenticarProfissional, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, plano_key, plano_nome, valor, status, txid, criado_em, pago_em
       FROM pagamentos
       WHERE profissional_id=$1
       ORDER BY criado_em DESC
       LIMIT 20`,
      [req.profissional.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar pagamentos.', detalhe: error.message });
  }
});

app.post('/api/webhooks/efi-pix', async (req, res) => {
  try {
    if (EFI_WEBHOOK_SECRET) {
      const segredo = req.headers['x-webhook-secret'] || req.query.secret || '';
      if (segredo !== EFI_WEBHOOK_SECRET) {
        return res.status(401).json({ erro: 'Webhook não autorizado.' });
      }
    }

    const pixRecebidos = Array.isArray(req.body?.pix) ? req.body.pix : [];

    for (const pix of pixRecebidos) {
      const txid = pix.txid || pix.txId || '';
      if (!txid) continue;

      const result = await pool.query('SELECT * FROM pagamentos WHERE txid=$1 LIMIT 1', [txid]);
      if (result.rowCount === 0) continue;

      await ativarPlanoPorPagamento(result.rows[0], { webhook: req.body, pix });
    }

    res.json({ recebido: true });
  } catch (error) {
    res.status(500).json({ erro: 'Erro no webhook Efí.', detalhe: error.message });
  }
});

app.get('/api/admin/pagamentos', autenticarAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT pg.*, p.nome AS profissional_nome, p.whatsapp AS profissional_whatsapp
       FROM pagamentos pg
       LEFT JOIN profissionais p ON p.id = pg.profissional_id
       ORDER BY pg.criado_em DESC
       LIMIT 500`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar pagamentos.', detalhe: error.message });
  }
});

app.get('/api/admin/avaliacoes', autenticarAdmin, listarAvaliacoesAdmin);

// Rota alternativa para compatibilidade com versões anteriores do script.
app.get('/api/admin/avaliacoes/pendentes', autenticarAdmin, (req, res) => {
  req.query.status = 'pendente';
  return listarAvaliacoesAdmin(req, res);
});

async function atualizarStatusAvaliacao(req, res, novoStatus) {
  try {
    await garantirTabelaAvaliacoes();

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erro: 'ID da avaliação inválido.' });
    }

    const result = await pool.query(
      `UPDATE avaliacoes
       SET status=$1, atualizado_em=NOW()
       WHERE id=$2
       RETURNING *`,
      [String(novoStatus).trim().toLowerCase(), id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Avaliação não encontrada. Atualize o painel e tente novamente.' });
    }

    await recalcularMediaProfissional(result.rows[0].profissional_id);

    const mensagem = novoStatus === 'aprovado' ? 'Avaliação aprovada.' : 'Avaliação recusada.';

    res.json({ mensagem, avaliacao: avaliacaoParaFrontend(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ erro: `Erro ao ${novoStatus === 'aprovado' ? 'aprovar' : 'recusar'} avaliação.`, detalhe: error.message });
  }
}

app.patch('/api/admin/avaliacoes/:id/aprovar', autenticarAdmin, async (req, res) => {
  return atualizarStatusAvaliacao(req, res, 'aprovado');
});

app.patch('/api/admin/avaliacoes/:id/recusar', autenticarAdmin, async (req, res) => {
  return atualizarStatusAvaliacao(req, res, 'recusado');
});

app.delete('/api/admin/avaliacoes/:id', autenticarAdmin, async (req, res) => {
  try {
    await garantirTabelaAvaliacoes();

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erro: 'ID da avaliação inválido.' });
    }

    const result = await pool.query(`DELETE FROM avaliacoes WHERE id=$1 RETURNING profissional_id`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Avaliação não encontrada. Atualize o painel e tente novamente.' });
    }

    await recalcularMediaProfissional(result.rows[0].profissional_id);

    res.json({ mensagem: 'Avaliação excluída.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir avaliação.', detalhe: error.message });
  }
});


app.get('/api/admin/profissionais', autenticarAdmin, async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM profissionais ORDER BY criado_em DESC');
    res.json(result.rows.map(profissionalParaFrontend));
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao carregar admin.', detalhe: error.message });
  }
});

app.patch('/api/admin/profissionais/:id/aprovar', autenticarAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE profissionais SET status='aprovado', verificado=true WHERE id=$1 RETURNING *",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Profissional não encontrado.' });
    }

    await processarIndicacaoDoIndicado(req.params.id);

    res.json({ mensagem: 'Profissional aprovado.', profissional: profissionalParaFrontend(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao aprovar.', detalhe: error.message });
  }
});

app.patch('/api/admin/profissionais/:id/plano', autenticarAdmin, async (req, res) => {
  try {
    const { planoAtual = 'Gratuito', planoStatus = 'ativo', planoVencimento = null } = req.body;

    const result = await pool.query(
      `UPDATE profissionais SET plano_atual=$1, plano_status=$2, plano_vencimento=$3 WHERE id=$4 RETURNING *`,
      [planoAtual, planoStatus, planoVencimento || null, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Profissional não encontrado.' });
    }

    res.json({ mensagem: 'Plano atualizado.', profissional: profissionalParaFrontend(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar plano.', detalhe: error.message });
  }
});


app.patch('/api/admin/profissionais/:id/senha', autenticarAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const novaSenha = String(req.body.senha || '').trim();

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erro: 'ID do profissional inválido.' });
    }

    if (!novaSenha || novaSenha.length < 6) {
      return res.status(400).json({ erro: 'A nova senha precisa ter pelo menos 6 caracteres.' });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    const result = await pool.query(
      `UPDATE profissionais
       SET senha_hash=$1
       WHERE id=$2
       RETURNING id, nome, whatsapp`,
      [senhaHash, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Profissional não encontrado.' });
    }

    res.json({
      mensagem: 'Senha redefinida com sucesso.',
      profissional: {
        id: result.rows[0].id,
        nome: result.rows[0].nome,
        whatsapp: result.rows[0].whatsapp
      }
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao redefinir senha.', detalhe: error.message });
  }
});

app.delete('/api/admin/profissionais/:id', autenticarAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM profissionais WHERE id=$1', [req.params.id]);
    res.json({ mensagem: 'Profissional removido.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover.', detalhe: error.message });
  }
});


/* ================================================= */
/* ROTAS CIDADE PARCEIRA */
/* ================================================= */

app.post('/api/cidade/login', async (req, res) => {
  try {
    const senha = String(req.body.senha || '').trim();
    if (!senha || senha !== CIDADE_PARCEIRA_PASSWORD) {
      return res.status(401).json({ erro: 'Senha da Cidade Parceira incorreta.' });
    }

    const token = gerarTokenCidade({ tipo: 'cidade-parceira', municipio: CIDADE_MUNICIPIO_PADRAO });
    res.json({ mensagem: 'Acesso liberado.', token, municipio: CIDADE_MUNICIPIO_PADRAO });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao acessar Cidade Parceira.', detalhe: error.message });
  }
});

app.post('/api/cidade/coletor/login', async (req, res) => {
  try {
    await garantirSistemaCidadeParceira();

    const email = String(req.body.email || '').trim().toLowerCase();
    const senha = String(req.body.senha || '').trim();

    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    const result = await pool.query('SELECT * FROM cidade_coletores WHERE LOWER(email)=$1 AND ativo=true LIMIT 1', [email]);
    if (result.rowCount === 0) {
      return res.status(401).json({ erro: 'Login do coletor incorreto.' });
    }

    const coletor = result.rows[0];
    const senhaOk = await bcrypt.compare(senha, coletor.senha_hash);
    if (!senhaOk) {
      return res.status(401).json({ erro: 'Login do coletor incorreto.' });
    }

    const token = gerarTokenCidade({
      tipo: 'coletor-cidade',
      id: Number(coletor.id),
      email: coletor.email,
      nome: coletor.nome,
      setor: coletor.setor_fixo,
      telefone: coletor.telefone || '',
      valorComissaoCadastro: Number(coletor.valor_comissao_cadastro || CIDADE_COMISSAO_VALOR_CADASTRO)
    }, '10h');

    res.json({
      mensagem: 'Coletor conectado.',
      token,
      coletor: {
        id: Number(coletor.id),
        nome: coletor.nome,
        email: coletor.email,
        telefone: coletor.telefone || '',
        setor: coletor.setor_fixo,
        valorComissaoCadastro: Number(coletor.valor_comissao_cadastro || CIDADE_COMISSAO_VALOR_CADASTRO)
      }
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro no login do coletor.', detalhe: error.message });
  }
});

app.get('/api/cidade/resumo', autenticarCidadeParceira, async (_req, res) => {
  try {
    await garantirSistemaCidadeParceira();

    const total = await pool.query(`SELECT COUNT(*)::int AS total FROM cidade_coleta_profissionais`);
    const aceitos = await pool.query(`SELECT COUNT(*)::int AS total FROM cidade_coleta_profissionais WHERE aceita_site=true`);
    const porSetor = await pool.query(`
      SELECT setor, COUNT(*)::int AS total
      FROM cidade_coleta_profissionais
      GROUP BY setor
      ORDER BY setor
    `);
    const porProfissao = await pool.query(`
      SELECT profissao, COUNT(*)::int AS total
      FROM cidade_coleta_profissionais
      GROUP BY profissao
      ORDER BY total DESC, profissao ASC
      LIMIT 6
    `);
    const categorias = await pool.query(`
      SELECT COUNT(DISTINCT COALESCE(NULLIF(categoria,''), profissao))::int AS total
      FROM cidade_coleta_profissionais
    `);

    res.json({
      municipio: CIDADE_MUNICIPIO_PADRAO,
      setoresFixos: SETORES_CIDADE_PARCEIRA,
      totalProfissionais: Number(total.rows[0]?.total || 0),
      aceitosSite: Number(aceitos.rows[0]?.total || 0),
      categoriasMapeadas: Number(categorias.rows[0]?.total || 0),
      setoresVisitados: porSetor.rows.length,
      porSetor: porSetor.rows.map((item) => ({ setor: item.setor, total: Number(item.total || 0) })),
      topProfissoes: porProfissao.rows.map((item) => ({ profissao: item.profissao, total: Number(item.total || 0) }))
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao carregar resumo da Cidade Parceira.', detalhe: error.message });
  }
});

app.get('/api/cidade/profissoes', autenticarCidadeParceira, async (req, res) => {
  try {
    await garantirSistemaCidadeParceira();

    const { q = '', setor = '' } = req.query;
    const params = [];
    let where = 'WHERE 1=1';

    if (q) {
      params.push(`%${String(q).toLowerCase()}%`);
      where += ` AND LOWER(CONCAT_WS(' ', nome, profissao, categoria, servicos, setor, bairro, descricao)) LIKE $${params.length}`;
    }

    if (setor) {
      params.push(String(setor));
      where += ` AND setor = $${params.length}`;
    }

    const result = await pool.query(`
      SELECT
        profissao,
        COALESCE(NULLIF(categoria,''), 'Profissionais locais') AS categoria,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE aceita_site=true)::int AS aceitos_site,
        JSONB_AGG(
          JSONB_BUILD_OBJECT(
            'id', id,
            'nome', nome,
            'whatsapp', whatsapp,
            'setor', setor,
            'bairro', bairro,
            'servicos', servicos,
            'aceitaSite', aceita_site,
            'profissionalSiteId', profissional_site_id,
            'criadoEm', criado_em
          ) ORDER BY criado_em DESC
        ) AS profissionais
      FROM cidade_coleta_profissionais
      ${where}
      GROUP BY profissao, COALESCE(NULLIF(categoria,''), 'Profissionais locais')
      ORDER BY total DESC, profissao ASC
    `, params);

    res.json(result.rows.map((row) => ({
      profissao: row.profissao,
      categoria: row.categoria,
      total: Number(row.total || 0),
      aceitosSite: Number(row.aceitos_site || 0),
      profissionais: parseJsonArray(row.profissionais)
    })));
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao consultar profissionais por profissão.', detalhe: error.message });
  }
});

app.get('/api/cidade/coletor/comissao', autenticarColetorCidade, async (req, res) => {
  try {
    await garantirSistemaCidadeParceira();

    const result = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM cidade_coleta_profissionais
      WHERE coletor_id=$1
        AND criado_em >= (date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo')
    `, [req.coletorCidade.id]);

    const cadastrosHoje = Number(result.rows[0]?.total || 0);
    const valorPorCadastro = await buscarComissaoColetorCidade(req.coletorCidade.id);
    const valorCalculado = cadastrosHoje * valorPorCadastro;
    const valorDisponivel = Math.min(valorCalculado, CIDADE_COMISSAO_META_SAQUE);
    const percentualLimite = CIDADE_COMISSAO_META_SAQUE > 0
      ? Math.round((valorDisponivel / CIDADE_COMISSAO_META_SAQUE) * 100)
      : 0;
    const faltamParaSaque = Math.max(0, CIDADE_COMISSAO_META_SAQUE - valorDisponivel);
    const faltamCadastrosParaSaque = valorPorCadastro > 0
      ? Math.ceil(faltamParaSaque / valorPorCadastro)
      : 0;
    const saqueLiberado = valorDisponivel >= CIDADE_COMISSAO_META_SAQUE;
    const saquePendente = await pool.query(`
      SELECT id, status FROM cidade_saques_coletores
      WHERE coletor_id=$1
        AND data_referencia=(now() AT TIME ZONE 'America/Sao_Paulo')::date
        AND status='aguardando'
      LIMIT 1
    `, [req.coletorCidade.id]);

    res.json({
      cadastrosHoje,
      valorPorCadastro,
      metaSaque: CIDADE_COMISSAO_META_SAQUE,
      limiteDiario: CIDADE_COMISSAO_META_SAQUE,
      valorDisponivel,
      percentualLimite: Math.max(0, Math.min(100, percentualLimite)),
      faltamParaSaque,
      faltamCadastrosParaSaque,
      saqueLiberado,
      saquePendente: saquePendente.rowCount > 0,
      saquePendenteId: saquePendente.rows[0]?.id || null,
      whatsappSaque: CIDADE_WHATSAPP_SAQUE,
      regraSaque: 'O saque só é liberado ao completar R$ 50,00 no dia. Todos os cadastros são avaliados pelo time da Norte Servic antes do pagamento.',
      mensagem: saqueLiberado
        ? 'Meta diária de R$ 50,00 atingida. Solicite o saque. Os cadastros serão avaliados pelo time antes do pagamento.'
        : `${cadastrosHoje} cadastro(s) hoje. Cada cadastro finalizado soma R$ ${valorPorCadastro.toFixed(2).replace('.', ',')}. Faltam ${faltamCadastrosParaSaque} cadastro(s) para liberar o saque de R$ ${CIDADE_COMISSAO_META_SAQUE.toFixed(2).replace('.', ',')}.`
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao calcular comissão do coletor.', detalhe: error.message });
  }
});

app.get('/api/cidade/coleta/minhas', autenticarColetorCidade, async (req, res) => {
  try {
    await garantirSistemaCidadeParceira();

    const result = await pool.query(`
      SELECT ccp.*, cc.nome AS coletor_nome
      FROM cidade_coleta_profissionais ccp
      LEFT JOIN cidade_coletores cc ON cc.id = ccp.coletor_id
      WHERE ccp.coletor_id=$1
      ORDER BY ccp.criado_em DESC
      LIMIT 20
    `, [req.coletorCidade.id]);

    res.json(result.rows.map(coletaParaFrontend));
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao carregar suas coletas.', detalhe: error.message });
  }
});

app.post('/api/cidade/coleta/profissionais', autenticarColetorCidade, async (req, res) => {
  try {
    await garantirSistemaCidadeParceira();

    const dados = req.body || {};
    const nome = String(dados.nome || '').trim();
    const profissao = String(dados.profissao || '').trim();
    const whatsapp = limparNumero(dados.whatsapp || '');
    const aceitaSite = normalizarBooleanoCidade(dados.aceitaSite || dados.aceita_site);
    const emailProfissional = String(dados.emailProfissional || dados.email_profissional || '').trim().toLowerCase() || null;
    const instagram = String(dados.instagram || '').trim() || null;
    const setor = req.coletorCidade.setor;

    if (!nome || !profissao) {
      return res.status(400).json({ erro: 'Nome e profissão são obrigatórios.' });
    }

    const coleta = await pool.query(`
      INSERT INTO cidade_coleta_profissionais (
        coletor_id, nome, whatsapp, email_profissional, instagram, categoria, profissao, servicos,
        cidade, setor, bairro, descricao, aceita_site, status_coleta
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'coletado')
      RETURNING *
    `, [
      req.coletorCidade.id,
      nome,
      whatsapp || null,
      emailProfissional,
      instagram,
      dados.categoria || null,
      profissao,
      dados.servicos || null,
      dados.cidade || CIDADE_MUNICIPIO_PADRAO,
      setor,
      dados.bairro || setor,
      dados.descricao || null,
      aceitaSite
    ]);

    let profissionalPublicado = null;
    if (aceitaSite) {
      profissionalPublicado = await publicarColetaNoSiteOficial(coleta.rows[0], req.coletorCidade.id);
      await pool.query(
        `UPDATE cidade_coleta_profissionais SET profissional_site_id=$1 WHERE id=$2`,
        [profissionalPublicado.id, coleta.rows[0].id]
      );
      coleta.rows[0].profissional_site_id = profissionalPublicado.id;
    }

    res.status(201).json({
      mensagem: aceitaSite
        ? 'Profissional coletado e publicado no site oficial.'
        : 'Profissional coletado apenas para o relatório da Cidade Parceira.',
      coleta: coletaParaFrontend(coleta.rows[0]),
      publicadoNoSite: Boolean(profissionalPublicado),
      profissional: profissionalPublicado ? profissionalParaFrontend(profissionalPublicado) : null
    });
  } catch (error) {
    const detalhe = error.code === '23505'
      ? 'Já existe profissional com esse WhatsApp no site oficial.'
      : error.message;
    res.status(500).json({ erro: 'Erro ao cadastrar coleta.', detalhe });
  }
});



app.post('/api/cidade/coletor/saques', autenticarColetorCidade, async (req, res) => {
  try {
    await garantirSistemaCidadeParceira();
    const valorPorCadastro = await buscarComissaoColetorCidade(req.coletorCidade.id);
    const dataRef = await pool.query(`SELECT (now() AT TIME ZONE 'America/Sao_Paulo')::date AS data_ref`);
    const dataReferencia = dataRef.rows[0].data_ref;

    const contagem = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM cidade_coleta_profissionais
      WHERE coletor_id=$1
        AND criado_em >= (date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo')
    `, [req.coletorCidade.id]);

    const cadastrosHoje = Number(contagem.rows[0]?.total || 0);
    const valorCalculado = Math.min(cadastrosHoje * valorPorCadastro, CIDADE_COMISSAO_META_SAQUE);

    if (valorCalculado < CIDADE_COMISSAO_META_SAQUE) {
      return res.status(400).json({ erro: 'O saque só é liberado ao completar R$ 50,00 no dia. Todos os cadastros são avaliados pelo time da Norte Servic antes do pagamento.' });
    }

    const pendente = await pool.query(`
      SELECT id FROM cidade_saques_coletores
      WHERE coletor_id=$1 AND data_referencia=$2 AND status='aguardando'
      LIMIT 1
    `, [req.coletorCidade.id, dataReferencia]);

    if (pendente.rowCount > 0) {
      return res.status(400).json({ erro: 'Já existe uma solicitação de saque aguardando análise para hoje.' });
    }

    const result = await pool.query(`
      INSERT INTO cidade_saques_coletores (coletor_id, valor, cadastros_contados, data_referencia, status)
      VALUES ($1,$2,$3,$4,'aguardando')
      RETURNING *
    `, [req.coletorCidade.id, valorCalculado, cadastrosHoje, dataReferencia]);

    res.status(201).json({
      mensagem: 'Solicitação de saque enviada para o Painel Admin. Os cadastros serão avaliados pelo time da Norte Servic antes do pagamento.',
      saque: saqueColetorParaFrontend(result.rows[0])
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao solicitar saque do coletor.', detalhe: error.message });
  }
});

app.get('/api/admin/cidade/coletas', autenticarAdmin, async (_req, res) => {
  try {
    await garantirSistemaCidadeParceira();
    const result = await pool.query(`
      SELECT ccp.*, cc.nome AS coletor_nome, cc.telefone AS coletor_telefone
      FROM cidade_coleta_profissionais ccp
      LEFT JOIN cidade_coletores cc ON cc.id = ccp.coletor_id
      ORDER BY ccp.criado_em DESC
      LIMIT 250
    `);
    res.json(result.rows.map((row) => ({
      ...coletaParaFrontend(row),
      coletorTelefone: row.coletor_telefone || ''
    })));
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar coletas da Cidade Parceira.', detalhe: error.message });
  }
});

app.get('/api/admin/cidade/coletores', autenticarAdmin, async (_req, res) => {
  try {
    await garantirSistemaCidadeParceira();
    const result = await pool.query(`
      SELECT cc.*,
        COUNT(cp.id)::int AS total_cadastros,
        COUNT(cp.id) FILTER (WHERE cp.aceita_site=true)::int AS aceitos_site,
        COUNT(cp.id) FILTER (
          WHERE cp.criado_em >= (date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo')
        )::int AS cadastros_hoje
      FROM cidade_coletores cc
      LEFT JOIN cidade_coleta_profissionais cp ON cp.coletor_id = cc.id
      GROUP BY cc.id
      ORDER BY cc.ativo DESC, cc.nome ASC
    `);
    res.json(result.rows.map(coletorCidadeParaFrontend));
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar coletores.', detalhe: error.message });
  }
});

app.post('/api/admin/cidade/coletores', autenticarAdmin, async (req, res) => {
  try {
    await garantirSistemaCidadeParceira();
    const nome = String(req.body.nome || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const senha = String(req.body.senha || '').trim();
    const telefone = limparNumero(req.body.telefone || '');
    const setor = String(req.body.setor || req.body.setorFixo || '').trim();
    const valor = Number(req.body.valorComissaoCadastro || req.body.valor_comissao_cadastro || CIDADE_COMISSAO_VALOR_CADASTRO);

    if (!nome || !email || !senha || !setor) {
      return res.status(400).json({ erro: 'Nome, e-mail, senha e setor são obrigatórios.' });
    }
    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const result = await pool.query(`
      INSERT INTO cidade_coletores (nome, email, telefone, senha_hash, setor_fixo, valor_comissao_cadastro, ativo)
      VALUES ($1,$2,$3,$4,$5,$6,true)
      RETURNING *
    `, [nome, email, telefone || null, senhaHash, setor, valor]);

    res.status(201).json({ mensagem: 'Coletor credenciado com sucesso.', coletor: coletorCidadeParaFrontend(result.rows[0]) });
  } catch (error) {
    const detalhe = error.code === '23505' ? 'Já existe coletor com esse e-mail.' : error.message;
    res.status(500).json({ erro: 'Erro ao credenciar coletor.', detalhe });
  }
});

app.patch('/api/admin/cidade/coletores/:id', autenticarAdmin, async (req, res) => {
  try {
    await garantirSistemaCidadeParceira();
    const id = Number(req.params.id);
    const atual = await pool.query('SELECT * FROM cidade_coletores WHERE id=$1 LIMIT 1', [id]);
    if (atual.rowCount === 0) return res.status(404).json({ erro: 'Coletor não encontrado.' });

    const nome = String(req.body.nome ?? atual.rows[0].nome).trim();
    const email = String(req.body.email ?? atual.rows[0].email).trim().toLowerCase();
    const telefone = limparNumero(req.body.telefone ?? atual.rows[0].telefone ?? '');
    const setor = String(req.body.setor || req.body.setorFixo || atual.rows[0].setor_fixo).trim();
    const valor = Number(req.body.valorComissaoCadastro || req.body.valor_comissao_cadastro || atual.rows[0].valor_comissao_cadastro || CIDADE_COMISSAO_VALOR_CADASTRO);
    const ativo = req.body.ativo === undefined ? atual.rows[0].ativo : normalizarBooleanoCidade(req.body.ativo);
    const senha = String(req.body.senha || '').trim();

    let result;
    if (senha) {
      if (senha.length < 6) return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
      const senhaHash = await bcrypt.hash(senha, 10);
      result = await pool.query(`
        UPDATE cidade_coletores
        SET nome=$1, email=$2, telefone=$3, setor_fixo=$4, valor_comissao_cadastro=$5, ativo=$6, senha_hash=$7, atualizado_em=NOW()
        WHERE id=$8
        RETURNING *
      `, [nome, email, telefone || null, setor, valor, ativo, senhaHash, id]);
    } else {
      result = await pool.query(`
        UPDATE cidade_coletores
        SET nome=$1, email=$2, telefone=$3, setor_fixo=$4, valor_comissao_cadastro=$5, ativo=$6, atualizado_em=NOW()
        WHERE id=$7
        RETURNING *
      `, [nome, email, telefone || null, setor, valor, ativo, id]);
    }

    res.json({ mensagem: 'Coletor atualizado.', coletor: coletorCidadeParaFrontend(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar coletor.', detalhe: error.message });
  }
});

app.get('/api/admin/cidade/saques', autenticarAdmin, async (_req, res) => {
  try {
    await garantirSistemaCidadeParceira();
    const result = await pool.query(`
      SELECT s.*, cc.nome AS coletor_nome, cc.email AS coletor_email, cc.telefone AS coletor_telefone, cc.setor_fixo
      FROM cidade_saques_coletores s
      LEFT JOIN cidade_coletores cc ON cc.id = s.coletor_id
      ORDER BY s.criado_em DESC
      LIMIT 200
    `);
    res.json(result.rows.map(saqueColetorParaFrontend));
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar saques dos coletores.', detalhe: error.message });
  }
});

app.patch('/api/admin/cidade/saques/:id/pagar', autenticarAdmin, async (req, res) => {
  try {
    const observacao = String(req.body.observacao || 'Pago após avaliação dos cadastros.').trim();
    const result = await pool.query(`
      UPDATE cidade_saques_coletores
      SET status='pago', observacao_admin=$1, atualizado_em=NOW()
      WHERE id=$2
      RETURNING *
    `, [observacao, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ erro: 'Saque não encontrado.' });
    res.json({ mensagem: 'Saque marcado como pago.', saque: saqueColetorParaFrontend(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao marcar saque como pago.', detalhe: error.message });
  }
});

app.patch('/api/admin/cidade/saques/:id/recusar', autenticarAdmin, async (req, res) => {
  try {
    const observacao = String(req.body.observacao || 'Recusado após avaliação dos cadastros.').trim();
    const result = await pool.query(`
      UPDATE cidade_saques_coletores
      SET status='recusado', observacao_admin=$1, atualizado_em=NOW()
      WHERE id=$2
      RETURNING *
    `, [observacao, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ erro: 'Saque não encontrado.' });
    res.json({ mensagem: 'Saque recusado.', saque: saqueColetorParaFrontend(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao recusar saque.', detalhe: error.message });
  }
});

// Mantém as rotas HTML funcionando em deploy.
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ erro: 'Rota não encontrada.' });
  }

  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Norte Servic rodando em http://localhost:${PORT}`);
});
