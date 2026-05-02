# Backlog — Deep Audit Knowledge Engine

**Última actualización: 2 de Mayo 2026**

Formato: `[Severidad] Descripción — Archivo:línea (si aplica)`

---

## Sprint 2 — Mobile no está roto

| # | Issue | Archivo | Fix |
|---|---|---|---|
| S2-1 | Sidebar sin colapso en mobile — cubre el 68% del viewport en 375px | `DashboardLayout.tsx` | `hidden lg:flex` en aside + hamburger button + drawer con `useState` |
| S2-2 | Landing navbar sin hamburger menu en mobile | `src/app/page.tsx` | `hidden md:flex` en nav links + botón hamburger |
| S2-3 | Touch targets < 44px en sidebar items (`py-2.5` ≈ 38px) | `DashboardLayout.tsx` | Cambiar a `py-3` o añadir `min-h-[44px]` |
| S2-4 | Labels de sección del sidebar `text-[9px]` — ilegibles | `DashboardLayout.tsx` | Cambiar a `text-xs` (12px) |
| S2-5 | `text-[10px]` y `text-[11px]` en múltiples componentes | Global | Find/replace → `text-xs` mínimo |
| S2-6 | Posible scroll horizontal en landing a 375px | `src/app/page.tsx` | `overflow-x: hidden` en `main` |

---

## Sprint 3 — Los datos son reales

| # | Mock data | Archivo:línea | Reemplazar con |
|---|---|---|---|
| S3-1 | Stats grid ("12,450", "458h", "1.2M", "3") | `dashboard/page.tsx:26-29` | Query `SELECT COUNT(*), SUM(prompt_tokens+completion_tokens) FROM ingestions` |
| S3-2 | "Actividad Reciente" — 3 items inventados | `dashboard/page.tsx:76-79` | `ingestions ORDER BY processed_at DESC LIMIT 3` |
| S3-3 | YouTube historial — 3 items falsos | `dashboard/youtube/page.tsx:115-119` | `ingestions WHERE source_type='youtube' LIMIT 5` |
| S3-4 | `MOCK_FEEDS` en RSS | `dashboard/rss/page.tsx:5-8` | Crear endpoint `GET /rss/feeds` y llamarlo en `useEffect` |
| S3-5 | Botón Trash de RSS sin handler | `dashboard/rss/page.tsx` | `POST /rss/remove-feed` + `setFeeds(feeds.filter(...))` |
| S3-6 | Avatar de usuario = div de colores | `DashboardLayout.tsx:101` | `supabase.auth.getUser()` → mostrar inicial del email |
| S3-7 | Badge "PRO PLAN" hardcodeado | `DashboardLayout.tsx:99` | `user.user_metadata?.plan \|\| 'FREE'` |
| S3-8 | Topbar search sin funcionalidad | `DashboardLayout.tsx` | `router.push('/dashboard/search?q='+query)` al presionar Enter |
| S3-9 | Stats landing page (1250 videos, 50M tokens...) | `src/app/page.tsx:81-84` | Supabase `ingestions` count agregado, o dejar como marketing copy (decisión de negocio) |

---

## Sprint 4 — Limpieza

| # | Issue | Archivo | Fix |
|---|---|---|---|
| S4-1 | `simulateLogs()` genera logs falsos en DocGrab | `dashboard/docgrab/page.tsx:55-69` | Eliminar función. Mostrar "Tarea encolada — procesando en segundo plano" |
| S4-2 | "Páginas detectadas: 142" hardcodeado en DocGrab | `dashboard/docgrab/page.tsx:136` | Eliminar widget hasta que el backend devuelva el dato real |
| S4-3 | Select "Profundidad" en DocGrab no afecta el request | `dashboard/docgrab/page.tsx` | Añadir `depth` al body del fetch + actualizar endpoint de la API |
| S4-4 | `/dashboard/vault` huérfana (no en sidebar) | `dashboard/vault/page.tsx` | Añadir `export { redirect } from 'next/navigation'` y redirigir a `/dashboard/sync` |
| S4-5 | Botón "Sincronizar Ahora" en vault sin `onClick` | `dashboard/vault/page.tsx:15` | Si se mantiene la página, conectar al handler del sync |
| S4-6 | Focus states ausentes en todos los interactivos | `globals.css` | Añadir regla `*:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }` |
| S4-7 | `fn cn()` duplicada en dashboard/page.tsx | `dashboard/page.tsx:120` | Importar desde `@/lib/utils` o crear el archivo |
| S4-8 | Empty states sin ilustración ni CTA | GitHub, Web, Chef, Audio, NotebookLM | Crear componente `<EmptyState icon= title= description= href= />` |
| S4-9 | "Settings" en sidebar sin acción | `DashboardLayout.tsx` | Crear `/dashboard/settings/page.tsx` o añadir `href` |
| S4-10 | Stats de `/sync/obsidian` siempre retornan 0 | `api.py` — endpoint `/sync/obsidian` | Hacer que `sync_all_to_obsidian()` retorne el conteo real |

---

## Backlog largo plazo (sin sprint asignado)

| # | Feature | Prioridad |
|---|---|---|
| L-1 | CI/CD: GitHub Actions → SSH → git pull + rebuild automático | Alta |
| L-2 | Historial real por agente (cada página muestra sus ingestas) | Alta |
| L-3 | Notificaciones realtime cuando un agente termina | Media |
| L-4 | Settings page (`/dashboard/settings`) | Media |
| L-5 | Daily Briefing via n8n + Telegram | Media |
| L-6 | Deep Sync con Syncthing | Media |
| L-7 | Knowledge Map 3D con datos reales de `document_chunks` | Media |
| L-8 | Streaming de logs via SSE (reemplaza simulateLogs) | Media |
| L-9 | Monitoreo con Uptime Kuma | Baja |
| L-10 | PDF Ingestor directo desde el dashboard | Baja |
| L-11 | Telegram Bot para ingesta desde conversaciones | Baja |
| L-12 | Backup automático semanal de Supabase | Baja |
