# Deep Audit Knowledge Engine

**Version 2.0 — Emerald Edition** | Desplegado en Proxmox LXC 126

Sistema de gestion semantica del conocimiento basado en agentes de IA. Transforma videos, repositorios, articulos, audio y feeds RSS en notas estructuradas almacenadas en Obsidian, consultables via RAG desde un dashboard web.

URL en produccion: **https://knowledge.luisaguilaraguila.com**

---

## Estado actual (2 Mayo 2026)

| Sprint | Estado | Descripcion |
|---|---|---|
| Sprint 1 — Nada engana al usuario | Completo | CTAs, OAuth, /auth/reset, confirmacion signup |
| Sprint 2 — Mobile no esta roto | Completo | Sidebar drawer, touch targets 44px, API URL, encoding |
| Sprint 3 — Datos reales | Pendiente | Mock data -> Supabase real en overview, YouTube, RSS |
| Sprint 4 — Limpieza | Pendiente | simulateLogs, vault redirect, focus states, empty states |

---

## Arquitectura

```
Internet
  +-- Cloudflare Tunnel (knowledge.luisaguilaraguila.com)
        +-- Nginx (puerto 80 en LXC 126)
              +-- /          -> Next.js Landing + Dashboard  (knowledge-landing :3000)
              +-- /app       -> Streamlit Admin UI           (knowledge-engine-app :8501)
              +-- /api       -> FastAPI Backend              (knowledge-engine-api :8000)
              +-- /analyze   -> FastAPI (agentes)
              +-- /search    -> FastAPI (RAG)
              +-- /rss       -> FastAPI (feeds)
              +-- /sync      -> FastAPI (Obsidian)

Supabase (Cloud)
  +-- Auth (email/password + OAuth Google/GitHub)
  +-- ingestions table       (historial: source_type, status, tokens, vault_path)
  +-- document_chunks table  (embeddings pgvector HNSW para RAG)

Obsidian Vault (montado en /mnt/obsidian-vault)
  +-- users/<user_id>/
        +-- 10_YouTube/, 20_GitHub/, 30_Web/
        +-- 40_Docs/, 50_Recetas/, 60_Audio/, 70_NotebookLM/
```

---

## Repos y Paths

| Componente | Repo local (Windows) | Path en LXC 126 |
|---|---|---|
| Frontend Next.js | `deep-audit-landing/` | `/opt/deep-audit-landing` |
| Backend Python + Compose | `Agentes Youtube/` | `/opt/deep-audit-knowledge-engine` |

---

## Stack tecnologico

| Capa | Tecnologia | Notas |
|---|---|---|
| Frontend | Next.js 16.2.4 (Turbopack) + React 19 | App Router, "use client" pages |
| Estilos | Tailwind CSS v4 | `glass`, `btn-emerald`, `emerald-text-gradient` |
| Autenticacion | Supabase Auth + `@supabase/ssr` | Cookie-based — NO localStorage |
| Base de datos | Supabase Postgres + pgvector | RLS activado, multi-tenant por user_id |
| Backend API | FastAPI + Uvicorn | Async, background tasks |
| Admin UI | Streamlit | Solo uso interno |
| IA | Google Gemini 2.0 Flash | Generacion + embeddings |
| Infra | Docker Compose + Nginx | 5 contenedores en LXC 126 |
| Tunnel | Cloudflare Zero Trust | Dashboard-managed, 4 conexiones |
| Vault | Obsidian Markdown | Bind mount desde host Proxmox |
| Iconos | lucide-react (v1.x) | Usar `GitBranch` NO `Github` |

---

## Agentes disponibles (11)

| Agente | Endpoint FastAPI | Ruta dashboard | source_type |
|---|---|---|---|
| YouTube Analysis | `POST /analyze/youtube` | `/dashboard/youtube` | `youtube` |
| GitHub Wiki | `POST /analyze/github` | `/dashboard/github` | `github` |
| Web Scraper | `POST /analyze/web` | `/dashboard/web` | `web` |
| Chef IA | `POST /analyze/chef` | `/dashboard/chef` | `chef` |
| RSS Monitor | `POST /rss/add-feed`, `POST /rss/fetch-all` | `/dashboard/rss` | `rss` |
| Audio Analyzer | `POST /analyze/audio` | `/dashboard/audio` | `audio` |
| DocGrab | `POST /analyze/docgrab` | `/dashboard/docgrab` | `docgrab` |
| Buscador RAG | `POST /search/rag` | `/dashboard/search` | — |
| NotebookLM Pack | `POST /analyze/notebooklm` | `/dashboard/notebooklm` | — |
| Vault Sync | `POST /sync/obsidian` | `/dashboard/sync` | — |
| Analytics | Supabase directo | `/dashboard/analytics` | — |

---

## Variables de entorno

### Frontend (`docker-compose.yml` build args, o `.env.local` en desarrollo)

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_API_URL=        # vacio en produccion — Nginx hace proxy a FastAPI
```

### Backend (`.env` en `/opt/deep-audit-knowledge-engine/`)

```env
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_KEY=<anon-key>
GEMINI_API_KEY=
GITHUB_TOKEN=
VAULT_PATH=/mnt/obsidian-vault
CLOUDFLARE_TUNNEL_TOKEN=
```

> Las variables `NEXT_PUBLIC_*` se hornean en el bundle en build-time.
> Cambiarlas requiere `docker-compose up -d --build landing`, no basta con restart.

---

## Flujo de deploy

```powershell
# 1. En Windows — push a GitHub
cd "C:\Users\luuis\Downloads\Proyectos\Agentes\deep-audit-landing"
git add -A
git commit -m "descripcion del cambio"
git push origin main
```

```bash
# 2. En LXC 126 — pull y rebuild
cd /opt/deep-audit-landing && git pull origin main
cd /opt/deep-audit-knowledge-engine && /usr/local/bin/docker-compose up -d --build landing
```

> `docker-compose` esta en `/usr/local/bin/` y no esta en PATH por defecto.
> Siempre usar la ruta completa o agregar al PATH: `echo 'export PATH=$PATH:/usr/local/bin' >> ~/.bashrc`

---

## Desarrollo local

```bash
cd deep-audit-landing
npm install
# Crear .env.local con las credenciales de Supabase
npm run dev          # http://localhost:3000
```

```bash
# Backend en paralelo
cd "Agentes Youtube"
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

---

## Gotchas criticos

| Problema | Causa | Solucion |
|---|---|---|
| Build falla con "Unexpected character" | Curly quotes U+201C/U+201D en JSX | Siempre usar comillas rectas `"`. Sanitizar con PowerShell `-replace [char]0x201C, '"'` |
| Caracteres corruptos `Â¡` / `Ã¡` | PowerShell 5.1 lee UTF-8 como CP1252 | Usar `[System.IO.File]::ReadAllText/WriteAllText` con `[System.Text.Encoding]::UTF8` |
| Loop 307 al hacer login | `createClient` de supabase-js usa localStorage | Usar `createBrowserClient` de `@supabase/ssr` |
| API URL falla en produccion | `process.env.NEXT_PUBLIC_API_URL \|\| "http://localhost:8000"` | Fallback siempre `\|\| ""` (URL relativa que Nginx proxea) |
| Icono `Github` no existe | lucide-react v1.x no tiene export `Github` | Usar `GitBranch` en su lugar |
| `docker-compose` not found | `/usr/local/bin` no esta en PATH del LXC | Usar `/usr/local/bin/docker-compose` o agregar al PATH |
| `&&` no funciona en PowerShell | PowerShell 5.1 no soporta pipeline chains | Usar `;` para secuencia sin verificar exit code |

---

## Schema de Supabase

```sql
-- Tabla principal de historial
CREATE TABLE ingestions (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id),
  source_type     TEXT,   -- youtube | github | web | chef | rss | audio | docgrab
  title           TEXT,
  source_url      TEXT,
  vault_path      TEXT,
  status          TEXT,   -- success | error
  prompt_tokens   INT,
  completion_tokens INT,
  processed_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (source_url, user_id)
);

-- Embeddings para RAG
CREATE TABLE document_chunks (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id),
  ingestion_id BIGINT REFERENCES ingestions(id),
  content     TEXT,
  embedding   vector(768),
  metadata    JSONB
);

-- RLS
ALTER TABLE ingestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
```

---

## Documentacion adicional

| Archivo | Contenido |
|---|---|
| `docs/HANDOFF.md` | Estado actual, decisiones de arquitectura, emergencias |
| `docs/ROADMAP.md` | Fases completadas y proximos sprints |
| `docs/BACKLOG.md` | Issues organizados por sprint con archivo:linea |
| `docs/RUNBOOK.md` | Comandos operativos, deploy, diagnostico |
| `docs/ARCHITECTURE.md` | Decisiones de diseno tecnico y sus razones |
| `docs/DESIGN.md` | Sistema de diseno: colores, componentes, clases |
| `docs/FINAL_EXECUTIVE_SUMMARY.md` | Vision general para stakeholders |

---

*Deep Audit — Transformando informacion dispersa en activos estrategicos.*
*Desarrollado por Luis & Antigravity AI — 2026*
