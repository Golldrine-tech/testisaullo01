import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = process.env.MOCK_PORT || 3001;

// Pool de conexão PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

// Middleware
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ==================== WEBHOOKS ====================

/**
 * GET /webhook/verificar-token?token=XXXXX
 */
app.get('/webhook/verificar-token', async (req, res) => {
  const { token } = req.query;
  console.log(`📍 Verificando token: ${token}`);

  try {
    const result = await pool.query(
      'SELECT status, pessoa_id FROM cartoes WHERE token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      console.log(`❌ Token ${token} não existe`);
      return res.status(404).json({ erro: 'Cartão inválido ou não reconhecido.' });
    }

    const cartao = result.rows[0];

    if (cartao.status === 'ATIVO' && cartao.pessoa_id) {
      const pessoaResult = await pool.query(
        'SELECT id, nome FROM pessoas WHERE id = $1',
        [cartao.pessoa_id]
      );
      const pessoa = pessoaResult.rows[0];
      console.log(`✅ Cartão ${token} configurado para ${pessoa.nome}`);
      return res.json({
        acao: 'redirecionar_lp',
        pessoa_id: pessoa.id,
        nome: pessoa.nome
      });
    }

    console.log(`📝 Cartão ${token} disponível para cadastro`);
    res.json({ acao: 'mostrar_formulario' });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

/**
 * POST /webhook/cadastrar
 */
app.post('/webhook/cadastrar', async (req, res) => {
  const {
    token,
    id_recrutador,
    cargo_esperado,
    nome,
    cpf,
    email,
    zona_eleitoral,
    telefone,
    endereco,
    latitude,
    longitude,
    gps_ok
  } = req.body;

  console.log(`\n📝 Novo cadastro: ${nome} (${cargo_esperado})`);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Validar token
    const cartaoResult = await client.query(
      'SELECT status FROM cartoes WHERE token = $1',
      [token]
    );

    if (cartaoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.json({ erro: 'Token inválido' });
    }

    if (cartaoResult.rows[0].status === 'ATIVO') {
      await client.query('ROLLBACK');
      return res.json({ erro: 'Cartão já ativado' });
    }

    // Verificar CPF duplicado
    const cpfCheck = await client.query(
      'SELECT id FROM pessoas WHERE cpf = $1',
      [cpf]
    );

    if (cpfCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      console.log(`❌ CPF ${cpf} já cadastrado`);
      return res.json({ erro: 'CPF já cadastrado' });
    }

    // Resolver cargo e hierarquia
    let cargo, recrutador_id = null, cabeca_id = null;

    if (id_recrutador === process.env.CODIGO_CANDIDATO) {
      cargo = 'CABECA';
      console.log(`👑 Cadastrando CABEÇA`);
    } else if (/^C\d{5}$/.test(id_recrutador)) {
      const recrutadorResult = await client.query(
        'SELECT id, cargo FROM pessoas WHERE id = $1',
        [id_recrutador]
      );
      if (recrutadorResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.json({ erro: 'Recrutador não encontrado' });
      }
      cargo = 'LIDERANCA';
      recrutador_id = id_recrutador;
      cabeca_id = id_recrutador;
      console.log(`🎖️ Cadastrando LIDERANÇA sob ${id_recrutador}`);
    } else if (/^L\d{5}$/.test(id_recrutador)) {
      const recrutadorResult = await client.query(
        'SELECT id, cabeca_id FROM pessoas WHERE id = $1',
        [id_recrutador]
      );
      if (recrutadorResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.json({ erro: 'Recrutador não encontrado' });
      }
      cargo = 'ATIVISTA';
      recrutador_id = id_recrutador;
      cabeca_id = recrutadorResult.rows[0].cabeca_id;
      console.log(`👤 Cadastrando ATIVISTA sob ${id_recrutador}`);
    } else {
      await client.query('ROLLBACK');
      return res.json({ erro: 'Recrutador inválido ou sem permissão' });
    }

    // Gerar ID
    const cpfDigits = cpf.replace(/\D/g, '').substring(0, 5);
    const prefixo = { 'CABECA': 'C', 'LIDERANCA': 'L', 'ATIVISTA': 'A' }[cargo];
    const id_gerado = prefixo + cpfDigits;

    // Inserir pessoa
    await client.query(
      `INSERT INTO pessoas (id, cargo, nome, cpf, email, telefone, endereco, zona_eleitoral, recrutador_id, cabeca_id, token_cartao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [id_gerado, cargo, nome, cpf, email, telefone, endereco, zona_eleitoral, recrutador_id, cabeca_id, token]
    );

    // Atualizar cartão
    await client.query(
      `UPDATE cartoes SET status = 'ATIVO', pessoa_id = $1, ativado_em = NOW() WHERE token = $2`,
      [id_gerado, token]
    );

    // Registrar evento de cadastro
    await client.query(
      `INSERT INTO eventos (tipo, pessoa_id, token_cartao, canal, latitude, longitude, gps_ok)
       VALUES ('CADASTRO', $1, $2, 'WEB', $3, $4, $5)`,
      [id_gerado, token, latitude, longitude, gps_ok]
    );

    await client.query('COMMIT');

    console.log(`✅ Cadastro concluído: ${id_gerado} - ${nome}`);

    res.json({
      sucesso: true,
      id_gerado,
      cargo,
      nome
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao cadastrar:', error);
    res.json({ erro: error.message });
  } finally {
    client.release();
  }
});

/**
 * POST /webhook/evento
 */
app.post('/webhook/evento', async (req, res) => {
  const { tipo, pessoa_id, canal, latitude, longitude, gps_ok, url, user_agent } = req.body;

  const emoji = tipo === 'APROXIMACAO' ? '👋' : '📤';
  console.log(`${emoji} ${tipo} - pessoa_id: ${pessoa_id || 'N/A'} - canal: ${canal || 'N/A'}`);

  try {
    await pool.query(
      `INSERT INTO eventos (tipo, pessoa_id, canal, latitude, longitude, gps_ok, url, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [tipo, pessoa_id, canal, latitude, longitude, gps_ok, url, user_agent]
    );
    res.status(200).end();
  } catch (error) {
    console.error('Erro ao registrar evento:', error);
    res.status(200).end(); // Fire-and-forget
  }
});

// ==================== DEBUG ENDPOINTS ====================

app.get('/debug/pessoas', async (req, res) => {
  const result = await pool.query('SELECT * FROM vw_performance ORDER BY cargo, criado_em');
  res.json(result.rows);
});

app.get('/debug/eventos', async (req, res) => {
  const result = await pool.query('SELECT * FROM eventos ORDER BY criado_em DESC LIMIT 100');
  res.json(result.rows);
});

app.get('/debug/hierarquia/:cabeca_id', async (req, res) => {
  const { cabeca_id } = req.params;
  const result = await pool.query(
    'SELECT * FROM vw_performance WHERE cabeca_id = $1 OR id = $1 ORDER BY cargo',
    [cabeca_id]
  );
  res.json(result.rows);
});

// ==================== LGPD ====================

/**
 * DELETE /webhook/minha-conta
 * Remove todos os dados pessoais de uma pessoa (LGPD art. 18)
 */
app.delete('/webhook/minha-conta', async (req, res) => {
  const { pessoa_id } = req.body;
  if (!pessoa_id) return res.status(400).json({ erro: 'pessoa_id obrigatório' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM eventos WHERE pessoa_id = $1', [pessoa_id]);
    await client.query(
      "UPDATE cartoes SET pessoa_id = NULL, status = 'ESTOQUE', ativado_em = NULL WHERE pessoa_id = $1",
      [pessoa_id]
    );
    await client.query('DELETE FROM pessoas WHERE id = $1', [pessoa_id]);
    await client.query('COMMIT');
    console.log(`🗑️ Dados excluídos para: ${pessoa_id}`);
    res.json({ sucesso: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao excluir dados:', error);
    res.status(500).json({ erro: 'Erro ao excluir dados' });
  } finally {
    client.release();
  }
});

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
  console.log(`\n🚀 Backend rodando em http://localhost:${PORT}`);
  console.log(`📊 Conectado ao PostgreSQL em ${process.env.DB_HOST}`);
  console.log(`\n📚 Endpoints:`);
  console.log(`   GET  /webhook/verificar-token?token=XXXXX`);
  console.log(`   POST /webhook/cadastrar`);
  console.log(`   POST /webhook/evento`);
  console.log(`\n🔧 Debug:`);
  console.log(`   GET /debug/pessoas`);
  console.log(`   GET /debug/eventos`);
  console.log(`   GET /debug/hierarquia/:cabeca_id\n`);
});
