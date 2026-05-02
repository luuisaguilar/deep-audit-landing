# Runbook Operativo — Deep Audit Knowledge Engine

**Última actualización: 2 de Mayo 2026**

---

## Infraestructura

| Item | Valor |
|---|---|
| Host | Proxmox PVE |
| LXC | 126 — `app-knowledge` |
| IP LXC | (ver Proxmox dashboard) |
| Dominio público | `knowledge.luisaguilaraguila.com` |
| Tunnel | Cloudflare Zero Trust (dashboard-managed) |
| OS del LXC | Debian/Ubuntu |
| Docker Compose | `/opt/deep-audit-knowledge-engine/docker-compose.yml` |

## Contenedores Docker

| Nombre | Imagen | Función | Puerto interno |
|---|---|---|---|
| `knowledge-landing` | Next.js 15 build | Frontend + Dashboard | 3000 |
| `knowledge-engine-app` | Python/Streamlit | Admin UI (poder usuario) | 8501 |
| `knowledge-engine-api` | Python/FastAPI | Backend REST para agentes | 8000 |
| `knowledge-nginx` | nginx:alpine | Reverse proxy + routing | 80 (expuesto) |
| `knowledge-engine-tunnel` | cloudflare/cloudflared | Túnel al exterior | — |

## Paths importantes en el LXC

```
/opt/deep-audit-knowledge-engine/    ← repo del backend + docker-compose
├── .env                             ← TODAS las secrets (nunca en git)
├── docker-compose.yml
├── nginx.conf
├── api.py                           ← FastAPI (todos los endpoints)
├── app.py                           ← Streamlit
└── core/

/opt/deep-audit-landing/             ← repo del frontend Next.js
└── src/

/mnt/obsidian-vault/                 ← Vault montado (bind mount desde host)
└── users/<user_id>/                 ← aislamiento por usuario
    ├── 10_YouTube/
    ├── 20_GitHub/
    ├── 30_Web/
    ├── 40_Docs/
    ├── 50_Recetas/
    ├── 60_Audio/
    └── 70_NotebookLM/
```

---

## Flujo de actualización de código

### Opción A — Con Git configurado en el LXC (recomendado)

```bash
# Acceder al LXC
ssh root@<IP-LXC>
# o desde el host Proxmox:
pct enter 126

# Actualizar frontend
cd /opt/deep-audit-landing
git pull origin main
cd /opt/deep-audit-knowledge-engine
docker-compose up -d --build landing

# Actualizar backend
cd /opt/deep-audit-knowledge-engine
git pull origin main
docker-compose up -d --build api app
```

### Opción B — Sin Git (rsync desde Windows)

Abrir PowerShell en tu máquina local:

```powershell
# Sincronizar frontend (cambios de código src/)
rsync -avz --exclude="node_modules" --exclude=".next" `
  "C:/Users/luuis/Downloads/Proyectos/Agentes/deep-audit-landing/" `
  root@<IP-LXC>:/opt/deep-audit-landing/

# Sincronizar backend
rsync -avz --exclude="venv" --exclude="__pycache__" `
  "C:/Users/luuis/Downloads/Proyectos/Agentes/Agentes Youtube/" `
  root@<IP-LXC>:/opt/deep-audit-knowledge-engine/

# Luego en el LXC, rebuild:
# docker-compose up -d --build landing
# docker-compose up -d --build api app
```

### Opción C — Configurar Git en el LXC (hacer una sola vez)

```bash
# En el LXC
cd /opt/deep-audit-landing
git init
git remote add origin https://github.com/<tu-usuario>/deep-audit-landing.git
git pull origin main

cd /opt/deep-audit-knowledge-engine
git init
git remote add origin https://github.com/<tu-usuario>/agentes-youtube.git
git pull origin main
```

Después de esto, Opción A funciona directamente.

---

## Rebuild de contenedores

```bash
cd /opt/deep-audit-knowledge-engine

# Rebuild solo landing (cambios de Next.js)
docker-compose up -d --build landing

# Rebuild solo backend (cambios de Python)
docker-compose up -d --build api app

# Rebuild todo
docker-compose up -d --build

# Ver logs en tiempo real
docker logs -f knowledge-landing
docker logs -f knowledge-engine-api
docker logs -f knowledge-engine-app

# Reiniciar sin rebuild (solo para cambios de config/env que ya están en .env)
# NOTA: para cambios de NEXT_PUBLIC_* se necesita rebuild, no restart
docker-compose restart nginx
docker-compose restart cloudflared
```

---

## Gestión del .env

El archivo `/opt/deep-audit-knowledge-engine/.env` contiene todas las variables:

```env
# Supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_KEY=<anon-key>

# Gemini
GEMINI_API_KEY=

# GitHub (para agente de repos)
GITHUB_TOKEN=

# Obsidian Vault
VAULT_PATH=/mnt/obsidian-vault

# Cloudflare Tunnel
CLOUDFLARE_TUNNEL_TOKEN=
```

**Importante**: Las variables `NEXT_PUBLIC_*` del landing se pasan como build ARGs en docker-compose.yml — se leen de este mismo `.env` como `SUPABASE_URL` y `SUPABASE_KEY`.

Para cambiar credenciales de Supabase:
```bash
# 1. Editar .env
nano /opt/deep-audit-knowledge-engine/.env

# 2. Rebuild obligatorio (no basta con restart)
docker-compose up -d --build landing
```

---

## Supabase

### Ejecutar migraciones

1. Abrir [app.supabase.com](https://app.supabase.com)
2. Ir al proyecto → SQL Editor
3. Copiar y pegar el contenido de `docs/supabase_migration_v1.sql`
4. Ejecutar

### Verificar tablas creadas

```sql
-- En Supabase SQL Editor
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Verificar función RPC
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'match_document_chunks';
```

### Ver últimas ingestas

```sql
SELECT source_type, title, status, processed_at
FROM ingestions
ORDER BY processed_at DESC
LIMIT 20;
```

---

## Cloudflare Tunnel

- El túnel es **dashboard-managed** (creado desde Zero Trust UI, no por CLI).
- El token vive en `.env` como `CLOUDFLARE_TUNNEL_TOKEN`.
- Para verificar estado: [one.dash.cloudflare.com](https://one.dash.cloudflare.com) → Networks → Tunnels → knowledge-engine.
- El contenedor `cloudflared` debe mostrar 4 conexiones activas (qro01, dfw06 o similar).

Si el túnel cae:
```bash
docker-compose restart cloudflared
docker logs knowledge-engine-tunnel --tail 20
```

---

## Diagnóstico rápido

```bash
# ¿Todos los contenedores corriendo?
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# ¿El frontend responde?
curl -s http://localhost/health || curl -s http://localhost | head -5

# ¿El backend responde?
curl -s http://localhost/api/health

# ¿Espacio en disco?
df -h /
docker system df

# Limpiar imágenes viejas sin eliminar contenedores activos
docker image prune -f
```

## Situaciones conocidas y soluciones

| Problema | Causa | Solución |
|---|---|---|
| `docker compose` dice "unknown flag -d" | Plugin v2 no instalado | Usar `docker-compose` (v1) o reinstalar plugin v2 |
| Landing muestra credenciales placeholder | `NEXT_PUBLIC_*` no se actualizaron en build | `docker-compose up -d --build landing` (no restart) |
| Dashboard loop 307 tras login | `createClient` de supabase-js (localStorage) en supabase.ts | Verificar que usa `createBrowserClient` de `@supabase/ssr` |
| Build falla por "no space left" | Disco lleno por imágenes antiguas | `docker system prune -af` y rebuildar |
| Tunnel "locally configured" no aparece en dashboard | Creado por CLI, no por UI | Eliminar tunnel de CLI, recrear desde Zero Trust Dashboard |
| `docker-compose up` no encuentra el compose v2 | `/usr/local/bin/docker-compose` fue eliminado | Reinstalar: `curl -SL https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose && chmod +x /usr/local/lib/docker/cli-plugins/docker-compose` |
