# Handoff — Deep Audit Knowledge Engine

**Ultima actualizacion: 2 de Mayo 2026**
**Sprint actual: Sprint 3 — Datos reales**

---

## Estado en una linea

El sistema esta desplegado en produccion en `knowledge.luisaguilaraguila.com`. Los Sprints 1 y 2 estan completos. El dashboard tiene 11 agentes funcionales. El unico pendiente bloqueante es reemplazar el mock data del overview, YouTube y RSS con datos reales de Supabase.

---

## Lo que funciona hoy (produccion)

| Componente | Estado | Notas |
|---|---|---|
| Landing page | OK | CTAs -> /auth, "Ver demo" -> #beneficios, "Contactar" -> email |
| Auth email/password | OK | Cookie-based con @supabase/ssr |
| Auth OAuth Google/GitHub | Codigo listo | Requiere activar providers en Supabase Dashboard |
| /auth/reset (password recovery) | OK | Evento PASSWORD_RECOVERY de onAuthStateChange |
| Dashboard sidebar | OK | Mobile drawer + hamburger + Escape + scroll lock |
| 11 paginas de agentes | OK | Todas las rutas responden, formularios funcionales |
| Analytics page | OK | Datos reales de Supabase ingestions |
| FastAPI backend | OK | Endpoints para todos los agentes |
| Supabase (ingestions + pgvector) | OK | Migracion v1 ejecutada, RLS activo |
| Cloudflare Tunnel | OK | 4 conexiones activas (qro01, dfw06 o similar) |
| Nginx reverse proxy | OK | /, /app, /api, /analyze, /search, /rss, /sync |

## Lo que aun es mock data (Sprint 3 — proximo)

| Pantalla | Mock data | Fix |
|---|---|---|
| Overview stats | "12,450", "458h", "1.2M", "3 agentes" | Query ingestions COUNT + SUM tokens |
| Overview "Actividad Reciente" | 3 items inventados | ingestions ORDER BY processed_at LIMIT 3 |
| YouTube historial | 3 items falsos | ingestions WHERE source_type='youtube' LIMIT 10 |
| RSS "Feeds Activos" | MOCK_FEEDS hardcodeado | GET /rss/feeds endpoint (crear) |
| Badge "PRO PLAN" | Hardcodeado | user.user_metadata?.plan |
| Overview "Active Agents" | Hardcodeado "3" | COUNT DISTINCT source_type en ingestions |

## Lo que esta pendiente (Sprint 4 — limpieza)

| Item | Archivo | Fix |
|---|---|---|
| simulateLogs() genera logs falsos | dashboard/docgrab/page.tsx | Eliminar, mostrar "Encolado" |
| "142 paginas detectadas" hardcodeado | dashboard/docgrab/page.tsx | Eliminar hasta tener dato real |
| /dashboard/vault sin uso | dashboard/vault/page.tsx | redirect('/dashboard/sync') |
| Topbar search sin funcionalidad | DashboardLayout.tsx | router.push('/dashboard/search?q='+query) |
| "Settings" sin pagina destino | DashboardLayout.tsx | Crear /dashboard/settings o deshabilitar |

---

## Arquitectura de contenedores (LXC 126)

```
5 contenedores en /opt/deep-audit-knowledge-engine/docker-compose.yml

knowledge-landing          Next.js 16.2.4 build         :3000
knowledge-engine-app       Streamlit admin UI            :8501
knowledge-engine-api       FastAPI + Uvicorn             :8000
knowledge-nginx            nginx:alpine reverse proxy    :80 (expuesto)
knowledge-engine-tunnel    cloudflare/cloudflared        -
```

### Paths en el LXC

```
/opt/deep-audit-knowledge-engine/    <- repo backend + docker-compose
  .env                               <- TODAS las secrets (NO en git)
  docker-compose.yml
  nginx.conf
  api.py                             <- FastAPI (todos los endpoints)
  app.py                             <- Streamlit

/opt/deep-audit-landing/             <- repo frontend Next.js
  src/app/dashboard/                 <- 12 paginas (11 agentes + overview)
  src/components/dashboard/
    DashboardLayout.tsx              <- sidebar + topbar (mobile responsive)
  src/app/auth/
    page.tsx                         <- login + signup + OAuth
    reset/page.tsx                   <- password recovery
  src/lib/supabase.ts                <- createBrowserClient (cookie-based)
  src/middleware.ts                  <- protege /dashboard/*

/usr/local/bin/docker-compose        <- docker-compose v1 (NO en PATH por defecto)

/mnt/obsidian-vault/                 <- vault montado
  users/<user_id>/
    10_YouTube/, 20_GitHub/, 30_Web/
    40_Docs/, 50_Recetas/, 60_Audio/, 70_NotebookLM/
```

---

## Decisiones de arquitectura criticas

| Decision | Por que |
|---|---|
| `createBrowserClient` de `@supabase/ssr` | El middleware lee cookies, no localStorage. `createClient` normal causa loop 307 al hacer login. |
| `NEXT_PUBLIC_*` como build ARGs de Docker | Se hornean en el bundle en build-time. Cambiarlos requiere rebuild, no restart. |
| `NEXT_PUBLIC_API_URL=""` (vacio) en produccion | Nginx proxea las rutas relativas `/analyze/*` al contenedor FastAPI. Fallback `"http://localhost:8000"` rompe produccion (el browser no puede llegar a localhost:8000). |
| `user_id` en todas las tablas | Multi-tenant desde inicio. RLS filtra por auth.uid(). |
| Indice unico `(source_url, user_id)` | `source_url` solo romperia si dos usuarios intentan indexar la misma URL. |
| `GitBranch` en vez de `Github` | lucide-react v1.x instalada no exporta `Github`. Build falla si se usa. |
| Comillas rectas en JSX | Turbopack (Next.js 16) rechaza curly quotes U+201C/U+201D con "Unexpected character". |
| `[System.IO.File]::WriteAllText` en PowerShell | `Set-Content -Encoding utf8` en PS 5.1 lee UTF-8 como CP1252 y re-codifica, corrompiendo caracteres espanoles. |

---

## Flujo de deploy

```powershell
# Windows — hacer cambios y pushear
cd "C:\Users\luuis\Downloads\Proyectos\Agentes\deep-audit-landing"
git add .
git commit -m "descripcion"
git push origin main
```

```bash
# LXC 126 — pull y rebuild
cd /opt/deep-audit-landing && git pull origin main
cd /opt/deep-audit-knowledge-engine && /usr/local/bin/docker-compose up -d --build landing
```

---

## Credenciales (ubicaciones, no valores)

| Recurso | Donde vive |
|---|---|
| Supabase URL + Anon Key | `/opt/deep-audit-knowledge-engine/.env` — SUPABASE_URL, SUPABASE_KEY |
| Gemini API Key | `/opt/deep-audit-knowledge-engine/.env` — GEMINI_API_KEY |
| GitHub Token | `/opt/deep-audit-knowledge-engine/.env` — GITHUB_TOKEN |
| Cloudflare Tunnel Token | `/opt/deep-audit-knowledge-engine/.env` — CLOUDFLARE_TUNNEL_TOKEN |
| Vault path | `/opt/deep-audit-knowledge-engine/.env` — VAULT_PATH |

---

## Comandos de emergencia

```bash
# Estado de todos los contenedores
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Logs en tiempo real
docker logs -f knowledge-landing
docker logs -f knowledge-engine-api --tail 50

# Reiniciar sin rebuild (para nginx, cloudflared)
/usr/local/bin/docker-compose restart nginx cloudflared

# Rebuild landing (cambios de codigo Next.js)
cd /opt/deep-audit-knowledge-engine
/usr/local/bin/docker-compose up -d --build landing

# Rebuild backend (cambios de Python)
/usr/local/bin/docker-compose up -d --build api app

# Rebuild todo
/usr/local/bin/docker-compose up -d --build

# Limpiar espacio (si el disco esta lleno)
docker system prune -af
```
