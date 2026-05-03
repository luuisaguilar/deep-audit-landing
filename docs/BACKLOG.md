# Backlog — Deep Audit Knowledge Engine

**Ultima actualizacion: 2 de Mayo 2026 — post sesion 4**

Formato: `[ID] Descripcion — Archivo (si aplica)`

---

## Sprint 1 — Nada engana al usuario (COMPLETO)

| # | Issue | Archivo | Estado |
|---|---|---|---|
| S1-1 | CTAs landing sin href | src/app/page.tsx | Completo |
| S1-2 | "Ver demo" no hacia nada | src/app/page.tsx | Completo |
| S1-3 | OAuth buttons sin handler | src/app/auth/page.tsx | Completo |
| S1-4 | Reset password sin pagina destino | — | Completo: /auth/reset creada |
| S1-5 | Form no se oculta al enviar forgot password | src/app/auth/page.tsx | Completo: resetSent state |
| S1-6 | Signup sin confirmacion si no hay sesion | src/app/auth/page.tsx | Completo: signupConfirm state |
| S1-7 | "Ver todo" en YouTube no enlazaba a analytics | dashboard/youtube/page.tsx | Completo |

---

## Sprint 2 — Mobile no esta roto (COMPLETO)

| # | Issue | Archivo | Estado |
|---|---|---|---|
| S2-1 | Sidebar sin colapso en mobile | DashboardLayout.tsx | Completo: drawer + hamburger |
| S2-2 | Touch targets < 44px en sidebar | DashboardLayout.tsx | Completo: min-h-[44px] en todos |
| S2-3 | Labels de seccion text-[9px] ilegibles | DashboardLayout.tsx | Completo: text-xs |
| S2-4 | Labels de seccion text-gray-600 (bajo contraste) | DashboardLayout.tsx | Completo: text-gray-500 |
| S2-5 | API URL fallback a localhost en produccion | 10 paginas de dashboard | Completo: fallback "" |
| S2-6 | Caracteres espanoles corruptos (Â¡/Ã¡) | 10 paginas de dashboard | Completo |
| S2-7 | Curly quotes U+201C/201D en audio/page.tsx | dashboard/audio/page.tsx | Completo |
| S2-8 | Avatar sin inicial del usuario | DashboardLayout.tsx | Completo: supabase.auth.getUser() |
| S2-9 | Body scroll cuando sidebar abierto en mobile | DashboardLayout.tsx | Completo |
| S2-10 | Escape key no cerraba sidebar | DashboardLayout.tsx | Completo |

---

## Sprint 3 — Los datos son reales (COMPLETO)

| # | Mock data | Archivo | Fix |
|---|---|---|---|
| S3-1 | Stats grid hardcodeados ("12,450", "458h", "1.2M", "3") | dashboard/page.tsx | Completo: COUNT ingestions, SUM tokens, COUNT DISTINCT source_type |
| S3-2 | "Actividad Reciente" — 3 items inventados | dashboard/page.tsx | Completo: ingestions ORDER BY processed_at DESC LIMIT 3 |
| S3-3 | YouTube historial — 3 items falsos | dashboard/youtube/page.tsx | Completo: ingestions WHERE source_type='youtube' LIMIT 10 |
| S3-4 | MOCK_FEEDS en RSS | dashboard/rss/page.tsx | Completo: GET /rss/feeds endpoint + useEffect |
| S3-5 | Boton Trash de RSS sin handler | dashboard/rss/page.tsx | Completo: POST /rss/remove-feed + setFeeds(feeds.filter(...)) |
| S3-6 | Badge "PRO PLAN" hardcodeado | DashboardLayout.tsx | Completo: user_metadata?.plan?.toUpperCase() con fallback "FREE" |
| S3-7 | Topbar search sin funcionalidad | DashboardLayout.tsx | Completo: router.push('/dashboard/analytics?q=') al presionar Enter |
| S3-8 | GitHub historial — lista vacia estatica | dashboard/github/page.tsx | Completo: ingestions WHERE source_type='github' |
| S3-9 | Web historial — placeholder estatico | dashboard/web/page.tsx | Completo: ingestions WHERE source_type='web' |
| S3-10 | Chef historial — placeholder estatico | dashboard/chef/page.tsx | Completo: ingestions WHERE source_type='chef' |
| S3-11 | Audio historial — placeholder estatico | dashboard/audio/page.tsx | Completo: ingestions WHERE source_type='audio' |
| S3-12 | Analytics no leia el param ?q= del topbar search | dashboard/analytics/page.tsx | Completo: useSearchParams + filtro client-side por titulo/URL/tipo + boton X |

**Patron de referencia** (ya implementado en analytics/page.tsx):
```ts
const { data: { user } } = await supabase.auth.getUser();
let query = supabase.from("ingestions").select("*")
  .order("processed_at", { ascending: false }).limit(50);
if (user) query = query.eq("user_id", user.id);
const { data, error: err } = await query;
```

---

## Sprint 4 — Limpieza (COMPLETO)

| # | Issue | Archivo | Estado |
|---|---|---|---|
| S4-1 | simulateLogs() genera logs falsos en DocGrab | dashboard/docgrab/page.tsx | Completo |
| S4-2 | "Paginas detectadas: 142" hardcodeado | dashboard/docgrab/page.tsx | Completo |
| S4-3 | Select "Profundidad" no afecta el request | dashboard/docgrab/page.tsx | Completo: depth pasado al backend |
| S4-4 | /dashboard/vault huerfana (no en sidebar) | dashboard/vault/page.tsx | Completo: redirigido a /dashboard/sync |
| S4-5 | Landing navbar sin hamburger en mobile | src/app/page.tsx | Completo: responsive classes añadidas |
| S4-6 | Componente EmptyState ausente | multiple paginas | Completo: src/components/EmptyState.tsx creado e integrado |
| S4-7 | fn cn() duplicada en dashboard/page.tsx | dashboard/page.tsx | Completo: usa @/lib/utils |
| S4-8 | "Settings" en sidebar sin destino | DashboardLayout.tsx | Completo: habilitado con placeholder funcional |
| S4-9 | Stats de /sync/obsidian siempre 0 | api.py — /sync/obsidian | Completo: retorno sincrónico de conteos reales |
| S4-10 | overflow-x en landing a 375px | src/app/page.tsx | Completo: overflow-x-hidden añadido |

---

## Backlog largo plazo (sin sprint asignado)

| # | Feature | Prioridad |
|---|---|---|
| L-1 | CI/CD: GitHub Actions -> SSH -> git pull + rebuild automatico | Alta |
| L-2 | Notificaciones realtime cuando un agente termina (Supabase Realtime o SSE) | Media |
| L-3 | Streaming de logs via SSE desde FastAPI (reemplaza simulateLogs) | Media |
| L-4 | Settings page (/dashboard/settings): cambiar nombre, email, password, plan | Media |
| L-5 | Daily Briefing via n8n + Telegram | Media |
| L-6 | Deep Sync con Syncthing bidireccional | Media |
| L-7 | Knowledge Map 3D con datos reales de document_chunks | Media |
| L-8 | Topbar search con dropdown de resultados RAG inline | Media |
| L-9 | Monitoreo con Uptime Kuma | Baja |
| L-10 | PDF Ingestor directo desde dashboard | Baja |
| L-11 | Telegram Bot para ingesta desde conversaciones | Baja |
| L-12 | Backup automatico semanal de Supabase | Baja |
| L-13 | Podcast auto-ingestion desde feeds RSS de audio | Baja |
| L-14 | PATH permanente en LXC (/usr/local/bin en .bashrc) | Baja |
| L-15 | OAuth providers configurados en Supabase Dashboard | Configuracion puntual |
