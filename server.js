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

// Integração Pix Efí Bank
const EFI_AMBIENTE = (process.env.EFI_AMBIENTE || 'homologacao').toLowerCase();
const EFI_CLIENT_ID = process.env.EFI_CLIENT_ID || '';
const EFI_CLIENT_SECRET = process.env.EFI_CLIENT_SECRET || '';
const EFI_PIX_KEY = process.env.EFI_PIX_KEY || '';
const EFI_CERT_BASE64 = process.env.EFI_CERT_BASE64 || '';
const EFI_CERT_PASSWORD = process.env.EFI_CERT_PASSWORD || '';
const EFI_WEBHOOK_SECRET = process.env.EFI_WEBHOOK_SECRET || '';
const EFI_PIX_EXPIRACAO = Number(process.env.EFI_PIX_EXPIRACAO || 3600);
const EFI_BASE_URL = EFI_AMBIENTE === 'producao'
  ? 'https://pix.api.efipay.com.br'
  : 'https://pix-h.api.efipay.com.br';

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
          const detalhe = json?.mensagem || json?.message || json?.erro || respostaTexto || `HTTP ${resposta.statusCode}`;
          return reject(new Error(`Erro Efí: ${detalhe}`));
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

  const resposta = await efiRequest('POST', '/oauth/token', { grant_type: 'client_credentials' });
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

async function ativarPlanoPorPagamento(pagamento, raw = {}) {
  if (!pagamento || pagamento.status === 'pago') return pagamento;

  const planoKey = pagamento.plano_key || pagamento.plano;
  const plano = PLANOS_EFI[planoKey];
  if (!plano) throw new Error('Plano do pagamento não encontrado.');

  const vencimento = new Date();
  vencimento.setDate(vencimento.getDate() + Number(plano.dias || 30));

  await pool.query('BEGIN');
  try {
    const pagamentoAtualizado = await pool.query(
      `UPDATE pagamentos
       SET status='pago', pago_em=NOW(), raw_retorno=$1, atualizado_em=NOW()
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
    return ativarPlanoPorPagamento(pagamento, cobranca);
  }

  await pool.query(
    `UPDATE pagamentos
     SET raw_retorno=$1, atualizado_em=NOW()
     WHERE id=$2`,
    [cobranca, pagamento.id]
  );

  return { ...pagamento, status_efi: cobranca?.status || '' };
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
    const blocoGrande = Math.max(7, Math.round(largura * 0.012));
    const blocoMedio = Math.max(6, Math.round(largura * 0.010));
    const blocoSelo = Math.max(3.2, largura * 0.0052);

    const marcaDiagonal = [
      `<g transform="translate(${largura * 0.02}, ${altura * 0.16}) rotate(-35)">${textoBlocoSvgNorteServic('NORTE SERVIC', 0, 0, blocoGrande, { opacity: 0.34, fill: '#ffffff' })}</g>`,
      `<g transform="translate(${largura * 0.30}, ${altura * 0.34}) rotate(-35)">${textoBlocoSvgNorteServic('NORTE SERVIC', 0, 0, blocoMedio, { opacity: 0.30, fill: '#ffffff' })}</g>`,
      `<g transform="translate(${largura * 0.05}, ${altura * 0.58}) rotate(-35)">${textoBlocoSvgNorteServic('NORTE SERVIC', 0, 0, blocoGrande, { opacity: 0.32, fill: '#ffffff' })}</g>`,
      `<g transform="translate(${largura * 0.34}, ${altura * 0.78}) rotate(-35)">${textoBlocoSvgNorteServic('NORTE SERVIC', 0, 0, blocoMedio, { opacity: 0.28, fill: '#ffffff' })}</g>`
    ].join('');

    const seloX = largura * 0.54;
    const seloY = altura * 0.875;
    const seloW = largura * 0.40;
    const seloH = altura * 0.065;
    const seloTexto = textoBlocoSvgNorteServic('NORTE SERVIC', seloX + largura * 0.035, seloY + altura * 0.022, blocoSelo, {
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
        <g filter="url(#shadow)">
          ${marcaDiagonal}
        </g>
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

    const existe = await pool.query('SELECT id FROM profissionais WHERE whatsapp = $1', [whatsapp]);

    if (existe.rowCount > 0) {
      return res.status(409).json({ erro: 'Esse WhatsApp já possui cadastro.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const imagens = await processarImagensProfissional(dados, `profissionais/${whatsapp}`);

    const result = await pool.query(
      `INSERT INTO profissionais (
        nome, email, senha_hash, tipo_profissional, categoria, profissao, servicos,
        palavras_chave, cidade, bairro, atende_outras_cidades, cidades_atendidas,
        forma_atendimento, whatsapp, instagram, descricao, foto_perfil, fotos_trabalhos,
        status, verificado, plano_atual, plano_status
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16,$17,$18::jsonb,
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
        JSON.stringify(imagens.fotosTrabalhos || [])
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


app.post('/api/pagamentos/efi/criar', autenticarProfissional, async (req, res) => {
  try {
    if (!efiConfigurado()) {
      return res.status(500).json({ erro: 'Integração Efí ainda não configurada no servidor.' });
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
       (profissional_id, plano_key, plano_nome, valor, status, txid)
       VALUES ($1, $2, $3, $4, 'aguardando', $5)
       RETURNING *`,
      [req.profissional.id, planoKey, plano.nome, plano.valor, txid]
    );

    const pagamento = insertPagamento.rows[0];

    try {
      const efi = await criarCobrancaPixEfi({ txid, plano, profissional: profissional.rows[0] });
      const pixCopiaCola = efi.qrcode?.qrcode || efi.cobranca?.pixCopiaECola || '';
      const qrCodeImagem = efi.qrcode?.imagemQrcode || '';

      const atualizado = await pool.query(
        `UPDATE pagamentos
         SET loc_id=$1,
             pix_copia_cola=$2,
             qr_code_imagem=$3,
             raw_retorno=$4,
             atualizado_em=NOW()
         WHERE id=$5
         RETURNING *`,
        [efi.locId, pixCopiaCola, qrCodeImagem, { cobranca: efi.cobranca, qrcode: efi.qrcode }, pagamento.id]
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
       LIMIT 100`
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
