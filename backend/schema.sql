-- ==========================================
-- Schema Completo - Sistema NFC
-- Baseado no Planejamento.html
-- ==========================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- TABELA: cartoes
-- Inventário físico de cada chip NFC
-- ==========================================
CREATE TABLE IF NOT EXISTS cartoes (
  token             VARCHAR(10) PRIMARY KEY,
  url_chip          VARCHAR(60) NOT NULL,
  status            VARCHAR(20) DEFAULT 'ESTOQUE' CHECK (status IN ('ESTOQUE', 'DISTRIBUIDO', 'ATIVO', 'PERDIDO')),
  pessoa_id         VARCHAR(10),
  distribuido_para  VARCHAR(10),
  criado_em         TIMESTAMPTZ DEFAULT NOW(),
  ativado_em        TIMESTAMPTZ
);

CREATE INDEX idx_cartoes_status ON cartoes(status);
CREATE INDEX idx_cartoes_pessoa ON cartoes(pessoa_id);

COMMENT ON TABLE cartoes IS 'Inventário de cartões NFC físicos';
COMMENT ON COLUMN cartoes.token IS 'Token único do cartão (00001 a 99999)';
COMMENT ON COLUMN cartoes.status IS 'Estado atual: ESTOQUE, DISTRIBUIDO, ATIVO, PERDIDO';

-- ==========================================
-- TABELA: pessoas
-- Todos os membros da rede (Cabeça/Liderança/Ativista)
-- ==========================================
CREATE TABLE IF NOT EXISTS pessoas (
  id              VARCHAR(10) PRIMARY KEY,
  cargo           VARCHAR(12) NOT NULL CHECK (cargo IN ('CABECA', 'LIDERANCA', 'ATIVISTA')),
  nome            VARCHAR(120) NOT NULL,
  cpf             VARCHAR(14) UNIQUE NOT NULL,
  email           VARCHAR(120),
  telefone        VARCHAR(20),
  endereco        TEXT,
  zona_eleitoral  VARCHAR(80),
  recrutador_id   VARCHAR(10) REFERENCES pessoas(id),
  cabeca_id       VARCHAR(10) REFERENCES pessoas(id),
  token_cartao    VARCHAR(10) REFERENCES cartoes(token),
  ativo           BOOLEAN DEFAULT TRUE,
  criado_em       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pessoas_cargo ON pessoas(cargo);
CREATE INDEX idx_pessoas_recrutador ON pessoas(recrutador_id);
CREATE INDEX idx_pessoas_cabeca ON pessoas(cabeca_id);
CREATE INDEX idx_pessoas_cpf ON pessoas(cpf);

COMMENT ON TABLE pessoas IS 'Membros da rede hierárquica';
COMMENT ON COLUMN pessoas.id IS 'ID único: C##### (Cabeça), L##### (Liderança), A##### (Ativista)';
COMMENT ON COLUMN pessoas.cabeca_id IS 'ID do Cabeça no topo da hierarquia (para queries rápidas)';

-- ==========================================
-- TABELA: eventos
-- Todas as aproximações e compartilhamentos
-- ==========================================
CREATE TABLE IF NOT EXISTS eventos (
  id            BIGSERIAL PRIMARY KEY,
  tipo          VARCHAR(20) NOT NULL CHECK (tipo IN ('APROXIMACAO', 'COMPARTILHAMENTO', 'CADASTRO')),
  pessoa_id     VARCHAR(10) REFERENCES pessoas(id),
  token_cartao  VARCHAR(10) REFERENCES cartoes(token),
  canal         VARCHAR(20),
  latitude      DECIMAL(9,6),
  longitude     DECIMAL(9,6),
  geo_ponto     GEOGRAPHY(POINT, 4326),
  gps_ok        BOOLEAN DEFAULT FALSE,
  ip_hash       VARCHAR(64),
  user_agent    TEXT,
  url           TEXT,
  criado_em     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_eventos_pessoa ON eventos(pessoa_id, tipo);
CREATE INDEX idx_eventos_tipo ON eventos(tipo);
CREATE INDEX idx_eventos_data ON eventos(criado_em DESC);
CREATE INDEX idx_eventos_geo ON eventos USING GIST(geo_ponto);

COMMENT ON TABLE eventos IS 'Registro de todas as interações (aproximações e compartilhamentos)';
COMMENT ON COLUMN eventos.tipo IS 'APROXIMACAO: toque no cartão NFC | COMPARTILHAMENTO: clique em botão de compartilhar';
COMMENT ON COLUMN eventos.geo_ponto IS 'Ponto geográfico PostGIS para queries espaciais';

-- ==========================================
-- VIEW: vw_performance
-- Métricas agregadas por pessoa
-- ==========================================
CREATE OR REPLACE VIEW vw_performance AS
SELECT
  p.id,
  p.nome,
  p.cargo,
  p.recrutador_id,
  p.cabeca_id,
  p.criado_em,
  COUNT(CASE WHEN e.tipo = 'APROXIMACAO' THEN 1 END) AS aproximacoes,
  COUNT(CASE WHEN e.tipo = 'COMPARTILHAMENTO' THEN 1 END) AS compartilhamentos,
  (SELECT COUNT(*) FROM pessoas p2 WHERE p2.recrutador_id = p.id) AS recrutados,
  MAX(e.criado_em) AS ultima_atividade
FROM pessoas p
LEFT JOIN eventos e ON e.pessoa_id = p.id
GROUP BY p.id;

COMMENT ON VIEW vw_performance IS 'Métricas consolidadas por pessoa para dashboards';

-- ==========================================
-- Função auxiliar: atualizar geo_ponto
-- ==========================================
CREATE OR REPLACE FUNCTION atualizar_geo_ponto()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geo_ponto := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_eventos_geo
  BEFORE INSERT OR UPDATE ON eventos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_geo_ponto();

COMMENT ON FUNCTION atualizar_geo_ponto IS 'Trigger para popular geo_ponto automaticamente';

-- ==========================================
-- Constraint: Ativista não pode recrutar
-- ==========================================
CREATE OR REPLACE FUNCTION validar_recrutador()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.recrutador_id IS NOT NULL THEN
    IF (SELECT cargo FROM pessoas WHERE id = NEW.recrutador_id) = 'ATIVISTA' THEN
      RAISE EXCEPTION 'Ativistas não podem recrutar outras pessoas';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pessoas_recrutador
  BEFORE INSERT OR UPDATE ON pessoas
  FOR EACH ROW
  EXECUTE FUNCTION validar_recrutador();

-- ==========================================
-- FIM DO SCHEMA
-- ==========================================
