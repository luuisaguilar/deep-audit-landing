# Sistema de Diseno — Deep Audit Knowledge Engine

**Ultima actualizacion: 2 de Mayo 2026**

---

## Paleta de colores

| Nombre | Hex | Uso |
|---|---|---|
| Emerald (brand) | `#10b981` | CTAs, activos, bordes de enfoque, iconos de marca |
| Emerald light | `#34d399` | Degradados, gradientes en avatar |
| Background | `#0e1117` | Fondo global de la app |
| Surface | `rgba(255,255,255,0.05)` | Cards, glass, inputs |
| Border | `rgba(255,255,255,0.10)` | Bordes de cards e inputs |
| Text primary | `#ffffff` | Titulos y contenido principal |
| Text secondary | `text-gray-400` | Subtitulos, placeholders |
| Text muted | `text-gray-500` | Labels de seccion, hints |
| Success | `text-green-400` / `bg-[#10b981]/10` | Status "success", badges |
| Error | `text-red-400` / `bg-red-500/10` | Status "error", mensajes de error |
| Warning | `text-yellow-400` | Tokens usados, alertas |

---

## Clases CSS globales (globals.css)

### `.glass`
Card con fondo semitransparente, blur y borde sutil. Usada en todos los paneles del dashboard.
```css
background: rgba(255, 255, 255, 0.03);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 1rem;
```

### `.btn-emerald`
Boton de accion principal. Siempre usado para el CTA mas importante de la pagina.
```css
background: #10b981;
color: #0e1117;
font-weight: 700;
border-radius: 0.75rem;
padding: 0.75rem 1.5rem;
transition: all 150ms;
/* hover: opacity 0.9, scale 1.02 */
```

### `.emerald-text-gradient`
Degradado de texto para titulos de seccion (e.g. "YouTube **Analysis**").
```css
background: linear-gradient(135deg, #10b981, #34d399);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## Componentes del dashboard

### DashboardLayout
Archivo: `src/components/dashboard/DashboardLayout.tsx`

Estructura:
```
<div flex min-h-screen overflow-x-hidden>
  [Backdrop mobile — fixed inset-0 bg-black/60 z-40 lg:hidden]
  <aside w-64 glass — drawer en mobile, posicion en flujo en desktop>
    [Logo + boton X (lg:hidden)]
    <nav> menuSections con items </nav>
    [Footer: Settings + Logout]
  </aside>
  <div flex-1 flex-col>
    <header h-16 lg:h-20>
      [Hamburger (lg:hidden)] [Search] [PRO PLAN badge] [Avatar]
    </header>
    <main p-4 lg:p-8>
      {children}
    </main>
  </div>
</div>
```

Comportamiento mobile:
- Sidebar oculto por defecto (`-translate-x-full`)
- Hamburger abre sidebar (`translate-x-0`) + backdrop
- Cierra al: hacer clic en backdrop, presionar Escape, cambiar de ruta
- Body scroll bloqueado cuando sidebar abierto

### Card de agente (patron estandar)

Todas las paginas de agente siguen la misma estructura:

```
<div space-y-8>
  <header>
    <h1> Nombre <span gradient> Subtitulo </span> </h1>
    <p text-gray-500> Descripcion breve </p>
  </header>

  <div glass p-8>         <- Panel de accion
    <form>
      <label>
      <input con icono izquierdo>
      <button btn-emerald>
      [Mensaje de exito/error]
    </form>
  </div>

  <div glass overflow-hidden>   <- Panel de historial
    <div p-6 border-b> Titulo + "Ver todo" link </div>
    [Loading spinner | Empty state | Lista de items]
  </div>
</div>
```

### Badge de status
```tsx
// success
<div className="bg-[#10b981]/10 text-[#10b981] text-[10px] px-3 py-1 rounded-full font-bold uppercase">
  success
</div>

// error
<div className="bg-red-500/10 text-red-400 text-[10px] px-3 py-1 rounded-full font-bold uppercase">
  error
</div>
```

### Mensaje de feedback (exito)
```tsx
<div className="p-4 bg-[#10b981]/10 border border-[#10b981]/20 rounded-xl text-[#10b981] text-sm flex items-center gap-3">
  <CheckCircle2 className="w-5 h-5 shrink-0" /> {message}
</div>
```

### Mensaje de feedback (error)
```tsx
<div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
  <AlertCircle className="w-5 h-5 shrink-0" /> {message}
</div>
```

### Loading spinner centrado
```tsx
<div className="flex items-center justify-center h-64">
  <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
</div>
```

### Empty state
```tsx
<div className="p-8 text-center text-gray-600 text-sm">
  No hay items registrados aun.
</div>
```

---

## Iconos (lucide-react v1.x)

> IMPORTANTE: lucide-react v1.x no exporta todos los iconos de versiones modernas.
> Verificar disponibilidad antes de usar un icono nuevo.

| Agente / Seccion | Icono |
|---|---|
| Overview | `LayoutDashboard` |
| Analytics | `BarChart2` |
| Buscador RAG | `Search` |
| YouTube | `Video` (NO `Youtube`) |
| GitHub | `GitBranch` (NO `Github`) |
| Web Scraper | `Globe` |
| Chef IA | `UtensilsCrossed` |
| RSS | `Rss` |
| Audio | `Mic` |
| DocGrab | `FileText` |
| NotebookLM | `BookOpen` |
| Vault Sync | `RefreshCw` |
| Database / Logo | `Database` |
| Hamburger | `Menu` |
| Cerrar | `X` |
| Logout | `LogOut` |
| Settings | `Settings` |
| Trending | `TrendingUp` |
| Tokens | `Zap` |
| Procesando | `Loader2` (con `animate-spin`) |
| CPU/Agents | `Cpu` |

---

## Tipografia

| Uso | Clase Tailwind |
|---|---|
| Titulo de pagina | `text-3xl font-bold` |
| Titulo de seccion | `text-xl font-bold` |
| Titulo de card | `font-bold text-lg` |
| Texto normal | `text-sm` |
| Labels de seccion sidebar | `text-[10px] font-black uppercase tracking-widest text-gray-500` |
| Badges y micro-texto | `text-[10px] font-bold uppercase` |
| Metadatos (fecha, tipo) | `text-[10px] text-gray-500 uppercase font-black` |
| Minimo permitido en UI | `text-xs` (12px) |

---

## Espaciado estandar

| Elemento | Clase |
|---|---|
| Espaciado entre secciones de pagina | `space-y-8` |
| Padding de cards glass | `p-6` o `p-8` |
| Padding de sidebar nav items | `px-4 min-h-[44px]` |
| Gap entre icono y texto en nav | `gap-3` |
| Border radius de cards | `rounded-xl` o `rounded-2xl` |
| Border radius de inputs | `rounded-2xl` |
| Border radius de badges | `rounded-full` |

---

## Touch targets (accesibilidad)

Todos los elementos interactivos deben tener al menos 44x44px de area tactil:
- Botones: `min-h-[44px]` o `py-3` o `py-4`
- Links de sidebar: `min-h-[44px]`
- Iconos-boton: `w-11 h-11` minimo

---

## Animaciones

| Animacion | Clase |
|---|---|
| Entrada de pagina | `animate-in fade-in slide-in-from-bottom-4 duration-700` |
| Entrada de elementos de lista | `animate-in fade-in slide-in-from-left-1 duration-300` |
| Spin de loading | `animate-spin` |
| Pulse de status activo | `animate-pulse` |
| Spin lento (Knowledge Map) | `animate-spin-slow` |
| Transicion de sidebar | `transition-transform duration-300 ease-in-out` |

---

## Focus y accesibilidad

Los items de navegacion y botones secundarios usan:
```tsx
className="... focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]"
```

Los botones de logout usan ring rojo:
```tsx
className="... focus-visible:ring-2 focus-visible:ring-red-400"
```

---

## Estructura de colores por tipo de agente

Para badges y etiquetas en Analytics y listas de historial:

| source_type | Color |
|---|---|
| youtube | `text-red-400` |
| github | `text-purple-400` |
| web | `text-blue-400` |
| chef | `text-orange-400` |
| rss | `text-yellow-400` |
| audio | `text-pink-400` |
| docgrab | `text-cyan-400` |
