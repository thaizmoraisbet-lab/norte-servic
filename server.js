require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'troque_essa_senha_em_producao';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'indica123';
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'norte-servic';

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

async function enviarImagemStorage(imagem, pasta, nomeBase) {
  if (!imagem) return '';

  // Compatibilidade com imagens antigas/salvas como URL.
  if (typeof imagem === 'string' && !imagem.startsWith('data:')) return imagem;

  const arquivo = dataUrlParaBuffer(imagem);
  if (!arquivo) return '';

  if (!storageConfigurado()) {
    // Fallback local/teste: se o Storage ainda não foi configurado, mantém Base64.
    return imagem;
  }

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
    const novaFoto = await enviarImagemStorage(fotoPerfil, pasta, 'foto-perfil');
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
      fotosTrabalhos.push(await enviarImagemStorage(foto, `${pasta}/trabalhos`, `servico-${i + 1}`));
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
