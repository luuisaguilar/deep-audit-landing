-- Migración para Expansión Estructural del Contexto (Graph-Augmented RAG)

-- Esta función permite "caminar" por el grafo de conocimiento (nodos y aristas)
-- partiendo de los resultados iniciales de la búsqueda para encontrar contexto relacionado.

CREATE OR REPLACE FUNCTION expand_search_context(
  base_source_paths TEXT[],
  max_hops INT DEFAULT 1,
  limit_per_hop INT DEFAULT 5
)
RETURNS TABLE (
  source_path TEXT,
  source_title TEXT,
  content TEXT,
  hop_distance INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE graph_walk AS (
    -- Semillas iniciales (Anclas de la búsqueda híbrida)
    SELECT 
      kn.id, 
      kn.file_path,
      0 as hop
    FROM knowledge_nodes kn
    WHERE kn.file_path = ANY(base_source_paths)

    UNION ALL

    -- Expansión por aristas (bidireccional)
    SELECT 
      next_node.id,
      next_node.file_path,
      gw.hop + 1
    FROM graph_walk gw
    JOIN knowledge_edges ke ON (ke.source_id = gw.id OR ke.target_id = gw.id)
    JOIN knowledge_nodes next_node ON (
      next_node.id = CASE 
        WHEN ke.source_id = gw.id THEN ke.target_id 
        ELSE ke.source_id 
      END
    )
    WHERE gw.hop < max_hops
      -- Evitar ciclos infinitos
      AND next_node.file_path != gw.file_path
  )
  -- Recuperar los fragmentos de conocimiento de los nodos vecinos
  -- Filtramos para no repetir el contenido de las anclas originales (hop > 0)
  SELECT 
    dc.source_path,
    dc.source_title,
    dc.content,
    MIN(gw.hop) as hop_distance
  FROM (SELECT DISTINCT id, file_path, hop FROM graph_walk WHERE hop > 0) gw
  JOIN document_chunks dc ON dc.source_path = gw.file_path
  GROUP BY dc.source_path, dc.source_title, dc.content
  ORDER BY hop_distance ASC
  LIMIT limit_per_hop * max_hops;
END;
$$;
