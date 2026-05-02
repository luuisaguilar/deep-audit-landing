# Roadmap — Deep Audit Knowledge Engine

**Ultima actualizacion: 2 de Mayo 2026**

---

## Fases completadas

### Fase 0 — Infraestructura base (Completo)
- LXC 126 en Proxmox con Docker Compose (5 contenedores)
- Cloudflare Tunnel dashboard-managed -> knowledge.luisaguilaraguila.com
- Nginx reverse proxy: /, /app, /api, /analyze, /search, /rss, /sync
- Supabase con pgvector, RLS multi-tenant, funcion RPC match_document_chunks

### Fase 1 — Autenticacion y seguridad (Completo)
- Supabase Auth email/password con cookie-based session (@supabase/ssr)
- Middleware Next.js protegiendo /dashboard/*
- Fix del loop 307: createBrowserClient en lugar de createClient
- Forgot password con resetPasswordForEmail
- /auth/reset page con evento PASSWORD_RECOVERY
- signupConfirm state: muestra instrucciones si session es null tras signup

### Fase 2 — Dashboard completo (Completo)
- 11 paginas de agentes funcionales en el dashboard
- Sidebar con 3 secciones (General, Agentes de Ingesta, Knowledge)
- FastAPI con endpoints para todos los agentes
- Analytics page conectada a Supabase real (unica pagina 100% real)

### Sprint 1 — Nada engana al usuario (Completo)
- CTAs de landing conectados: "Empezar ahora" -> /auth
- "Contactar ventas" -> mailto:luisaguilaraguila@gmail.com
- OAuth handlers implementados para Google y GitHub
- resetSent y signupConfirm states: el form se oculta al enviar
- Botones "Ver todo" enlazados a /dashboard/analytics
- autocomplete y minLength en inputs de auth

### Sprint 2 — Mobile no esta roto (Completo)
- Sidebar: drawer deslizable en mobile (fixed + translate-x toggle)
- Hamburger button (lg:hidden) en topbar
- Boton X para cerrar sidebar en mobile
- Backdrop con blur al abrir sidebar en mobile
- Cierre con tecla Escape y al cambiar de ruta
- Body scroll lock cuando sidebar esta abierto
- Touch targets minimo 44px (min-h-[44px]) en todos los items de nav
- Focus-visible rings en todos los interactivos
- Section labels text-xs (antes text-[9px]) y text-gray-500 (mejor contraste)
- Avatar con inicial del email del usuario desde Supabase
- NEXT_PUBLIC_API_URL fallback "" en lugar de "http://localhost:8000"
- Fix encoding: curly quotes U+201C/U+201D eliminadas (Turbopack las rechaza)
- Fix encoding: caracteres espanoles corruptos Â¡/Ã¡ corregidos en todos los archivos
- overflow-x-hidden en root div

### Sprint 3 — Los datos son reales (Completo)

**Objetivo**: Eliminar todo el mock data visible al usuario.

- [x] Overview stats reales: COUNT ingestions, SUM tokens, DISTINCT source_types
- [x] Overview "Actividad Reciente": ingestions ORDER BY processed_at LIMIT 3
- [x] Historial real por agente: YouTube, GitHub, Web, Chef, Audio
- [x] RSS feeds desde API real (GET /rss/feeds) con estado local
- [x] RSS delete: POST /rss/remove-feed + actualizar lista
- [x] Badge de plan desde user.user_metadata?.plan (en lugar de "PRO PLAN" fijo)
- [x] Topbar search -> router.push('/dashboard/analytics?q=') al presionar Enter

---

## En curso

### Sprint 4 — Limpieza (Siguiente)

**Objetivo**: Eliminar comportamientos enganosos y codigo muerto.

- [ ] Eliminar simulateLogs() en DocGrab, reemplazar con "Tarea encolada"
- [ ] Eliminar "142 paginas detectadas" hardcodeado en DocGrab
- [ ] Select "Profundidad" en DocGrab -> pasar depth al request de API
- [ ] /dashboard/vault -> redirect('/dashboard/sync')
- [ ] Landing navbar -> hamburger en mobile (< md)
- [ ] Componente <EmptyState /> reutilizable para paginas sin historial
- [ ] fn cn() duplicada en dashboard/page.tsx -> importar de @/lib/utils
- [ ] "Settings" en sidebar -> crear /dashboard/settings o deshabilitar

---

## Backlog largo plazo

### Features de producto

- [ ] **Historial real por agente** — cada pagina carga sus ingestas de Supabase (preparado en Sprint 3, faltaran GitHub/Web/Chef/Audio/DocGrab)
- [ ] **Notificaciones realtime** — SSE o Supabase Realtime cuando un agente termina
- [ ] **Topbar search con dropdown** — resultados RAG inline sin navegar a /search
- [ ] **Settings page** (/dashboard/settings) — nombre, email, password, plan
- [ ] **Daily Briefing** — n8n + Telegram con resumen diario del vault
- [ ] **Deep Sync con Syncthing** — sincronizacion bidireccional con Obsidian local
- [ ] **Knowledge Map 3D** — grafo alimentado por datos reales de document_chunks
- [ ] **DocGrab depth selector** — pasar nivel de profundidad al backend
- [ ] **PDF Ingestor** — subida directa de PDFs desde el dashboard
- [ ] **Telegram Bot** — ingesta desde conversaciones
- [ ] **NotebookLM -> Podcast** — audio generado de los packs

### DevOps / Infra

- [ ] **CI/CD automatico** — GitHub Actions -> SSH -> git pull + rebuild en LXC 126
- [ ] **Streaming de logs via SSE** — reemplaza simulateLogs, muestra progreso real de DocGrab y audio
- [ ] **Monitoreo** — Uptime Kuma para alertas si cae algun contenedor
- [ ] **Backup automatico de Supabase** — dump semanal a storage local o S3
- [ ] **PATH permanente en LXC** — agregar /usr/local/bin al PATH para evitar ruta completa de docker-compose

### Agentes nuevos

- [ ] **Podcast auto-ingestion** — suscribirse a feeds RSS de audio automaticamente
- [ ] **Obsidian Plugin** — ingesta directa desde notas de Obsidian
