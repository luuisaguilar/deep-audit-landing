# Handoff — Deep Audit Knowledge Engine

**Ultima actualizacion: 2 de Mayo 2026 — post sesion 4**
**Sprint actual: Sprint 4 — Limpieza (en curso)**

---

## Estado en una linea

El sistema esta en produccion en `knowledge.luisaguilaraguila.com`. Sprints 1, 2 y 3 completos. Todo el mock data ha sido eliminado — el dashboard muestra datos reales de Supabase. Sprint 4 en curso: 2 de 10 items completos (DocGrab limpio), 8 pendientes de limpieza menor.

---

## Lo que funciona hoy (produccion)

| Componente | Estado | Notas |
|---|---|---|
| Landing page | OK | CTAs -> /auth, "Ver demo" -> #beneficios, "Contactar" -> email |
| Auth email/password | OK | Cookie-based con @supabase/ssr |
| Auth OAuth Google/GitHub | Codigo listo | Requiere activar providers en Supabase Dashboard |
| /auth/reset (password recovery) | OK | Evento PASSWORD_RECOVERY de onAuthStateChange |
| Dashboard sidebar | OK | Mobile drawer + hamburger + Escape + scroll lock |
| 11 paginas de agentes | OK | Formularios funcionales, historial real desde Supabase |
| Overview dashboard | OK | Stats reales + actividad reciente desde ingestions |
| Analytics page | OK | Datos reales + search con filtro por ?q= |
| Topbar search | OK | router.push a /analytics?q=, filtrado client-side |
| RSS feeds | OK | GET /rss/feeds, POST add-feed, POST remove-feed |
| Badge de plan | OK | user.user_metadata?.plan o "FREE" |
| DocGrab | OK | Logs honestos, sin fake data, boton "Nueva tarea" |
| FastAPI backend | OK | Endpoints para todos los agentes |
| Supabase (ingestions + pgvector) | OK | Migracion v1, RLS activo |
| Cloudflare Tunnel | OK | 4 conexiones activas |
| Nginx reverse proxy | OK | /, /app, /api, /analyze, /search, /rss, /sync |

---

## Lo que esta pendiente (Sprint 4 — limpieza menor)

| # | Item | Archivo | Fix |
|---|---|---|---|
| S4-3 | Select "Profundidad" no pasa depth al API | dashboard/docgrab/page.tsx | Pasar depth en body del fetch + endpoint API |
| S4-4 | /dashboard/vault sin uso | dashboard/vault/page.tsx | redirect('/dashboard/sync') |
| S4-5 | Landing navbar sin hamburger en mobile | src/app/page.tsx | hidden md:flex en nav links + boton hamburger |
| S4-6 | EmptyState repetido en cada pagina | multiple paginas | Crear src/components/EmptyState.tsx |
| S4-7 | fn cn() duplicada | dashboard/page.tsx | Importar desde @/lib/utils |
| S4-8 | "Settings" en sidebar sin destino | DashboardLayout.tsx | Crear /dashboard/settings o deshabilitar |
| S4-9 | Stats de /sync/obsidian siempre 0 | api.py | sync_all_to_obsidian() debe retornar conteo real |
| S4-10 | overflow-x en landing a 375px | src/app/page.tsx | overflow-x: hidden en main |

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
| `NEXT_PUBLIC_API_URL=""` (vacio) en produccion | Nginx proxea las rutas relativas `/analyze/*` al contenedor FastAPI. Fallback `"http://localhost:8000"` rompe produccion. |
| `user_id` en todas las tablas | Multi-tenant desde inicio. RLS filtra por auth.uid(). |
| `GitBranch` en vez de `Github` | lucide-react instalada no exporta `Github`. Build falla si se usa. |
| Comillas rectas en JSX | Turbopack (Next.js 16) rechaza curly quotes U+201C/U+201D con "Unexpected character". |
| `[System.IO.File]::WriteAllText` en PowerShell | `Set-Content -Encoding utf8` en PS 5.1 corrompe caracteres espanoles. |
| `Suspense` wrapper en paginas con `useSearchParams` | Next.js App Router requiere Suspense boundary para useSearchParams en client components. |

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
