# Runbook Operativo — Deep Audit Knowledge Engine

**Ultima actualizacion: 2 de Mayo 2026**

---

## Infraestructura

| Item | Valor |
|---|---|
| Host | Proxmox PVE |
| LXC | 126 — app-knowledge |
| Dominio publico | knowledge.luisaguilaraguila.com |
| Tunnel | Cloudflare Zero Trust (dashboard-managed) |
| Docker Compose | /opt/deep-audit-knowledge-engine/docker-compose.yml |
| docker-compose bin | /usr/local/bin/docker-compose (NO esta en PATH por defecto) |

---

## Contenedores Docker

| Nombre | Imagen base | Funcion | Puerto interno |
|---|---|---|---|
| knowledge-landing | Next.js 16.2.4 build | Frontend + Dashboard | 3000 |
| knowledge-engine-app | Python/Streamlit | Admin UI | 8501 |
| knowledge-engine-api | Python/FastAPI | Backend REST | 8000 |
| knowledge-nginx | nginx:alpine | Reverse proxy | 80 (expuesto) |
| knowledge-engine-tunnel | cloudflare/cloudflared | Tunel exterior | — |

### Routing de Nginx

```
/ y /dashboard    -> knowledge-landing:3000
/app              -> knowledge-engine-app:8501
/api              -> knowledge-engine-api:8000
/analyze/*        -> knowledge-engine-api:8000
/search/*         -> knowledge-engine-api:8000
/rss/*            -> knowledge-engine-api:8000
/sync/*           -> knowledge-engine-api:8000
```

---

## Paths importantes

```
/opt/deep-audit-knowledge-engine/    <- repo backend + docker-compose (raiz)
  .env                               <- TODAS las secrets (NUNCA en git)
  docker-compose.yml                 <- orquestador de los 5 contenedores
  nginx.conf                         <- routing del reverse proxy
  api.py                             <- FastAPI (todos los endpoints)
  app.py                             <- Streamlit
  core/                              <- logica de agentes individuales

/opt/deep-audit-landing/             <- repo frontend Next.js
  src/
    app/
      page.tsx                       <- landing publica
      auth/page.tsx                  <- login + signup + OAuth
      auth/reset/page.tsx            <- recuperacion de contrasena
      dashboard/
        page.tsx                     <- overview del dashboard
        analytics/page.tsx           <- unica pagina 100% conectada a Supabase
        youtube/page.tsx
        github/page.tsx
        web/page.tsx
        chef/page.tsx
        rss/page.tsx
        audio/page.tsx
        docgrab/page.tsx
        search/page.tsx
        notebooklm/page.tsx
        sync/page.tsx
        vault/page.tsx               <- pagina huerfana, redirigir a /sync (Sprint 4)
    components/dashboard/
      DashboardLayout.tsx            <- sidebar responsive + topbar
    lib/supabase.ts                  <- createBrowserClient (cookie-based)
    middleware.ts                    <- protege /dashboard/*

/usr/local/bin/docker-compose        <- docker-compose v1
/mnt/obsidian-vault/                 <- vault montado como bind mount
```

---

## Flujo de actualizacion de codigo

### Frontend (mas frecuente)

```powershell
# Windows — hacer cambios, luego:
cd "C:\Users\luuis\Downloads\Proyectos\Agentes\deep-audit-landing"
git add .
git commit -m "descripcion del cambio"
git push origin main
```

```bash
# LXC — pull y rebuild del contenedor landing
cd /opt/deep-audit-landing && git pull origin main
cd /opt/deep-audit-knowledge-engine
/usr/local/bin/docker-compose up -d --build landing
```

### Backend (cambios en api.py o agentes Python)

```bash
# LXC
cd /opt/deep-audit-knowledge-engine
git pull origin main   # si el backend tiene su propio repo
/usr/local/bin/docker-compose up -d --build api app
```

### Ambos a la vez

```bash
cd /opt/deep-audit-knowledge-engine
/usr/local/bin/docker-compose up -d --build
```

---

## Rebuild vs restart

| Cambio | Accion correcta |
|---|---|
| Codigo Next.js (src/) | `docker-compose up -d --build landing` |
| Variables NEXT_PUBLIC_* | `docker-compose up -d --build landing` (rebuild obligatorio) |
| Codigo Python (api.py, core/) | `docker-compose up -d --build api app` |
| nginx.conf | `docker-compose restart nginx` |
| .env (vars no-NEXT_PUBLIC) | `docker-compose up -d --build api app` |
| Cloudflare tunnel token | `docker-compose restart cloudflared` |

> IMPORTANTE: `docker-compose restart landing` NO recarga las variables NEXT_PUBLIC_*.
> Las vars NEXT_PUBLIC se hornean en el bundle JS en build-time. Siempre hacer rebuild.

---

## Gestion del .env

Ubicacion: `/opt/deep-audit-knowledge-engine/.env`

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

Las vars del frontend se pasan como build ARGs en docker-compose.yml y deben llamarse `SUPABASE_URL` y `SUPABASE_KEY` en el .env (el compose las mapea a `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en el build).

---

## Comandos de diagnostico

```bash
# Estado de todos los contenedores
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Logs en tiempo real
docker logs -f knowledge-landing
docker logs -f knowledge-engine-api --tail 50
docker logs -f knowledge-nginx --tail 20

# Probar que el frontend responde
curl -s -o /dev/null -w "%{http_code}" http://localhost/

# Probar que el backend responde
curl -s http://localhost/api/health || curl -s http://localhost:8000/health

# Espacio en disco
df -h /
docker system df

# Limpiar imagenes viejas (sin eliminar contenedores activos)
docker image prune -f

# Limpiar TODO (CUIDADO: elimina contenedores parados e imagenes)
docker system prune -af
```

---

## Supabase

### Ver ultimas ingestas

```sql
-- En Supabase SQL Editor
SELECT source_type, title, status, processed_at
FROM ingestions
ORDER BY processed_at DESC
LIMIT 20;
```

### Stats de uso

```sql
SELECT
  source_type,
  COUNT(*) as total,
  SUM(prompt_tokens + completion_tokens) as tokens
FROM ingestions
GROUP BY source_type
ORDER BY total DESC;
```

### Verificar tablas y funciones

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'match_document_chunks';
```

---

## Cloudflare Tunnel

- El tunel es dashboard-managed (Zero Trust UI, no CLI).
- Token en `.env` como `CLOUDFLARE_TUNNEL_TOKEN`.
- Verificar estado: one.dash.cloudflare.com -> Networks -> Tunnels -> knowledge-engine
- Deben aparecer 4 conexiones activas.

```bash
# Si el tunel cae:
/usr/local/bin/docker-compose restart cloudflared
docker logs knowledge-engine-tunnel --tail 20
```

---

## PATH permanente en LXC

`docker-compose` esta en `/usr/local/bin/` que no esta en PATH por defecto:

```bash
# Agregar permanentemente (hacer una vez):
echo 'export PATH=$PATH:/usr/local/bin' >> ~/.bashrc
source ~/.bashrc

# Verificar:
docker-compose --version
```

---

## Situaciones conocidas

| Problema | Causa | Solucion |
|---|---|---|
| `docker-compose: command not found` | /usr/local/bin no en PATH | Usar `/usr/local/bin/docker-compose` o agregar al PATH en ~/.bashrc |
| Build falla "Unexpected character" | Curly quotes U+201C/U+201D en JSX | Sanitizar con PowerShell: `-replace [char]0x201C, '"' -replace [char]0x201D, '"'` |
| Caracteres espanoles corruptos en codigo | PowerShell 5.1 lee UTF-8 como CP1252 | Usar `[System.IO.File]::WriteAllText(path, content, UTF8)` |
| Loop 307 tras login | createClient de supabase-js en supabase.ts | Verificar que usa createBrowserClient de @supabase/ssr |
| Dashboard muestra credenciales placeholder | NEXT_PUBLIC_* no actualizadas en build | `docker-compose up -d --build landing` (no restart) |
| API URL falla en produccion | Fallback a "http://localhost:8000" | Cambiar fallback a "" en todos los fetch |
| Icono Github no encontrado en build | lucide-react v1.x no exporta Github | Reemplazar con GitBranch en todos los archivos |
| "No space left on device" durante build | Disco lleno por imagenes antiguas | `docker system prune -af && docker-compose up -d --build landing` |
| Tunel "locally configured" no visible en dashboard | Creado por CLI no por UI | Eliminar tunnel de CLI, recrear desde Zero Trust Dashboard |
| PowerShell && falla | PS 5.1 no soporta pipeline chains | Usar `;` para secuencia o comandos separados |
