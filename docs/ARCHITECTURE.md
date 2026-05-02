# Arquitectura — Deep Audit Knowledge Engine

**Ultima actualizacion: 2 de Mayo 2026**

---

## Vision general

Deep Audit es un sistema multi-agente de gestion del conocimiento personal. El usuario ingresa fuentes (videos, repos, articulos, audio, feeds) a traves de un dashboard web. Cada fuente es procesada por un agente de IA (Gemini 2.0 Flash) que extrae, resume y estructura el contenido en notas Markdown guardadas en un Obsidian Vault. El contenido indexado es consultable via busqueda semantica RAG desde el mismo dashboard.

---

## Diagrama de componentes

```
[Usuario]
   |
   v
[Cloudflare Tunnel] knowledge.luisaguilaraguila.com
   |
   v
[Nginx reverse proxy] LXC 126, puerto 80
   |---  /             -> [Next.js 16 Frontend]  :3000
   |---  /app          -> [Streamlit Admin]       :8501
   |---  /analyze/*    -> [FastAPI Backend]       :8000
   |---  /search/*     -> [FastAPI Backend]       :8000
   |---  /rss/*        -> [FastAPI Backend]       :8000
   |---  /sync/*       -> [FastAPI Backend]       :8000

[Next.js Frontend]
   |--- Auth: Supabase Cloud (HTTPS)
   |--- Dashboard: llama a FastAPI via rutas relativas
   |--- Analytics: consulta Supabase directamente

[FastAPI Backend]
   |--- Gemini 2.0 Flash API (generacion + embeddings)
   |--- Supabase Cloud (escribe ingestions + document_chunks)
   |--- /mnt/obsidian-vault (escribe .md files)
   |--- GitHub API (para agente github)

[Supabase Cloud]
   |--- ingestions: historial de procesamiento
   |--- document_chunks: vectores pgvector (HNSW index)
   |--- Auth: sesiones de usuario

[Obsidian Vault] /mnt/obsidian-vault (bind mount desde host Proxmox)
   |--- users/<user_id>/10_YouTube/
   |--- users/<user_id>/20_GitHub/
   |--- ... etc
```

---

## Decisiones de arquitectura

### 1. Auth: createBrowserClient de @supabase/ssr (NO createClient)

**Decision**: Usar `createBrowserClient` de `@supabase/ssr` en `src/lib/supabase.ts`.

**Por que**: El middleware de Next.js (`middleware.ts`) lee la sesion desde cookies HTTP, no desde localStorage. Si se usa el `createClient` estandar de `supabase-js`, guarda la sesion en localStorage que el servidor no puede leer. Resultado: loop infinito de 307 redirect al intentar acceder a `/dashboard/*` despues de hacer login.

```typescript
// CORRECTO
import { createBrowserClient } from '@supabase/ssr'
export const supabase = createBrowserClient(url, key)

// MAL — causa loop 307
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(url, key)
```

---

### 2. NEXT_PUBLIC_* como build ARGs de Docker

**Decision**: Las variables de entorno del frontend se pasan como `--build-arg` en docker-compose.yml y se leen del mismo `.env` del backend.

**Por que**: Next.js incrusta las variables `NEXT_PUBLIC_*` en el bundle JavaScript en tiempo de compilacion (build-time). No pueden cambiarse en runtime sin rebuild. `docker-compose restart landing` NO actualiza estas variables; se requiere `docker-compose up -d --build landing`.

```yaml
# docker-compose.yml
services:
  landing:
    build:
      args:
        NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_KEY}
```

---

### 3. API URL vacia en produccion

**Decision**: `process.env.NEXT_PUBLIC_API_URL || ""` — el fallback es string vacio, no `"http://localhost:8000"`.

**Por que**: En produccion, el browser del usuario hace las peticiones a `knowledge.luisaguilaraguila.com`. Si el fallback fuera `localhost:8000`, el browser intentaria conectarse a localhost del USUARIO (que no tiene nada). Con string vacio, las rutas son relativas (`/analyze/youtube`) y Nginx las proxea al contenedor FastAPI dentro del LXC.

```
URL relativa: /analyze/youtube
-> Nginx recibe: GET /analyze/youtube
-> Nginx proxea a: knowledge-engine-api:8000/analyze/youtube
```

---

### 4. Multi-tenant con user_id en todas las tablas

**Decision**: Todas las tablas tienen columna `user_id UUID REFERENCES auth.users(id)` con RLS activado.

**Por que**: El sistema esta disenado para soportar multiples usuarios desde el inicio. Row Level Security en Supabase asegura que cada usuario solo puede ver sus propios datos sin necesidad de filtros manuales en el backend.

```sql
-- RLS policy (Supabase lo aplica automaticamente)
CREATE POLICY "users see own data" ON ingestions
  FOR ALL USING (auth.uid() = user_id);
```

---

### 5. Indice unico compuesto (source_url, user_id)

**Decision**: `UNIQUE (source_url, user_id)` en lugar de `UNIQUE (source_url)`.

**Por que**: Si el indice fuera solo `source_url`, el primer usuario que indexe una URL bloquearia a todos los demas de indexarla. Con el indice compuesto, cada usuario puede indexar cualquier URL independientemente.

---

### 6. Procesamiento async en FastAPI

**Decision**: Los endpoints de agentes responden inmediatamente con `{"status": "queued"}` y el procesamiento ocurre en background (`BackgroundTasks`).

**Por que**: Los agentes pueden tardar 30-120 segundos en procesar. Si el endpoint bloqueara, el cliente Next.js daria timeout y el usuario veria un error aunque el procesamiento fue exitoso. El patron async permite respuesta instantanea y el usuario puede ver el resultado en Analytics cuando termine.

---

### 7. Obsidian Vault como bind mount

**Decision**: El vault de Obsidian se monta como bind mount desde el host Proxmox al contenedor FastAPI.

**Por que**: El vault necesita ser accesible desde fuera del contenedor (el usuario lo sincroniza con su Obsidian local). Un bind mount permite que los archivos persistan aunque el contenedor se recree y que sean accesibles desde el host.

```yaml
# docker-compose.yml
volumes:
  - /mnt/obsidian-vault:/mnt/obsidian-vault
```

---

## Flujo de datos: ingesta de un video de YouTube

```
1. Usuario pega URL en /dashboard/youtube y presiona "Analizar Video"

2. Next.js hace POST /analyze/youtube con { url }
   - URL es relativa -> Nginx la recibe

3. Nginx proxea la request a FastAPI en :8000

4. FastAPI:
   a. Responde inmediatamente: {"status": "queued", "ingestion_id": 42}
   b. En background:
      - Descarga transcripcion del video (YouTube Data API o yt-dlp)
      - Llama a Gemini 2.0 Flash para analisis y resumen
      - Genera embeddings con Gemini Embedding
      - Escribe nota .md en /mnt/obsidian-vault/users/<uid>/10_YouTube/
      - Guarda en tabla ingestions: status, tokens, vault_path
      - Guarda chunks en document_chunks con embeddings

5. Next.js muestra mensaje de exito al usuario

6. En /dashboard/analytics, el usuario puede ver la ingesta completada
   - Query directo a Supabase desde el browser (no pasa por FastAPI)
```

---

## Flujo de datos: busqueda RAG

```
1. Usuario escribe query en /dashboard/search y presiona "Buscar"

2. Next.js hace POST /search/rag con { query, user_id }

3. FastAPI:
   a. Genera embedding del query con Gemini Embedding
   b. Llama a funcion RPC de Supabase: match_document_chunks(embedding, user_id, threshold, limit)
   c. Supabase ejecuta busqueda por similitud coseno en el indice HNSW
   d. Retorna los chunks mas relevantes
   e. FastAPI ensambla un contexto con los chunks
   f. Llama a Gemini 2.0 Flash con el contexto + query para generar respuesta
   g. Retorna { answer, sources }

4. Next.js muestra la respuesta con las fuentes citadas
```

---

## Schema de Supabase (completo)

```sql
-- Extension para embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Historial de procesamiento
CREATE TABLE ingestions (
  id                BIGSERIAL PRIMARY KEY,
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type       TEXT NOT NULL,     -- youtube|github|web|chef|rss|audio|docgrab
  title             TEXT,
  source_url        TEXT,
  vault_path        TEXT,              -- ruta relativa dentro del vault
  status            TEXT DEFAULT 'pending',  -- pending|success|error
  error_message     TEXT,
  prompt_tokens     INT DEFAULT 0,
  completion_tokens INT DEFAULT 0,
  processed_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (source_url, user_id)
);

-- Embeddings para RAG
CREATE TABLE document_chunks (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ingestion_id  BIGINT REFERENCES ingestions(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  embedding     vector(768),           -- dimension de Gemini text-embedding-004
  metadata      JSONB DEFAULT '{}'::jsonb
);

-- Indices
CREATE INDEX ON ingestions (user_id, processed_at DESC);
CREATE INDEX ON ingestions (source_type, user_id);
CREATE INDEX ON document_chunks USING hnsw (embedding vector_cosine_ops);

-- RLS
ALTER TABLE ingestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own ingestions" ON ingestions
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users see own chunks" ON document_chunks
  FOR ALL USING (auth.uid() = user_id);

-- Funcion RPC para busqueda semantica
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(768),
  filter_user_id  UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count     INT   DEFAULT 10
)
RETURNS TABLE (id BIGINT, content TEXT, metadata JSONB, similarity FLOAT)
LANGUAGE sql STABLE AS $$
  SELECT id, content, metadata,
         1 - (embedding <=> query_embedding) AS similarity
  FROM document_chunks
  WHERE user_id = filter_user_id
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```
