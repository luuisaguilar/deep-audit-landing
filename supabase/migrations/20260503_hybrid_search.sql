-- Migración para Búsqueda Híbrida (Vector + FTS) con RRF

-- 1. Asegurar que la tabla document_chunks existe (basado en el uso en search_engine.py)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'document_chunks') THEN
        CREATE TABLE public.document_chunks (
            id BIGSERIAL PRIMARY KEY,
            user_id TEXT,
            source_path TEXT,
            source_title TEXT,
            content TEXT,
            embedding VECTOR(1536),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

-- 2. Agregar columna tsvector para búsqueda de texto completo si no existe
ALTER TABLE public.document_chunks ADD COLUMN IF NOT EXISTS fts_tokens tsvector;

-- 3. Crear el índice GIN para FTS
CREATE INDEX IF NOT EXISTS document_chunks_fts_idx ON public.document_chunks USING GIN (fts_tokens);

-- 4. Crear o reemplazar la función para actualizar fts_tokens
CREATE OR REPLACE FUNCTION document_chunks_fts_update() RETURNS trigger AS $$
BEGIN
  NEW.fts_tokens := to_tsvector('spanish', NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear el trigger para mantener fts_tokens actualizado
DROP TRIGGER IF EXISTS on_document_chunks_fts_update ON public.document_chunks;
CREATE TRIGGER on_document_chunks_fts_update
  BEFORE INSERT OR UPDATE ON public.document_chunks
  FOR EACH ROW EXECUTE PROCEDURE document_chunks_fts_update();

-- 6. Actualizar registros existentes
UPDATE public.document_chunks SET fts_tokens = to_tsvector('spanish', content) WHERE fts_tokens IS NULL;

-- 7. Función RPC para Búsqueda Híbrida con RRF
CREATE OR REPLACE FUNCTION hybrid_search_chunks(
  query_text TEXT,
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.2,
  match_count INT DEFAULT 10,
  filter_user_id TEXT DEFAULT NULL,
  rrf_k INT DEFAULT 60
)
RETURNS TABLE (
  id BIGINT,
  user_id TEXT,
  source_path TEXT,
  source_title TEXT,
  content TEXT,
  score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH vector_search AS (
    SELECT
      dc.id,
      ROW_NUMBER() OVER (ORDER BY dc.embedding <=> query_embedding) as rank
    FROM document_chunks dc
    WHERE (filter_user_id IS NULL OR dc.user_id = filter_user_id)
      AND (dc.embedding <=> query_embedding) < 1 - match_threshold
    LIMIT match_count * 2
  ),
  fts_search AS (
    SELECT
      dc.id,
      ROW_NUMBER() OVER (ORDER BY ts_rank_cd(dc.fts_tokens, websearch_to_tsquery('spanish', query_text)) DESC) as rank
    FROM document_chunks dc
    WHERE (filter_user_id IS NULL OR dc.user_id = filter_user_id)
      AND dc.fts_tokens @@ websearch_to_tsquery('spanish', query_text)
    LIMIT match_count * 2
  )
  SELECT
    dc.id,
    dc.user_id,
    dc.source_path,
    dc.source_title,
    dc.content,
    (COALESCE(1.0 / (rrf_k + vs.rank), 0.0) +
     COALESCE(1.0 / (rrf_k + fs.rank), 0.0))::FLOAT AS score
  FROM document_chunks dc
  LEFT JOIN vector_search vs ON dc.id = vs.id
  LEFT JOIN fts_search fs ON dc.id = fs.id
  WHERE vs.id IS NOT NULL OR fs.id IS NOT NULL
  ORDER BY score DESC
  LIMIT match_count;
END;
$$;
