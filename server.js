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
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || (IS_PRODUCTION ? '' : 'dev_jwt_secret_local_only');
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || (IS_PRODUCTION ? '' : JWT_SECRET || 'dev_admin_session_secret_local_only');
const ADMIN_COOKIE_NAME = 'norteServicAdminSession';
const ADMIN_COOKIE_MAX_AGE_MS = Number(process.env.ADMIN_COOKIE_MAX_AGE_MS || 1000 * 60 * 60 * 8);
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
const CIDADE_SAQUE_ADMIN_PIN = process.env.CIDADE_SAQUE_ADMIN_PIN || process.env.ADMIN_PAYMENT_PIN || '';


const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v25.0';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';
const WHATSAPP_WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '';
const WHATSAPP_TEMPLATE_CADASTRO = process.env.WHATSAPP_TEMPLATE_CADASTRO || 'cadastro_profissional_norte_servic';
const WHATSAPP_TEMPLATE_CODIGO = process.env.WHATSAPP_TEMPLATE_CODIGO || 'codigo_acesso_norte_servic';
const WHATSAPP_TEMPLATE_LANGUAGE = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'pt_BR';
const WHATSAPP_CODIGO_EXPIRA_MINUTOS = Number(process.env.WHATSAPP_CODIGO_EXPIRA_MINUTOS || 10);
const WHATSAPP_PERMITIR_TEXTO_LIVRE = String(process.env.WHATSAPP_PERMITIR_TEXTO_LIVRE || '').toLowerCase() === 'true';
const PROFISSIONAL_ACESSO_SECRET = process.env.PROFISSIONAL_ACESSO_SECRET || JWT_SECRET;
const MAX_UPLOAD_IMAGEM_BYTES = Number(process.env.MAX_UPLOAD_IMAGEM_BYTES || 3 * 1024 * 1024);
const UPLOAD_IMAGE_MIMES_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];



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

const VARIAVEIS_OBRIGATORIAS_PRODUCAO = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ADMIN_SESSION_SECRET'
];

if (IS_PRODUCTION) {
  const faltando = VARIAVEIS_OBRIGATORIAS_PRODUCAO.filter((nome) => !process.env[nome]);
  if (faltando.length) {
    throw new Error(`Variáveis obrigatórias ausentes em produção: ${faltando.join(', ')}`);
  }
}


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  if (IS_PRODUCTION) {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ===============================
// ROTAS LIMPAS SEM .HTML
// ===============================
const publicDir = path.join(__dirname, 'public');

// Redireciona automaticamente URLs antigas com .html para URLs limpas.
// Ex.: /login.html -> /login | /planos.html -> /planos
app.use((req, res, next) => {
  if (req.method === 'GET' && req.path.endsWith('.html')) {
    let cleanPath = req.path
      .replace(/\/index\.html$/i, '/')
      .replace(/\/cidade\/index\.html$/i, '/cidade')
      .replace(/\.html$/i, '');

    if (cleanPath === '') cleanPath = '/';

    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    return res.redirect(301, cleanPath + query);
  }

  next();
});

const paginasLimpas = {
  '/': 'index.html',
  '/home': 'index.html',
  '/login': 'login.html',
  '/cadastro': 'cadastro.html',
  '/planos': 'planos.html',
  '/perfil': 'perfil.html',
  '/painel-profissional': 'painel-profissional.html',
  '/editar-perfil': 'editar-perfil.html',
  '/completar-perfil': 'completar-perfil.html',
  '/recuperar-senha': 'recuperar-senha.html',
  '/documentos-legais': 'documentos-legais.html',
  '/admin': 'admin.html',

  // Cidade Parceira
  '/cidade': 'cidade/index.html',
  '/cidade/': 'cidade/index.html',
  '/cidade/home': 'cidade/home.html',
  '/cidade/coletor': 'cidade/coletor.html',
  '/cidade/profissionais': 'cidade/profissionais.html'
};


app.get('/cidade/index', (req, res) => res.redirect(301, '/cidade'));

Object.entries(paginasLimpas).forEach(([rota, arquivo]) => {
  app.get(rota, (req, res) => {
    res.sendFile(path.join(publicDir, arquivo));
  });
});



// ===============================
// SEO: SITEMAP E ROBOTS
// ===============================
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});


app.use(express.static(publicDir));

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

  const mime = String(match[1] || '').toLowerCase();
  if (!UPLOAD_IMAGE_MIMES_PERMITIDOS.includes(mime)) {
    throw new Error('Formato de imagem não permitido. Envie apenas JPG, PNG ou WEBP.');
  }

  const base64 = match[2];
  const buffer = Buffer.from(base64, 'base64');

  if (!buffer.length) {
    throw new Error('Imagem inválida ou vazia.');
  }

  if (buffer.length > MAX_UPLOAD_IMAGEM_BYTES) {
    throw new Error('Imagem muito grande. O limite é 3 MB por imagem.');
  }

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
    .webp({
      quality: qualidade
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
  arquivo.mime = 'image/webp';
  arquivo.extensao = 'webp';

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
    atualizadoEm: row.atualizado_em,
    dadosPagamento: {
      nomeTitular: row.pix_nome_titular || '',
      cpfCnpj: row.pix_cpf_cnpj || '',
      tipoChavePix: row.pix_tipo_chave || '',
      chavePix: row.pix_chave || '',
      banco: row.banco_nome || ''
    }
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
  await pool.query(`ALTER TABLE cidade_coletores ADD COLUMN IF NOT EXISTS pix_nome_titular TEXT`);
  await pool.query(`ALTER TABLE cidade_coletores ADD COLUMN IF NOT EXISTS pix_cpf_cnpj TEXT`);
  await pool.query(`ALTER TABLE cidade_coletores ADD COLUMN IF NOT EXISTS pix_tipo_chave TEXT`);
  await pool.query(`ALTER TABLE cidade_coletores ADD COLUMN IF NOT EXISTS pix_chave TEXT`);
  await pool.query(`ALTER TABLE cidade_coletores ADD COLUMN IF NOT EXISTS banco_nome TEXT`);


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
  await pool.query(`ALTER TABLE cidade_saques_coletores ADD COLUMN IF NOT EXISTS pix_nome_titular TEXT`);
  await pool.query(`ALTER TABLE cidade_saques_coletores ADD COLUMN IF NOT EXISTS pix_cpf_cnpj TEXT`);
  await pool.query(`ALTER TABLE cidade_saques_coletores ADD COLUMN IF NOT EXISTS pix_tipo_chave TEXT`);
  await pool.query(`ALTER TABLE cidade_saques_coletores ADD COLUMN IF NOT EXISTS pix_chave TEXT`);
  await pool.query(`ALTER TABLE cidade_saques_coletores ADD COLUMN IF NOT EXISTS banco_nome TEXT`);
  await pool.query(`ALTER TABLE cidade_saques_coletores ADD COLUMN IF NOT EXISTS pago_em TIMESTAMPTZ`);
  await pool.query(`ALTER TABLE cidade_saques_coletores ADD COLUMN IF NOT EXISTS pago_por_admin_id INTEGER`);
  await pool.query(`ALTER TABLE cidade_saques_coletores ADD COLUMN IF NOT EXISTS metodo_pagamento TEXT`);
  await pool.query(`ALTER TABLE cidade_saques_coletores ADD COLUMN IF NOT EXISTS status_transacao TEXT`);
  await pool.query(`ALTER TABLE cidade_saques_coletores ADD COLUMN IF NOT EXISTS comprovante TEXT`);
  await pool.query(`ALTER TABLE cidade_coleta_profissionais ADD COLUMN IF NOT EXISTS saque_coletor_id BIGINT`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_cidade_coleta_saque_coletor ON cidade_coleta_profissionais(saque_coletor_id)`);


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
          perfil_coleta_pendente=true,
          origem_cadastro='cidade_parceira',
          perfil_completo=false,
          autorizou_receber_mensagem=true
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
      perfil_coleta_pendente, origem_cadastro, perfil_completo, autorizou_receber_mensagem
    ) VALUES (
      $1,$2,$3,'Profissional local',$4,$5,$6,
      $7,$8,$9,'Não',$10::jsonb,
      'Presencial',$11,$12,$13,NULL,'[]'::jsonb,
      'aprovado',false,'Gratuito','ativo',
      true,$14,$15,true,
      true, 'cidade_parceira', false, true
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
    meiStatus: row.mei_status || 'nao_informado',
    interesseFormalizacao: row.interesse_formalizacao || 'nao_informado',
    necessidadesEmpreendedor: parseJsonArray(row.necessidades_empreendedor),
    observacaoEmpreendedor: row.observacao_empreendedor || '',
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
    pixNomeTitular: row.pix_nome_titular || '',
    pixCpfCnpj: row.pix_cpf_cnpj || '',
    pixTipoChave: row.pix_tipo_chave || '',
    pixChave: row.pix_chave || '',
    bancoNome: row.banco_nome || '',
    pagoEm: row.pago_em,
    metodoPagamento: row.metodo_pagamento || '',
    statusTransacao: row.status_transacao || '',
    comprovante: row.comprovante || '',
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



/* ================================================= */
/* WHATSAPP CLOUD API + COMPLETAR PERFIL */
/* ================================================= */

function whatsappConfigurado() {
  return Boolean(WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID);
}

function numeroWhatsAppApi(valor) {
  const numero = limparNumero(valor || '');
  if (!numero) return '';
  if (numero.startsWith('55')) return numero;
  if (numero.length >= 10 && numero.length <= 11) return `55${numero}`;
  return numero;
}

function frontendUrlBase(req = null) {
  const envUrl = String(process.env.FRONTEND_URL || '').replace(/\/$/, '');
  if (envUrl) return envUrl;
  if (req) {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    return `${proto}://${req.get('host')}`.replace(/\/$/, '');
  }
  return '';
}

function linkCompletarPerfil(req = null) {
  const base = frontendUrlBase(req);
  return `${base}/completar-perfil.html`;
}

async function garantirSistemaWhatsAppPerfil() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_mensagens (
      id BIGSERIAL PRIMARY KEY,
      profissional_id BIGINT,
      coleta_id BIGINT,
      whatsapp TEXT NOT NULL,
      tipo TEXT NOT NULL,
      template_nome TEXT,
      mensagem TEXT,
      status TEXT DEFAULT 'pendente',
      message_id TEXT,
      erro TEXT,
      payload JSONB DEFAULT '{}'::jsonb,
      resposta JSONB DEFAULT '{}'::jsonb,
      enviado_em TIMESTAMPTZ,
      entregue_em TIMESTAMPTZ,
      lido_em TIMESTAMPTZ,
      respondido_em TIMESTAMPTZ,
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS profissional_acessos_codigo (
      id BIGSERIAL PRIMARY KEY,
      profissional_id BIGINT,
      whatsapp TEXT NOT NULL,
      codigo_hash TEXT NOT NULL,
      tentativas INTEGER DEFAULT 0,
      usado BOOLEAN DEFAULT FALSE,
      expira_em TIMESTAMPTZ NOT NULL,
      ip TEXT,
      user_agent TEXT,
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      usado_em TIMESTAMPTZ
    )
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_whatsapp_mensagens_message_id ON whatsapp_mensagens(message_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_whatsapp_mensagens_profissional ON whatsapp_mensagens(profissional_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_whatsapp_mensagens_status ON whatsapp_mensagens(status)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_profissional_acessos_whatsapp ON profissional_acessos_codigo(whatsapp)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_profissional_acessos_profissional ON profissional_acessos_codigo(profissional_id)`);

  await pool.query(`ALTER TABLE cidade_coleta_profissionais ADD COLUMN IF NOT EXISTS autorizou_receber_mensagem BOOLEAN DEFAULT TRUE`);
  await pool.query(`ALTER TABLE cidade_coleta_profissionais ADD COLUMN IF NOT EXISTS whatsapp_mensagem_cadastro_id BIGINT`);
  await pool.query(`ALTER TABLE cidade_coleta_profissionais ADD COLUMN IF NOT EXISTS mei_status TEXT DEFAULT 'nao_informado'`);
  await pool.query(`ALTER TABLE cidade_coleta_profissionais ADD COLUMN IF NOT EXISTS interesse_formalizacao TEXT DEFAULT 'nao_informado'`);
  await pool.query(`ALTER TABLE cidade_coleta_profissionais ADD COLUMN IF NOT EXISTS necessidades_empreendedor JSONB DEFAULT '[]'::jsonb`);
  await pool.query(`ALTER TABLE cidade_coleta_profissionais ADD COLUMN IF NOT EXISTS observacao_empreendedor TEXT`);

  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS origem_cadastro TEXT DEFAULT 'site'`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS perfil_completo BOOLEAN DEFAULT FALSE`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS link_completar_perfil_enviado_em TIMESTAMPTZ`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS ultimo_acesso_perfil TIMESTAMPTZ`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS autorizou_receber_mensagem BOOLEAN DEFAULT TRUE`);
  await pool.query(`ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS horario_atendimento TEXT`);
}

garantirSistemaWhatsAppPerfil().catch((error) => {
  console.error('Erro ao garantir sistema WhatsApp/perfil:', error.message);
});

async function registrarMensagemWhatsApp({ profissionalId = null, coletaId = null, whatsapp, tipo, templateNome = '', mensagem = '', status = 'pendente', messageId = null, erro = '', payload = {}, resposta = {} }) {
  await garantirSistemaWhatsAppPerfil();
  const result = await pool.query(
    `INSERT INTO whatsapp_mensagens (
      profissional_id, coleta_id, whatsapp, tipo, template_nome, mensagem, status, message_id, erro, payload, resposta,
      enviado_em, atualizado_em
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb,
      CASE WHEN $7 IN ('enviada','sent','delivered','read') THEN NOW() ELSE NULL END,
      NOW()
    ) RETURNING *`,
    [
      profissionalId,
      coletaId,
      numeroWhatsAppApi(whatsapp),
      tipo,
      templateNome || null,
      mensagem || '',
      status,
      messageId,
      erro || '',
      JSON.stringify(payload || {}),
      JSON.stringify(resposta || {})
    ]
  );
  return result.rows[0];
}

async function atualizarMensagemWhatsAppPorMessageId(messageId, status, dados = {}) {
  if (!messageId) return null;
  await garantirSistemaWhatsAppPerfil();

  const camposTempo = {
    sent: 'enviado_em',
    delivered: 'entregue_em',
    read: 'lido_em',
    failed: 'atualizado_em'
  };
  const campo = camposTempo[status] || 'atualizado_em';
  const erro = dados?.errors?.[0]?.title || dados?.errors?.[0]?.message || dados?.errors?.[0]?.error_data?.details || '';

  const result = await pool.query(
    `UPDATE whatsapp_mensagens
     SET status=$1,
         erro=COALESCE(NULLIF($2,''), erro),
         resposta=COALESCE(resposta, '{}'::jsonb) || $3::jsonb,
         ${campo}=NOW(),
         atualizado_em=NOW()
     WHERE message_id=$4
     RETURNING *`,
    [status, erro, JSON.stringify(dados || {}), messageId]
  );

  return result.rows[0] || null;
}

async function enviarWhatsAppTemplate({ to, templateName, language = WHATSAPP_TEMPLATE_LANGUAGE, parameters = [], tipo = 'template', profissionalId = null, coletaId = null, mensagemResumo = '' }) {
  await garantirSistemaWhatsAppPerfil();

  const whatsapp = numeroWhatsAppApi(to);
  const templateNome = String(templateName || '').trim();

  // TESTE META: o template padrão hello_world não aceita variáveis.
  // Quando o template for hello_world, enviamos sem parâmetros e em inglês.
  const usandoHelloWorld = templateNome.toLowerCase() === 'hello_world';

  if (usandoHelloWorld) {
    parameters = [];
    language = 'en_US';
  }

  if (!whatsapp || whatsapp.length < 12) {
    return registrarMensagemWhatsApp({
      profissionalId,
      coletaId,
      whatsapp: whatsapp || to,
      tipo,
      templateNome,
      mensagem: mensagemResumo,
      status: 'erro',
      erro: 'Número de WhatsApp inválido para envio.'
    });
  }

  if (!whatsappConfigurado()) {
    return registrarMensagemWhatsApp({
      profissionalId,
      coletaId,
      whatsapp,
      tipo,
      templateNome,
      mensagem: mensagemResumo,
      status: 'erro',
      erro: 'WhatsApp Cloud API não configurada. Confira WHATSAPP_TOKEN e WHATSAPP_PHONE_NUMBER_ID na Railway.'
    });
  }

  const bodyParameters = parameters.map((text) => ({
    type: 'text',
    text: String(text ?? '').slice(0, 1024)
  }));

  const payload = {
    messaging_product: 'whatsapp',
    to: whatsapp,
    type: 'template',
    template: {
      name: templateNome,
      language: { code: language }
    }
  };

  if (bodyParameters.length) {
    payload.template.components = [
      {
        type: 'body',
        parameters: bodyParameters
      }
    ];
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    const resposta = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const dados = await resposta.json().catch(() => ({}));
    const messageId = dados?.messages?.[0]?.id || null;

    if (!resposta.ok) {
      const erro = dados?.error?.message || dados?.error?.error_data?.details || 'Erro ao enviar mensagem WhatsApp.';
      return registrarMensagemWhatsApp({
        profissionalId,
        coletaId,
        whatsapp,
        tipo,
        templateNome,
        mensagem: mensagemResumo,
        status: 'erro',
        erro,
        payload,
        resposta: dados
      });
    }

    return registrarMensagemWhatsApp({
      profissionalId,
      coletaId,
      whatsapp,
      tipo,
      templateNome,
      mensagem: mensagemResumo,
      status: 'enviada',
      messageId,
      payload,
      resposta: dados
    });
  } catch (error) {
    return registrarMensagemWhatsApp({
      profissionalId,
      coletaId,
      whatsapp,
      tipo,
      templateNome,
      mensagem: mensagemResumo,
      status: 'erro',
      erro: error.message,
      payload
    });
  }
}

async function enviarWhatsAppTextoLivre({ to, body, tipo = 'texto', profissionalId = null, coletaId = null }) {
  await garantirSistemaWhatsAppPerfil();

  const whatsapp = numeroWhatsAppApi(to);
  if (!whatsappConfigurado() || !WHATSAPP_PERMITIR_TEXTO_LIVRE) {
    return registrarMensagemWhatsApp({
      profissionalId,
      coletaId,
      whatsapp,
      tipo,
      mensagem: body,
      status: 'erro',
      erro: WHATSAPP_PERMITIR_TEXTO_LIVRE
        ? 'WhatsApp Cloud API não configurada.'
        : 'Texto livre desativado. Use templates aprovados pela Meta.'
    });
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: whatsapp,
    type: 'text',
    text: { body: String(body || '').slice(0, 4096), preview_url: true }
  };

  try {
    const resposta = await fetch(`https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const dados = await resposta.json().catch(() => ({}));
    const messageId = dados?.messages?.[0]?.id || null;

    if (!resposta.ok) {
      const erro = dados?.error?.message || dados?.error?.error_data?.details || 'Erro ao enviar texto WhatsApp.';
      return registrarMensagemWhatsApp({ profissionalId, coletaId, whatsapp, tipo, mensagem: body, status: 'erro', erro, payload, resposta: dados });
    }

    return registrarMensagemWhatsApp({ profissionalId, coletaId, whatsapp, tipo, mensagem: body, status: 'enviada', messageId, payload, resposta: dados });
  } catch (error) {
    return registrarMensagemWhatsApp({ profissionalId, coletaId, whatsapp, tipo, mensagem: body, status: 'erro', erro: error.message, payload });
  }
}

async function enviarMensagemCadastroProfissional({ profissional, coleta, req = null }) {
  const link = linkCompletarPerfil(req);
  const municipio = coleta?.cidade || profissional?.cidade || CIDADE_MUNICIPIO_PADRAO;
  const nome = profissional?.nome || coleta?.nome || 'Profissional';
  const profissao = profissional?.profissao || coleta?.profissao || 'Profissional local';
  const setor = coleta?.setor || profissional?.setor_coleta || profissional?.bairro || 'Setor informado';
  const whatsapp = profissional?.whatsapp || coleta?.whatsapp || '';

  const mensagemResumo = `Cadastro Norte Servic: ${nome} (${profissao}) em ${municipio}. Completar perfil: ${link}`;

  const templateCadastro = String(WHATSAPP_TEMPLATE_CADASTRO || '').trim();
  const cadastroUsandoHelloWorld = templateCadastro.toLowerCase() === 'hello_world';

  const registro = await enviarWhatsAppTemplate({
    to: whatsapp,
    templateName: templateCadastro,
    language: cadastroUsandoHelloWorld ? 'en_US' : WHATSAPP_TEMPLATE_LANGUAGE,
    parameters: cadastroUsandoHelloWorld ? [] : [nome, municipio, profissao, setor, link],
    tipo: 'cadastro_profissional',
    profissionalId: profissional?.id || null,
    coletaId: coleta?.id || null,
    mensagemResumo
  });

  if (profissional?.id && registro.status !== 'erro') {
    await pool.query(
      `UPDATE profissionais SET link_completar_perfil_enviado_em=NOW(), autorizou_receber_mensagem=TRUE WHERE id=$1`,
      [profissional.id]
    );
  }

  if (coleta?.id) {
    await pool.query(
      `UPDATE cidade_coleta_profissionais SET whatsapp_mensagem_cadastro_id=$1, autorizou_receber_mensagem=TRUE WHERE id=$2`,
      [registro.id, coleta.id]
    ).catch(() => {});
  }

  return registro;
}

function gerarCodigoAcessoPerfil() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function gerarTokenAcessoProfissional(profissional) {
  return jwt.sign(
    { tipo: 'perfil-whatsapp', id: profissional.id, whatsapp: profissional.whatsapp },
    PROFISSIONAL_ACESSO_SECRET,
    { expiresIn: '2h' }
  );
}

function autenticarAcessoProfissionalWhatsApp(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ erro: 'Código de acesso necessário.' });
  }

  try {
    const dados = jwt.verify(token, PROFISSIONAL_ACESSO_SECRET);
    if (dados.tipo !== 'perfil-whatsapp') {
      return res.status(401).json({ erro: 'Acesso de perfil inválido.' });
    }
    req.profissionalAcesso = dados;
    next();
  } catch (_) {
    return res.status(401).json({ erro: 'Acesso expirado. Solicite um novo código.' });
  }
}

function profissionalCompletarPerfilParaFrontend(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    nome: row.nome || '',
    whatsapp: row.whatsapp || '',
    profissao: row.profissao || '',
    servicos: row.servicos || '',
    cidade: row.cidade || '',
    bairro: row.bairro || '',
    instagram: row.instagram || '',
    descricao: row.descricao || '',
    fotoPerfil: row.foto_perfil || '',
    atendeOutrasCidades: row.atende_outras_cidades || '',
    cidadesAtendidas: parseJsonArray(row.cidades_atendidas),
    horarioAtendimento: row.horario_atendimento || '',
    perfilCompleto: Boolean(row.perfil_completo),
    perfilColetaPendente: row.perfil_coleta_pendente !== false
  };
}


const adminLoginAttempts = new Map();

function parseCookies(req) {
  return String(req.headers.cookie || '')
    .split(';')
    .map((parte) => parte.trim())
    .filter(Boolean)
    .reduce((cookies, parte) => {
      const indice = parte.indexOf('=');
      if (indice === -1) return cookies;
      const chave = decodeURIComponent(parte.slice(0, indice));
      const valor = decodeURIComponent(parte.slice(indice + 1));
      cookies[chave] = valor;
      return cookies;
    }, {});
}

function cookieSeguroAdmin(valor, maxAgeMs = ADMIN_COOKIE_MAX_AGE_MS) {
  const partes = [
    `${ADMIN_COOKIE_NAME}=${encodeURIComponent(valor)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`
  ];
  if (IS_PRODUCTION) partes.push('Secure');
  return partes.join('; ');
}

function limparCookieAdmin() {
  const partes = [
    `${ADMIN_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0'
  ];
  if (IS_PRODUCTION) partes.push('Secure');
  return partes.join('; ');
}

function ipRequisicao(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '')
    .split(',')[0]
    .trim() || 'ip-desconhecido';
}

function verificarLimiteLoginAdmin(req, email) {
  const chave = `${ipRequisicao(req)}:${String(email || '').toLowerCase()}`;
  const agora = Date.now();
  const janelaMs = 15 * 60 * 1000;
  const limite = 5;
  const registro = adminLoginAttempts.get(chave) || { tentativas: 0, primeira: agora, bloqueadoAte: 0 };

  if (registro.bloqueadoAte && registro.bloqueadoAte > agora) {
    const minutos = Math.ceil((registro.bloqueadoAte - agora) / 60000);
    return { ok: false, mensagem: `Muitas tentativas. Tente novamente em ${minutos} minuto(s).` };
  }

  if (agora - registro.primeira > janelaMs) {
    registro.tentativas = 0;
    registro.primeira = agora;
    registro.bloqueadoAte = 0;
  }

  registro.tentativas += 1;
  if (registro.tentativas > limite) {
    registro.bloqueadoAte = agora + janelaMs;
    adminLoginAttempts.set(chave, registro);
    return { ok: false, mensagem: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.' };
  }

  adminLoginAttempts.set(chave, registro);
  return { ok: true, chave };
}

function limparTentativasLoginAdmin(req, email) {
  const chave = `${ipRequisicao(req)}:${String(email || '').toLowerCase()}`;
  adminLoginAttempts.delete(chave);
}

async function registrarAuditoria(req, acao, detalhes = {}) {
  try {
    const usuario = req.adminUser || {};
    await pool.query(
      `INSERT INTO audit_logs (usuario_id, usuario_email, usuario_role, acao, ip, user_agent, detalhes)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        usuario.id || null,
        usuario.email || null,
        usuario.role || null,
        acao,
        ipRequisicao(req),
        String(req.headers['user-agent'] || '').slice(0, 500),
        detalhes
      ]
    );
  } catch (error) {
    console.warn('Falha ao registrar auditoria:', error.message);
  }
}

async function garantirSistemaAdminSeguro() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'super_admin',
      ativo BOOLEAN NOT NULL DEFAULT TRUE,
      ultimo_login TIMESTAMPTZ,
      criado_em TIMESTAMPTZ DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id BIGSERIAL PRIMARY KEY,
      usuario_id INTEGER,
      usuario_email TEXT,
      usuario_role TEXT,
      acao TEXT NOT NULL,
      ip TEXT,
      user_agent TEXT,
      detalhes JSONB DEFAULT '{}'::jsonb,
      criado_em TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await pool.query('CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users (LOWER(email))');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_criado_em ON audit_logs (criado_em DESC)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_acao ON audit_logs (acao)');

  const qtd = await pool.query('SELECT COUNT(*)::int AS total FROM admin_users');
  if (Number(qtd.rows[0]?.total || 0) === 0 && process.env.ADMIN_BOOTSTRAP_EMAIL && process.env.ADMIN_BOOTSTRAP_PASSWORD) {
    const email = String(process.env.ADMIN_BOOTSTRAP_EMAIL).trim().toLowerCase();
    const nome = process.env.ADMIN_BOOTSTRAP_NAME || 'Administrador Norte Servic';
    const senhaHash = await bcrypt.hash(String(process.env.ADMIN_BOOTSTRAP_PASSWORD), 12);
    await pool.query(
      `INSERT INTO admin_users (nome, email, senha_hash, role, ativo)
       VALUES ($1,$2,$3,'super_admin', TRUE)
       ON CONFLICT (email) DO NOTHING`,
      [nome, email, senhaHash]
    );
    console.log('Admin inicial criado via variáveis ADMIN_BOOTSTRAP_EMAIL/ADMIN_BOOTSTRAP_PASSWORD.');
  }
}

garantirSistemaAdminSeguro().catch((error) => {
  console.error('Erro ao garantir sistema admin seguro:', error.message);
});

async function autenticarAdmin(req, res, next) {
  try {
    const cookies = parseCookies(req);
    const token = cookies[ADMIN_COOKIE_NAME];

    if (!token) {
      return res.status(401).json({ erro: 'Sessão administrativa não encontrada.' });
    }

    const payload = jwt.verify(token, ADMIN_SESSION_SECRET);
    if (!payload || payload.tipo !== 'admin' || !payload.id) {
      return res.status(401).json({ erro: 'Sessão administrativa inválida.' });
    }

    await garantirSistemaAdminSeguro();

    const result = await pool.query(
      `SELECT id, nome, email, role, ativo, ultimo_login
       FROM admin_users
       WHERE id=$1 AND ativo=TRUE
       LIMIT 1`,
      [payload.id]
    );

    if (!result.rows.length) {
      res.setHeader('Set-Cookie', limparCookieAdmin());
      return res.status(401).json({ erro: 'Usuário administrativo inativo ou não encontrado.' });
    }

    req.adminUser = result.rows[0];
    next();
  } catch (error) {
    res.setHeader('Set-Cookie', limparCookieAdmin());
    return res.status(401).json({ erro: 'Sessão administrativa expirada. Faça login novamente.' });
  }
}

function exigirAdminRoles(...rolesPermitidas) {
  return (req, res, next) => {
    const role = req.adminUser?.role;
    if (!rolesPermitidas.length || rolesPermitidas.includes(role) || role === 'super_admin') {
      return next();
    }
    return res.status(403).json({ erro: 'Você não tem permissão para executar esta ação.' });
  };
}

app.post('/api/admin/auth/login', async (req, res) => {
  try {
    await garantirSistemaAdminSeguro();

    const email = String(req.body.email || '').trim().toLowerCase();
    const senha = String(req.body.senha || '');

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Informe e-mail e senha.' });
    }

    const limite = verificarLimiteLoginAdmin(req, email);
    if (!limite.ok) {
      return res.status(429).json({ erro: limite.mensagem });
    }

    const result = await pool.query(
      `SELECT id, nome, email, senha_hash, role, ativo
       FROM admin_users
       WHERE LOWER(email)=LOWER($1)
       LIMIT 1`,
      [email]
    );

    const usuario = result.rows[0];
    const senhaOk = usuario?.ativo ? await bcrypt.compare(senha, usuario.senha_hash) : false;

    if (!usuario || !senhaOk) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    limparTentativasLoginAdmin(req, email);

    await pool.query('UPDATE admin_users SET ultimo_login=NOW(), atualizado_em=NOW() WHERE id=$1', [usuario.id]);

    const token = jwt.sign(
      {
        tipo: 'admin',
        id: usuario.id,
        email: usuario.email,
        role: usuario.role
      },
      ADMIN_SESSION_SECRET,
      { expiresIn: Math.floor(ADMIN_COOKIE_MAX_AGE_MS / 1000) }
    );

    res.setHeader('Set-Cookie', cookieSeguroAdmin(token));
    const usuarioSeguro = { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role };
    req.adminUser = usuarioSeguro;
    await registrarAuditoria(req, 'admin_login', { email: usuario.email });

    res.json({ ok: true, usuario: usuarioSeguro });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao realizar login administrativo.', detalhe: error.message });
  }
});

app.get('/api/admin/auth/me', autenticarAdmin, async (req, res) => {
  res.json({ ok: true, usuario: req.adminUser });
});

app.post('/api/admin/auth/logout', autenticarAdmin, async (req, res) => {
  await registrarAuditoria(req, 'admin_logout', {});
  res.setHeader('Set-Cookie', limparCookieAdmin());
  res.json({ ok: true });
});


app.get('/api/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token && token === WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.status(403).send('Token de verificação inválido.');
});

app.post('/api/whatsapp/webhook', async (req, res) => {
  try {
    await garantirSistemaWhatsAppPerfil();

    const body = req.body || {};
    const entries = Array.isArray(body.entry) ? body.entry : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = change.value || {};

        const statuses = Array.isArray(value.statuses) ? value.statuses : [];
        for (const status of statuses) {
          await atualizarMensagemWhatsAppPorMessageId(status.id, status.status, status);
        }

        const messages = Array.isArray(value.messages) ? value.messages : [];
        for (const message of messages) {
          const from = numeroWhatsAppApi(message.from || '');
          const texto = message.text?.body || message.button?.text || message.type || '';
          await registrarMensagemWhatsApp({
            whatsapp: from,
            tipo: 'recebida',
            mensagem: texto,
            status: 'recebida',
            messageId: message.id || null,
            resposta: message
          });
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error.message);
    res.sendStatus(200);
  }
});

app.get('/api/admin/whatsapp/mensagens', autenticarAdmin, async (req, res) => {
  try {
    await garantirSistemaWhatsAppPerfil();
    const status = String(req.query.status || '').trim();
    const params = [];
    let where = '';
    if (status) {
      params.push(status);
      where = 'WHERE wm.status=$1';
    }

    const result = await pool.query(`
      SELECT wm.*, p.nome AS profissional_nome, p.profissao AS profissional_profissao
      FROM whatsapp_mensagens wm
      LEFT JOIN profissionais p ON p.id = wm.profissional_id
      ${where}
      ORDER BY wm.criado_em DESC
      LIMIT 200
    `, params);

    res.json(result.rows.map((row) => ({
      id: Number(row.id),
      profissionalId: row.profissional_id ? Number(row.profissional_id) : null,
      profissionalNome: row.profissional_nome || '',
      profissionalProfissao: row.profissional_profissao || '',
      coletaId: row.coleta_id ? Number(row.coleta_id) : null,
      whatsapp: row.whatsapp || '',
      tipo: row.tipo || '',
      templateNome: row.template_nome || '',
      mensagem: row.mensagem || '',
      status: row.status || '',
      messageId: row.message_id || '',
      erro: row.erro || '',
      enviadoEm: row.enviado_em,
      entregueEm: row.entregue_em,
      lidoEm: row.lido_em,
      respondidoEm: row.respondido_em,
      criadoEm: row.criado_em
    })));
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar mensagens WhatsApp.', detalhe: error.message });
  }
});

app.post('/api/admin/whatsapp/teste', autenticarAdmin, async (req, res) => {
  try {
    const whatsapp = numeroWhatsAppApi(req.body.whatsapp || '');
    const template = String(req.body.template || 'hello_world').trim();
    const templateEhHelloWorld = template.toLowerCase() === 'hello_world';
    const language = String(req.body.language || (templateEhHelloWorld ? 'en_US' : WHATSAPP_TEMPLATE_LANGUAGE)).trim();
    const parameters = templateEhHelloWorld
      ? []
      : (Array.isArray(req.body.parameters) ? req.body.parameters : []);

    const registro = await enviarWhatsAppTemplate({
      to: whatsapp,
      templateName: template,
      language,
      parameters,
      tipo: 'teste_admin',
      mensagemResumo: `Teste WhatsApp admin: ${template}`
    });

    res.json({
      ok: registro.status !== 'erro',
      mensagem: registro.status === 'erro' ? 'Teste registrado com erro.' : 'Mensagem de teste enviada.',
      registro: {
        id: Number(registro.id),
        status: registro.status,
        erro: registro.erro || '',
        messageId: registro.message_id || ''
      }
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao testar WhatsApp.', detalhe: error.message });
  }
});

app.post('/api/profissional-acesso/solicitar-codigo', async (req, res) => {
  try {
    await garantirSistemaWhatsAppPerfil();

    const whatsapp = numeroWhatsAppApi(req.body.whatsapp || '');
    if (!whatsapp || whatsapp.length < 12) {
      return res.status(400).json({ erro: 'Informe um WhatsApp válido com DDD.' });
    }

    const profissionalResult = await pool.query(
      `SELECT *
       FROM profissionais
       WHERE whatsapp=$1
       ORDER BY id DESC
       LIMIT 1`,
      [whatsapp]
    );

    if (!profissionalResult.rows.length) {
      return res.status(404).json({ erro: 'Não encontramos perfil vinculado a este WhatsApp.' });
    }

    const profissional = profissionalResult.rows[0];

    const recentes = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM profissional_acessos_codigo
       WHERE whatsapp=$1 AND criado_em > NOW() - INTERVAL '5 minutes'`,
      [whatsapp]
    );

    if (Number(recentes.rows[0]?.total || 0) >= 3) {
      return res.status(429).json({ erro: 'Muitas tentativas. Aguarde alguns minutos para solicitar outro código.' });
    }

    const codigo = gerarCodigoAcessoPerfil();
    const codigoHash = await bcrypt.hash(codigo, 10);

    await pool.query(
      `INSERT INTO profissional_acessos_codigo (profissional_id, whatsapp, codigo_hash, expira_em, ip, user_agent)
       VALUES ($1,$2,$3,NOW() + ($4 || ' minutes')::interval,$5,$6)`,
      [
        profissional.id,
        whatsapp,
        codigoHash,
        WHATSAPP_CODIGO_EXPIRA_MINUTOS,
        ipRequisicao(req),
        String(req.headers['user-agent'] || '').slice(0, 500)
      ]
    );

    const mensagemResumo = `Código de acesso Norte Servic: ${codigo}. Expira em ${WHATSAPP_CODIGO_EXPIRA_MINUTOS} minutos.`;
    let envio;

    if (WHATSAPP_TEMPLATE_CODIGO) {
      envio = await enviarWhatsAppTemplate({
        to: whatsapp,
        templateName: WHATSAPP_TEMPLATE_CODIGO,
        parameters: [codigo, String(WHATSAPP_CODIGO_EXPIRA_MINUTOS)],
        tipo: 'codigo_acesso',
        profissionalId: profissional.id,
        mensagemResumo
      });
    } else {
      envio = await enviarWhatsAppTextoLivre({
        to: whatsapp,
        body: mensagemResumo,
        tipo: 'codigo_acesso',
        profissionalId: profissional.id
      });
    }

    res.json({
      mensagem: envio.status === 'erro'
        ? 'Código gerado, mas houve erro ao enviar pelo WhatsApp. Verifique a configuração da API.'
        : 'Código enviado pelo WhatsApp.',
      statusWhatsApp: envio.status,
      erroWhatsApp: envio.erro || ''
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao solicitar código.', detalhe: error.message });
  }
});

app.post('/api/profissional-acesso/validar-codigo', async (req, res) => {
  try {
    await garantirSistemaWhatsAppPerfil();

    const whatsapp = numeroWhatsAppApi(req.body.whatsapp || '');
    const codigo = String(req.body.codigo || '').replace(/\D/g, '');

    if (!whatsapp || !codigo || codigo.length !== 6) {
      return res.status(400).json({ erro: 'Informe WhatsApp e código de 6 dígitos.' });
    }

    const result = await pool.query(
      `SELECT pac.*, p.nome, p.whatsapp AS profissional_whatsapp
       FROM profissional_acessos_codigo pac
       JOIN profissionais p ON p.id = pac.profissional_id
       WHERE pac.whatsapp=$1
         AND pac.usado=FALSE
         AND pac.expira_em > NOW()
       ORDER BY pac.criado_em DESC
       LIMIT 1`,
      [whatsapp]
    );

    if (!result.rows.length) {
      return res.status(401).json({ erro: 'Código expirado ou inexistente. Solicite um novo código.' });
    }

    const acesso = result.rows[0];

    if (Number(acesso.tentativas || 0) >= 5) {
      return res.status(429).json({ erro: 'Muitas tentativas incorretas. Solicite um novo código.' });
    }

    const ok = await bcrypt.compare(codigo, acesso.codigo_hash);
    if (!ok) {
      await pool.query('UPDATE profissional_acessos_codigo SET tentativas=tentativas+1 WHERE id=$1', [acesso.id]);
      return res.status(401).json({ erro: 'Código incorreto.' });
    }

    await pool.query(
      `UPDATE profissional_acessos_codigo SET usado=TRUE, usado_em=NOW() WHERE id=$1`,
      [acesso.id]
    );

    await pool.query(
      `UPDATE profissionais SET ultimo_acesso_perfil=NOW() WHERE id=$1`,
      [acesso.profissional_id]
    );

    const profissional = { id: acesso.profissional_id, whatsapp };
    const token = gerarTokenAcessoProfissional(profissional);

    res.json({
      mensagem: 'Código validado. Você já pode completar seu perfil.',
      token
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao validar código.', detalhe: error.message });
  }
});

app.get('/api/profissional-acesso/me', autenticarAcessoProfissionalWhatsApp, async (req, res) => {
  try {
    await garantirSistemaWhatsAppPerfil();

    const result = await pool.query('SELECT * FROM profissionais WHERE id=$1 AND whatsapp=$2 LIMIT 1', [
      req.profissionalAcesso.id,
      req.profissionalAcesso.whatsapp
    ]);

    if (!result.rows.length) {
      return res.status(404).json({ erro: 'Perfil não encontrado.' });
    }

    res.json({ profissional: profissionalCompletarPerfilParaFrontend(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao carregar perfil.', detalhe: error.message });
  }
});

app.patch('/api/profissional-acesso/me', autenticarAcessoProfissionalWhatsApp, async (req, res) => {
  try {
    await garantirSistemaWhatsAppPerfil();

    const atual = await pool.query('SELECT * FROM profissionais WHERE id=$1 AND whatsapp=$2 LIMIT 1', [
      req.profissionalAcesso.id,
      req.profissionalAcesso.whatsapp
    ]);

    if (!atual.rows.length) {
      return res.status(404).json({ erro: 'Perfil não encontrado.' });
    }

    const dados = req.body || {};
    const pasta = `profissionais/${req.profissionalAcesso.id}`;
    const imagens = await processarImagensProfissional(dados, pasta, {
      fotoPerfil: atual.rows[0].foto_perfil || '',
      fotosTrabalhos: parseJsonArray(atual.rows[0].fotos_trabalhos)
    });

    const instagram = String(dados.instagram || '').trim().replace(/^https?:\/\/((www\.)?instagram\.com\/)?/i, '').replace(/^@?/, '@');
    const cidadesAtendidas = Array.isArray(dados.cidadesAtendidas || dados.cidades_atendidas)
      ? (dados.cidadesAtendidas || dados.cidades_atendidas)
      : parseJsonArray(dados.cidadesAtendidas || dados.cidades_atendidas);

    const result = await pool.query(
      `UPDATE profissionais SET
        descricao=$1,
        instagram=$2,
        servicos=$3,
        bairro=$4,
        atende_outras_cidades=$5,
        cidades_atendidas=$6::jsonb,
        horario_atendimento=$7,
        foto_perfil=$8,
        fotos_trabalhos=$9::jsonb,
        perfil_completo=TRUE,
        perfil_coleta_pendente=FALSE,
        atualizado_em=NOW()
       WHERE id=$10 AND whatsapp=$11
       RETURNING *`,
      [
        String(dados.descricao || atual.rows[0].descricao || '').trim(),
        instagram === '@' ? '' : instagram,
        String(dados.servicos || atual.rows[0].servicos || '').trim(),
        String(dados.bairro || atual.rows[0].bairro || '').trim(),
        String(dados.atendeOutrasCidades || dados.atende_outras_cidades || atual.rows[0].atende_outras_cidades || 'Não'),
        JSON.stringify(cidadesAtendidas.length ? cidadesAtendidas : parseJsonArray(atual.rows[0].cidades_atendidas)),
        String(dados.horarioAtendimento || dados.horario_atendimento || '').trim(),
        imagens.fotoPerfil || atual.rows[0].foto_perfil || '',
        JSON.stringify(imagens.fotosTrabalhos || parseJsonArray(atual.rows[0].fotos_trabalhos)),
        req.profissionalAcesso.id,
        req.profissionalAcesso.whatsapp
      ]
    );

    res.json({
      mensagem: 'Perfil atualizado com segurança.',
      profissional: profissionalCompletarPerfilParaFrontend(result.rows[0])
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar perfil.', detalhe: error.message });
  }
});


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

app.get('/api/debug/efi', autenticarAdmin, exigirAdminRoles('super_admin', 'financeiro'), async (req, res) => {
  await registrarAuditoria(req, 'debug_efi_visualizado', {});
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


app.patch('/api/admin/profissionais/:id', autenticarAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erro: 'ID do profissional inválido.' });
    }

    const dados = req.body || {};
    const campos = {
      nome: String(dados.nome || '').trim(),
      tipo_profissional: String(dados.tipoProfissional || dados.tipo_profissional || '').trim(),
      categoria: String(dados.categoria || '').trim(),
      profissao: String(dados.profissao || '').trim(),
      servicos: String(dados.servicos || '').trim(),
      cidade: String(dados.cidade || '').trim(),
      bairro: String(dados.bairro || '').trim(),
      forma_atendimento: String(dados.formaAtendimento || dados.forma_atendimento || '').trim(),
      whatsapp: limparNumero(dados.whatsapp || ''),
      instagram: String(dados.instagram || '').trim(),
      descricao: String(dados.descricao || '').trim(),
      horario_atendimento: String(dados.horarioAtendimento || dados.horario_atendimento || '').trim()
    };

    if (!campos.nome || !campos.profissao) {
      return res.status(400).json({ erro: 'Nome e profissão são obrigatórios para salvar o perfil.' });
    }

    const result = await pool.query(
      `UPDATE profissionais SET
        nome=$1,
        tipo_profissional=$2,
        categoria=$3,
        profissao=$4,
        servicos=$5,
        cidade=$6,
        bairro=$7,
        forma_atendimento=$8,
        whatsapp=$9,
        instagram=$10,
        descricao=$11,
        horario_atendimento=$12,
        atualizado_em=NOW()
       WHERE id=$13
       RETURNING *`,
      [
        campos.nome,
        campos.tipo_profissional || 'Profissional local',
        campos.categoria || 'Profissionais locais',
        campos.profissao,
        campos.servicos || campos.profissao,
        campos.cidade || CIDADE_MUNICIPIO_PADRAO,
        campos.bairro,
        campos.forma_atendimento || 'Presencial',
        campos.whatsapp,
        campos.instagram,
        campos.descricao,
        campos.horario_atendimento,
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: 'Profissional não encontrado.' });
    }

    res.json({ mensagem: 'Perfil do profissional atualizado pelo administrador.', profissional: profissionalParaFrontend(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao editar profissional.', detalhe: error.message });
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


function normalizarTipoChavePixCidade(valor) {
  const tipo = String(valor || '').trim().toLowerCase();
  const permitidos = ['cpf', 'cnpj', 'telefone', 'email', 'aleatoria'];
  return permitidos.includes(tipo) ? tipo : '';
}

function dadosPagamentoColetorCompletos(row) {
  return Boolean(
    String(row?.pix_nome_titular || '').trim() &&
    String(row?.pix_cpf_cnpj || '').replace(/\D/g, '').length >= 11 &&
    normalizarTipoChavePixCidade(row?.pix_tipo_chave) &&
    String(row?.pix_chave || '').trim()
  );
}

function dadosPagamentoColetorParaFrontend(row = {}) {
  return {
    nomeTitular: row.pix_nome_titular || '',
    cpfCnpj: row.pix_cpf_cnpj || '',
    tipoChavePix: row.pix_tipo_chave || '',
    chavePix: row.pix_chave || '',
    banco: row.banco_nome || '',
    completo: dadosPagamentoColetorCompletos(row)
  };
}

app.get('/api/cidade/coletor/comissao', autenticarColetorCidade, async (req, res) => {
  try {
    await garantirSistemaCidadeParceira();

    const valorPorCadastro = await buscarComissaoColetorCidade(req.coletorCidade.id);
    const coletorResult = await pool.query('SELECT * FROM cidade_coletores WHERE id=$1 LIMIT 1', [req.coletorCidade.id]);
    const coletor = coletorResult.rows[0] || {};

    const hojeResult = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM cidade_coleta_profissionais
      WHERE coletor_id=$1
        AND criado_em >= (date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo')
    `, [req.coletorCidade.id]);

    const disponiveisResult = await pool.query(`
      SELECT COUNT(*)::int AS total
      FROM cidade_coleta_profissionais
      WHERE coletor_id=$1
        AND saque_coletor_id IS NULL
    `, [req.coletorCidade.id]);

    const cadastrosHoje = Number(hojeResult.rows[0]?.total || 0);
    const cadastrosDisponiveis = Number(disponiveisResult.rows[0]?.total || 0);
    const valorDisponivel = cadastrosDisponiveis * valorPorCadastro;
    const metaSaque = CIDADE_COMISSAO_META_SAQUE;
    const percentualLimite = metaSaque > 0 ? Math.round((Math.min(valorDisponivel, metaSaque) / metaSaque) * 100) : 0;
    const faltamParaSaque = Math.max(0, metaSaque - valorDisponivel);
    const faltamCadastrosParaSaque = valorPorCadastro > 0 ? Math.ceil(faltamParaSaque / valorPorCadastro) : 0;
    const saqueLiberado = valorDisponivel >= metaSaque;

    const saquePendente = await pool.query(`
      SELECT *
      FROM cidade_saques_coletores
      WHERE coletor_id=$1 AND status='aguardando'
      ORDER BY criado_em DESC
      LIMIT 1
    `, [req.coletorCidade.id]);

    const ultimoSaque = await pool.query(`
      SELECT *
      FROM cidade_saques_coletores
      WHERE coletor_id=$1
      ORDER BY criado_em DESC
      LIMIT 1
    `, [req.coletorCidade.id]);

    const dadosPagamento = dadosPagamentoColetorParaFrontend(coletor);
    const faltamDadosPix = !dadosPagamento.completo;

    res.json({
      cadastrosHoje,
      cadastrosDisponiveis,
      valorPorCadastro,
      metaSaque,
      limiteDiario: metaSaque,
      valorDisponivel,
      percentualLimite: Math.max(0, Math.min(100, percentualLimite)),
      faltamParaSaque,
      faltamCadastrosParaSaque,
      saqueLiberado,
      saquePendente: saquePendente.rowCount > 0,
      saquePendenteId: saquePendente.rows[0]?.id || null,
      ultimoSaque: ultimoSaque.rowCount ? saqueColetorParaFrontend(ultimoSaque.rows[0]) : null,
      dadosPagamento,
      dadosPagamentoCompleto: dadosPagamento.completo,
      faltamDadosPix,
      whatsappSaque: CIDADE_WHATSAPP_SAQUE,
      regraSaque: 'O saque é liberado ao completar a meta de R$ 50,00 em cadastros disponíveis. Após solicitar, os cadastros ficam reservados para análise do Admin.',
      mensagem: saquePendente.rowCount > 0
        ? 'Sua solicitação de saque já está aguardando análise no Painel Admin.'
        : faltamDadosPix
          ? 'Preencha seus dados Pix para liberar a solicitação quando atingir a meta.'
          : saqueLiberado
            ? 'Meta de saque atingida. Solicite o saque para análise do Admin.'
            : `${cadastrosDisponiveis} cadastro(s) disponível(is). Cada cadastro soma R$ ${valorPorCadastro.toFixed(2).replace('.', ',')}. Faltam ${faltamCadastrosParaSaque} cadastro(s) para liberar o saque.`
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao calcular comissão do coletor.', detalhe: error.message });
  }
});

app.get('/api/cidade/coletor/dados-pagamento', autenticarColetorCidade, async (req, res) => {
  try {
    await garantirSistemaCidadeParceira();
    const result = await pool.query('SELECT * FROM cidade_coletores WHERE id=$1 LIMIT 1', [req.coletorCidade.id]);
    res.json({ dadosPagamento: dadosPagamentoColetorParaFrontend(result.rows[0] || {}) });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao carregar dados Pix.', detalhe: error.message });
  }
});

app.put('/api/cidade/coletor/dados-pagamento', autenticarColetorCidade, async (req, res) => {
  try {
    await garantirSistemaCidadeParceira();
    const nomeTitular = String(req.body.nomeTitular || req.body.pix_nome_titular || '').trim();
    const cpfCnpj = String(req.body.cpfCnpj || req.body.pix_cpf_cnpj || '').replace(/\D/g, '');
    const tipoChave = normalizarTipoChavePixCidade(req.body.tipoChavePix || req.body.pix_tipo_chave);
    const chavePix = String(req.body.chavePix || req.body.pix_chave || '').trim();
    const banco = String(req.body.banco || req.body.banco_nome || '').trim();

    if (!nomeTitular || cpfCnpj.length < 11 || !tipoChave || !chavePix) {
      return res.status(400).json({ erro: 'Preencha nome completo, CPF/CNPJ, tipo de chave Pix e chave Pix.' });
    }

    const result = await pool.query(`
      UPDATE cidade_coletores
      SET pix_nome_titular=$1,
          pix_cpf_cnpj=$2,
          pix_tipo_chave=$3,
          pix_chave=$4,
          banco_nome=$5,
          atualizado_em=NOW()
      WHERE id=$6
      RETURNING *
    `, [nomeTitular, cpfCnpj, tipoChave, chavePix, banco || null, req.coletorCidade.id]);

    res.json({
      mensagem: 'Dados Pix salvos com segurança.',
      dadosPagamento: dadosPagamentoColetorParaFrontend(result.rows[0])
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao salvar dados Pix.', detalhe: error.message });
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


app.get('/api/cidade/coleta/verificar-whatsapp', autenticarColetorCidade, async (req, res) => {
  try {
    await garantirSistemaCidadeParceira();
    const whatsapp = limparNumero(req.query.whatsapp || '');

    if (!whatsapp || whatsapp.length < 10) {
      return res.json({ existe: false });
    }

    const coleta = await pool.query(`
      SELECT id, nome, profissao, setor, criado_em
      FROM cidade_coleta_profissionais
      WHERE whatsapp=$1
      ORDER BY criado_em DESC
      LIMIT 1
    `, [whatsapp]);

    if (coleta.rowCount > 0) {
      const item = coleta.rows[0];
      return res.json({
        existe: true,
        origem: 'coleta do Cidade Parceira',
        cadastro: {
          id: item.id,
          nome: item.nome,
          profissao: item.profissao,
          setor: item.setor,
          criadoEm: item.criado_em
        }
      });
    }

    const profissional = await pool.query(`
      SELECT id, nome, profissao, status, criado_em
      FROM profissionais
      WHERE whatsapp=$1
      ORDER BY criado_em DESC
      LIMIT 1
    `, [whatsapp]);

    if (profissional.rowCount > 0) {
      const item = profissional.rows[0];
      return res.json({
        existe: true,
        origem: 'site oficial',
        cadastro: {
          id: item.id,
          nome: item.nome,
          profissao: item.profissao,
          status: item.status,
          criadoEm: item.criado_em
        }
      });
    }

    res.json({ existe: false });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao verificar WhatsApp.', detalhe: error.message });
  }
});

app.post('/api/cidade/coleta/profissionais', autenticarColetorCidade, async (req, res) => {
  try {
    await garantirSistemaCidadeParceira();
    await garantirSistemaWhatsAppPerfil();

    const dados = req.body || {};
    const nome = String(dados.nome || '').trim();
    const profissao = String(dados.profissao || '').trim();
    const whatsapp = limparNumero(dados.whatsapp || '');
    const aceitaSite = normalizarBooleanoCidade(dados.aceitaSite || dados.aceita_site);
    const autorizaMensagem = dados.autorizouMensagem === undefined && dados.autorizou_receber_mensagem === undefined
      ? true
      : normalizarBooleanoCidade(dados.autorizouMensagem || dados.autorizou_receber_mensagem);
    const emailProfissional = String(dados.emailProfissional || dados.email_profissional || '').trim().toLowerCase() || null;
    const instagram = String(dados.instagram || '').trim() || null;
    const meiStatus = String(dados.meiStatus || dados.mei_status || 'nao_informado').trim() || 'nao_informado';
    const interesseFormalizacao = String(dados.interesseFormalizacao || dados.interesse_formalizacao || 'nao_informado').trim() || 'nao_informado';
    const necessidadesEmpreendedor = Array.isArray(dados.necessidadesEmpreendedor || dados.necessidades_empreendedor)
      ? (dados.necessidadesEmpreendedor || dados.necessidades_empreendedor).map((item) => String(item || '').trim()).filter(Boolean)
      : [];
    const observacaoEmpreendedor = String(dados.observacaoEmpreendedor || dados.observacao_empreendedor || '').trim() || null;
    const setor = req.coletorCidade.setor;

    if (!nome || !profissao) {
      return res.status(400).json({ erro: 'Nome e profissão são obrigatórios.' });
    }

    const coleta = await pool.query(`
      INSERT INTO cidade_coleta_profissionais (
        coletor_id, nome, whatsapp, email_profissional, instagram, categoria, profissao, servicos,
        cidade, setor, bairro, descricao, aceita_site, autorizou_receber_mensagem,
        mei_status, interesse_formalizacao, necessidades_empreendedor, observacao_empreendedor, status_coleta
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::jsonb,$18,'coletado')
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
      aceitaSite,
      autorizaMensagem,
      meiStatus,
      interesseFormalizacao,
      JSON.stringify(necessidadesEmpreendedor),
      observacaoEmpreendedor
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

    let whatsappCadastro = null;
    if (aceitaSite && autorizaMensagem && profissionalPublicado && whatsapp) {
      try {
        whatsappCadastro = await enviarMensagemCadastroProfissional({
          profissional: profissionalPublicado,
          coleta: coleta.rows[0],
          req
        });
      } catch (erroWhatsApp) {
        whatsappCadastro = await registrarMensagemWhatsApp({
          profissionalId: profissionalPublicado.id,
          coletaId: coleta.rows[0].id,
          whatsapp,
          tipo: 'cadastro_profissional',
          templateNome: WHATSAPP_TEMPLATE_CADASTRO,
          status: 'erro',
          erro: erroWhatsApp.message
        });
      }
    }

    let mensagem = aceitaSite
      ? 'Profissional coletado e publicado no site oficial.'
      : 'Profissional coletado apenas para o relatório da Cidade Parceira.';

    if (aceitaSite && autorizaMensagem && whatsappCadastro) {
      mensagem += whatsappCadastro.status === 'erro'
        ? ' O cadastro foi salvo, mas o WhatsApp não foi enviado. Verifique a configuração da API.'
        : ' Mensagem de WhatsApp enviada para o profissional completar o perfil.';
    }

    res.status(201).json({
      mensagem,
      coleta: coletaParaFrontend(coleta.rows[0]),
      publicadoNoSite: Boolean(profissionalPublicado),
      whatsappMensagem: whatsappCadastro ? {
        id: Number(whatsappCadastro.id),
        status: whatsappCadastro.status,
        erro: whatsappCadastro.erro || ''
      } : null,
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
    const coletorResult = await pool.query('SELECT * FROM cidade_coletores WHERE id=$1 LIMIT 1', [req.coletorCidade.id]);
    const coletor = coletorResult.rows[0] || {};

    if (!dadosPagamentoColetorCompletos(coletor)) {
      return res.status(400).json({ erro: 'Antes de solicitar saque, preencha seus dados Pix: nome completo, CPF/CNPJ, tipo de chave e chave Pix.' });
    }

    const pendente = await pool.query(`
      SELECT id FROM cidade_saques_coletores
      WHERE coletor_id=$1 AND status='aguardando'
      LIMIT 1
    `, [req.coletorCidade.id]);

    if (pendente.rowCount > 0) {
      return res.status(400).json({ erro: 'Já existe uma solicitação de saque aguardando análise.' });
    }

    const elegiveis = await pool.query(`
      SELECT id
      FROM cidade_coleta_profissionais
      WHERE coletor_id=$1
        AND saque_coletor_id IS NULL
      ORDER BY criado_em ASC
    `, [req.coletorCidade.id]);

    const cadastrosDisponiveis = elegiveis.rowCount;
    const valorCalculado = cadastrosDisponiveis * valorPorCadastro;

    if (valorCalculado < CIDADE_COMISSAO_META_SAQUE) {
      const faltam = Math.ceil((CIDADE_COMISSAO_META_SAQUE - valorCalculado) / Math.max(valorPorCadastro, 1));
      return res.status(400).json({ erro: `O saque só é liberado ao completar ${CIDADE_COMISSAO_META_SAQUE.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. Faltam ${faltam} cadastro(s).` });
    }

    const dataRef = await pool.query(`SELECT (now() AT TIME ZONE 'America/Sao_Paulo')::date AS data_ref`);
    const dataReferencia = dataRef.rows[0].data_ref;

    const result = await pool.query(`
      INSERT INTO cidade_saques_coletores (
        coletor_id, valor, cadastros_contados, data_referencia, status,
        pix_nome_titular, pix_cpf_cnpj, pix_tipo_chave, pix_chave, banco_nome,
        metodo_pagamento, status_transacao
      )
      VALUES ($1,$2,$3,$4,'aguardando',$5,$6,$7,$8,$9,'pix_manual_admin','aguardando_admin')
      RETURNING *
    `, [
      req.coletorCidade.id,
      valorCalculado,
      cadastrosDisponiveis,
      dataReferencia,
      coletor.pix_nome_titular,
      coletor.pix_cpf_cnpj,
      coletor.pix_tipo_chave,
      coletor.pix_chave,
      coletor.banco_nome || null
    ]);

    const saqueId = result.rows[0].id;
    const ids = elegiveis.rows.map((r) => Number(r.id)).filter(Boolean);
    if (ids.length) {
      await pool.query(`
        UPDATE cidade_coleta_profissionais
        SET saque_coletor_id=$1, atualizado_em=NOW()
        WHERE id = ANY($2::bigint[])
      `, [saqueId, ids]);
    }

    res.status(201).json({
      mensagem: 'Solicitação de saque enviada para o Painel Admin. Os cadastros foram reservados para análise e pagamento.',
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
    await garantirSistemaCidadeParceira();
    const senhaAutorizacao = String(req.body.senhaAutorizacao || '').trim();
    if (CIDADE_SAQUE_ADMIN_PIN && senhaAutorizacao !== CIDADE_SAQUE_ADMIN_PIN) {
      return res.status(403).json({ erro: 'Senha de autorização do pagamento incorreta.' });
    }

    const observacao = String(req.body.observacao || 'Pagamento Pix confirmado pelo Admin.').trim();
    const result = await pool.query(`
      UPDATE cidade_saques_coletores
      SET status='pago',
          observacao_admin=$1,
          pago_em=NOW(),
          pago_por_admin_id=$2,
          metodo_pagamento=COALESCE(metodo_pagamento, 'pix_manual_admin'),
          status_transacao='pagamento_confirmado',
          atualizado_em=NOW()
      WHERE id=$3 AND status='aguardando'
      RETURNING *
    `, [observacao, req.adminUser?.id || null, req.params.id]);

    if (result.rowCount === 0) return res.status(404).json({ erro: 'Saque não encontrado ou já finalizado.' });

    await registrarAuditoria(req, 'cidade_saque_coletor_pago', { saqueId: Number(req.params.id), observacao });
    res.json({ mensagem: 'Saque marcado como pago. Na próxima etapa, este botão será ligado ao Pix automático da Efí.', saque: saqueColetorParaFrontend(result.rows[0]) });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao marcar saque como pago.', detalhe: error.message });
  }
});

app.patch('/api/admin/cidade/saques/:id/recusar', autenticarAdmin, async (req, res) => {
  try {
    await garantirSistemaCidadeParceira();
    const observacao = String(req.body.observacao || 'Recusado após avaliação dos cadastros.').trim();
    const result = await pool.query(`
      UPDATE cidade_saques_coletores
      SET status='recusado',
          observacao_admin=$1,
          status_transacao='recusado_admin',
          atualizado_em=NOW()
      WHERE id=$2 AND status='aguardando'
      RETURNING *
    `, [observacao, req.params.id]);

    if (result.rowCount === 0) return res.status(404).json({ erro: 'Saque não encontrado ou já finalizado.' });

    await pool.query(`
      UPDATE cidade_coleta_profissionais
      SET saque_coletor_id=NULL, atualizado_em=NOW()
      WHERE saque_coletor_id=$1
    `, [req.params.id]);

    await registrarAuditoria(req, 'cidade_saque_coletor_recusado', { saqueId: Number(req.params.id), observacao });
    res.json({ mensagem: 'Saque recusado. Os cadastros foram liberados para nova solicitação.', saque: saqueColetorParaFrontend(result.rows[0]) });
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
