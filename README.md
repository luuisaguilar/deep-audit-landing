# Deep Audit Knowledge Engine

**Version 2.0 — Emerald Edition** | Desplegado en Proxmox LXC 126

Sistema de gestión semántica del conocimiento basado en agentes de IA. Transforma videos, repositorios, artículos, audio y feeds RSS en notas estructuradas almacenadas en Obsidian, consultables vía RAG desde un dashboard web.

---

## Arquitectura General

```
Internet
  └── Cloudflare Tunnel (knowledge.luisaguilaraguila.com)
        └── Nginx (puerto 80 en LXC 126)
              ├── /          → Next.js Landing + Dashboard  (knowledge-landing)
              ├── /app       → Streamlit Admin UI           (knowledge-engine-app)
              └── /api       → FastAPI Backend              (knowledge-engine-api)

Supabase (Cloud)
  ├── Auth (email + OAuth)
  ├── ingestions table       (historial de procesamiento)
  └── document_chunks table  (embeddings pgvector para RAG)

Obsidian Vault (montado en /mnt/obsidian-vault)
  └── Notas generadas por agentes en carpetas por tipo
```

## Repos y Paths

| Componente | Repo local | Path en LXC 126 |
|---|---|---|
| Frontend (Next.js) | `deep-audit-landing/` | `/opt/deep-audit-landing` |
| Backend (Python + Compose) | `Agentes Youtube/` | `/opt/deep-audit-knowledge-engine` |

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS v4 |
| Autenticación | Supabase Auth + `@supabase/ssr` (cookie-based) |
| Base de datos | Supabase (Postgres + pgvector) |
| Backend API | FastAPI + Uvicorn |
| Admin UI | Streamlit |
| IA | Google Gemini 2.0 Flash (generación + embeddings) |
| Infra | Docker Compose, Nginx, Cloudflare Tunnel |
| Vault | Obsidian Markdown |

## Agentes Disponibles

| Agente | Endpoint FastAPI | Dashboard route |
|---|---|---|
| YouTube Analysis | `POST /analyze/youtube` | `/dashboard/youtube` |
| GitHub Wiki | `POST /analyze/github` | `/dashboard/github` |
| Web Scraper | `POST /analyze/web` | `/dashboard/web` |
| Chef IA | `POST /analyze/chef` | `/dashboard/chef` |
| RSS Monitor | `POST /rss/add-feed` | `/dashboard/rss` |
| Audio Analyzer | `POST /analyze/audio` | `/dashboard/audio` |
| DocGrab | `POST /analyze/docgrab` | `/dashboard/docgrab` |
| Buscador RAG | `POST /search/rag` | `/dashboard/search` |
| NotebookLM Pack | `POST /analyze/notebooklm` | `/dashboard/notebooklm` |
| Vault Sync | `POST /sync/obsidian` | `/dashboard/sync` |
| Analytics | Supabase directo | `/dashboard/analytics` |

## Inicio Rápido — Desarrollo Local

```bash
# 1. Instalar dependencias
cd deep-audit-landing
npm install

# 2. Configurar variables de entorno
cp .env.local.example .env.local
# Editar con credenciales reales de Supabase

# 3. Correr en desarrollo
npm run dev          # http://localhost:3000

# 4. Backend Python (en otra terminal)
cd "Agentes Youtube"
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

## Variables de Entorno Requeridas

### Frontend (`.env.local` o build args en Docker)
```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_API_URL=                    # vacío = relativo (Nginx hace proxy)
```

### Backend (`.env` en `/opt/deep-audit-knowledge-engine/`)
```env
GEMINI_API_KEY=
GITHUB_TOKEN=
SUPABASE_URL=
SUPABASE_KEY=
VAULT_PATH=/mnt/obsidian-vault
CLOUDFLARE_TUNNEL_TOKEN=
```

## Migraciones Supabase

El archivo `docs/supabase_migration_v1.sql` contiene el schema completo:
- Tabla `ingestions` con RLS y multi-tenant por `user_id`
- Tabla `document_chunks` con extensión pgvector (HNSW index)
- Función RPC `match_document_chunks` para búsqueda semántica
- Índice único compuesto `(source_url, user_id)` para deduplicación

Para ejecutar: copiar y pegar en el SQL Editor de Supabase Dashboard.

---

*Desarrollado por Luis & Antigravity AI — 2026*
