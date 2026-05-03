-- ==========================================
-- Seed Data - Dados de Teste
-- ==========================================

-- Popular 100 tokens de teste
DO $$
DECLARE
  i INT;
  token_str VARCHAR(10);
BEGIN
  FOR i IN 1..100 LOOP
    token_str := LPAD(i::TEXT, 5, '0');
    INSERT INTO cartoes (token, url_chip, status)
    VALUES (
      token_str,
      'https://vota.am/ativar/' || token_str,
      'ESTOQUE'
    )
    ON CONFLICT (token) DO NOTHING;
  END LOOP;
END $$;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ 100 tokens inseridos (00001 a 00100)';
  RAISE NOTICE '📝 Código secreto: CAND-AMAZONIA-2026';
  RAISE NOTICE '🔗 Use /ativar/00001 para testar';
END $$;
