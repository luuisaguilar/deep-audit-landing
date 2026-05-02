# Roadmap — Deep Audit Knowledge Engine

**Última actualización: 2 de Mayo 2026**

---

## Fases completadas

### Fase 0 — Infraestructura base ✅
- LXC 126 en Proxmox con Docker Compose
- 5 contenedores: landing, app, api, nginx, cloudflared
- Cloudflare Tunnel → knowledge.luisaguilaraguila.com
- Supabase con pgvector, RLS, multi-tenant

### Fase 1 — Autenticación y seguridad ✅
- Supabase Auth (email/password)
- Middleware Next.js protegiendo `/dashboard/*`
- `createBrowserClient` cookie-based (fix del loop 307)
- Forgot password con `resetPasswordForEmail`
- `/auth/reset` page (PASSWORD_RECOVERY flow)

### Fase 2 — Dashboard completo ✅
- 11 páginas de agentes en el dashboard
- Sidebar con 3 secciones y 12 items
- FastAPI con endpoints para todos los agentes
- Analytics conectado a Supabase real

### Fase 3 — Sprint 1: Nada engaña al usuario ✅
- CTAs de landing conectados a `/auth`
- OAuth handlers implementados (Google + GitHub)
- `resetSent` y `signupConfirm` states — forms se ocultan correctamente
- Botones "Ver todo" enlazados a `/dashboard/analytics`
- `autocomplete` y `minLength` en todos los inputs de auth

---

## En curso / Próximo

### Sprint 2 — Mobile no está roto 🚧
**Objetivo**: El dashboard debe ser usable en 375px.

- [ ] Sidebar → drawer deslizable en mobile (`hidden lg:flex` + hamburger)
- [ ] Touch targets mínimo 44px en todos los interactivos
- [ ] `text-[9px]` / `text-[10px]` → `text-xs` mínimo
- [ ] Landing navbar → hamburger menu en mobile
- [ ] `overflow-x: hidden` en body para prevenir scroll horizontal

### Sprint 3 — Los datos son reales 📋
**Objetivo**: Eliminar todo el mock data visible al usuario.

- [ ] Dashboard overview stats → query Supabase `ingestions` (count, sum tokens)
- [ ] Overview "Actividad Reciente" → `ingestions ORDER BY processed_at DESC LIMIT 3`
- [ ] YouTube historial → `ingestions WHERE source_type='youtube'`
- [ ] RSS feeds → `GET /rss/feeds` endpoint (crear) + estado local
- [ ] RSS delete → `POST /rss/remove-feed` + actualizar lista
- [ ] Vault page → redirect a `/dashboard/sync` o eliminar
- [ ] DashboardLayout → avatar con inicial del email del usuario
- [ ] DashboardLayout → badge de plan desde `user_metadata`
- [ ] Topbar search → redirigir a `/dashboard/search` al escribir + Enter

### Sprint 4 — Limpieza 📋
- [ ] Eliminar `simulateLogs()` en DocGrab, reemplazar con mensaje async claro
- [ ] `select` Profundidad en DocGrab → pasar `depth` al request de la API
- [ ] `/dashboard/vault` → `redirect('/dashboard/sync')`
- [ ] Focus states en todos los botones y links (`focus-visible:ring-2`)
- [ ] Empty states con ilustración + CTA en páginas sin historial
- [ ] `fn cn()` duplicada en `dashboard/page.tsx` → importar desde `@/lib/utils`

---

## Backlog futuro (sin fecha)

### Features de producto
- [ ] **Topbar search funcional** — búsqueda RAG inline con dropdown de resultados
- [ ] **Notificaciones realtime** — cuando un agente termina de procesar, mostrar toast
- [ ] **Historial real por agente** — cada página muestra sus últimas ingestas desde Supabase
- [ ] **Settings page** (`/dashboard/settings`) — cambiar nombre, email, password, plan
- [ ] **Daily Briefing** — n8n + Telegram con resumen diario del vault
- [ ] **Deep Sync con Syncthing** — sincronización bidireccional con Obsidian local
- [ ] **Knowledge Map funcional** — grafo 3D alimentado por datos reales de `document_chunks`
- [ ] **DocGrab depth selector** — pasar nivel de profundidad al backend

### Infra / DevOps
- [ ] **CI/CD automático** — GitHub Actions → SSH → git pull + rebuild en LXC 126
- [ ] **Streaming de logs** — SSE desde FastAPI para DocGrab y audio (reemplaza simulateLogs)
- [ ] **Monitoreo** — Uptime Kuma o similar para alertas si cae algún contenedor
- [ ] **Backup automático de Supabase** — dump semanal a storage local

### Agentes nuevos (roadmap largo plazo)
- [ ] **PDF Ingestor** — procesar PDFs subidos directamente
- [ ] **Telegram Bot** — ingesta desde conversaciones de Telegram
- [ ] **Podcast auto-ingestion** — suscribirse a feeds RSS de audio
- [ ] **NotebookLM → Podcast** — generar audio de los packs generados
