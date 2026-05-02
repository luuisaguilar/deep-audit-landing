# Handoff — Deep Audit Knowledge Engine

**Última actualización: 2 de Mayo 2026**

---

## Estado actual: Producción parcial

El sistema está desplegado y corriendo en **Proxmox LXC 126** con 5 contenedores Docker activos. El flujo completo funciona: login → dashboard → ingesta → indexación en pgvector → búsqueda RAG. El frontend tiene 11 páginas de agentes funcionales.

---

## Lo que está funcionando hoy

| Componente | Estado | Notas |
|---|---|---|
| Landing page | Producción | CTAs conectados a /auth (Sprint 1) |
| Auth (email/password) | Producción | Cookie-based con @supabase/ssr |
| Auth (OAuth Google/GitHub) | Código listo | Requiere configurar providers en Supabase Dashboard |
| `/auth/reset` (password recovery) | Producción | Página creada con evento PASSWORD_RECOVERY |
| Dashboard (11 agentes) | Producción | Todas las rutas funcionales |
| FastAPI backend | Producción | Endpoints para todos los agentes |
| Supabase (ingestions + pgvector) | Producción | Migración v1 ejecutada |
| Cloudflare Tunnel | Producción | knowledge.luisaguilaraguila.com activo con 4 conexiones |
| Nginx reverse proxy | Producción | Enruta /, /app, /api |

## Lo que está pendiente (no bloqueante)

| Item | Sprint | Prioridad |
|---|---|---|
| Sidebar responsive (mobile) | Sprint 2 | Alta |
| Touch targets mínimo 44px | Sprint 2 | Alta |
| Mock data → Supabase real (overview, youtube history, vault) | Sprint 3 | Alta |
| RSS feed desde API real (endpoint GET /rss/feeds pendiente) | Sprint 3 | Media |
| `/dashboard/vault` redirect a `/dashboard/sync` | Sprint 4 | Baja |
| `simulateLogs` en DocGrab eliminado | Sprint 4 | Baja |
| OAuth providers configurados en Supabase | Configuración | Media |

---

## Arquitectura de contenedores (LXC 126)

```
/opt/deep-audit-knowledge-engine/
├── docker-compose.yml          ← orquestador de todo
├── .env                        ← todas las secrets
├── nginx.conf                  ← routing /, /app, /api
├── api.py                      ← FastAPI (todos los endpoints)
├── app.py                      ← Streamlit admin UI
└── core/, *.py                 ← agentes individuales

/opt/deep-audit-landing/
├── Dockerfile                  ← build con ARGs de Supabase
└── src/
    ├── app/
    │   ├── page.tsx            ← landing
    │   ├── auth/page.tsx       ← login + signup
    │   ├── auth/reset/page.tsx ← recuperación de contraseña ← NUEVO
    │   └── dashboard/          ← 11 páginas de agentes
    ├── components/dashboard/
    │   └── DashboardLayout.tsx ← sidebar + topbar
    ├── lib/supabase.ts         ← createBrowserClient (cookie-based)
    └── middleware.ts           ← protege /dashboard/*
```

---

## Decisiones de arquitectura importantes

| Decisión | Por qué |
|---|---|
| `createBrowserClient` de `@supabase/ssr` (no `createClient`) | El middleware lee cookies, no localStorage. Usar `createClient` causa loop 307. |
| `NEXT_PUBLIC_*` como ARGs de Docker | Las vars NEXT_PUBLIC se hornean en el bundle en build time. No se pueden cambiar en runtime. |
| `docker-compose up -d --build` (no `restart`) | `restart` no recrea el contenedor y no recarga env vars nuevas. |
| `NEXT_PUBLIC_API_URL=""` vacío en producción | Nginx hace proxy de `/api` al contenedor FastAPI. El frontend llama a rutas relativas. |
| `user_id` en todas las tablas de Supabase | Multi-tenant desde el inicio. RLS filtra por `auth.uid()`. |
| Índice único compuesto `(source_url, user_id)` | `source_url` solo rompía multi-tenant (un usuario no podía procesar una URL que otro ya procesó). |

---

## Credenciales y accesos (ubicaciones, no valores)

| Recurso | Dónde están |
|---|---|
| Supabase URL + Anon Key | `/opt/deep-audit-knowledge-engine/.env` (SUPABASE_URL, SUPABASE_KEY) |
| Gemini API Key | `/opt/deep-audit-knowledge-engine/.env` (GEMINI_API_KEY) |
| GitHub Token | `/opt/deep-audit-knowledge-engine/.env` (GITHUB_TOKEN) |
| Cloudflare Tunnel Token | `/opt/deep-audit-knowledge-engine/.env` (CLOUDFLARE_TUNNEL_TOKEN) |
| Vault path | `/opt/deep-audit-knowledge-engine/.env` (VAULT_PATH) |

---

## Comandos críticos de emergencia

```bash
# Ver estado de todos los contenedores
cd /opt/deep-audit-knowledge-engine
docker ps

# Ver logs de un contenedor
docker logs knowledge-landing --tail 50
docker logs knowledge-engine-api --tail 50

# Reiniciar un servicio (sin rebuild)
docker-compose restart landing

# Rebuild completo con cambios de código
docker-compose up -d --build landing    # solo frontend
docker-compose up -d --build api app    # solo backend

# Espacio en disco (si hay problemas de build)
docker system prune -af
```
