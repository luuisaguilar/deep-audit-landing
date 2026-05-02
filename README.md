# 🌌 Deep Audit Knowledge Engine

### Version 2.0: Emerald Edition

Deep Audit es un ecosistema semántico autónomo diseñado para transformar el caos de información en inteligencia ejecutable almacenada en un Vault de Obsidian.

## 🚀 Vision
Establecer una "Segunda Memoria" corporativa que entiende las conexiones entre videos, documentación y código mediante grafos de conocimiento 3D y agentes de IA.

## 🛠️ Stack Tecnológico
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind v4.
- **Visualización**: Three.js + React Three Fiber (Galaxy & Knowledge Graph).
- **Seguridad**: Supabase Auth + Middleware Guard.
- **Backend Bridge**: FastAPI (Python) para orquestación de agentes.
- **Realtime**: Supabase Realtime (Sincronización Vault-to-Web).

## 📁 Componentes de la Arquitectura
1.  **Frontend (`/src`)**: Landing page premium y Dashboard operativo.
2.  **API Bridge (`/scripts/api_bridge.py`)**: Interfaz entre el Dashboard y tus scripts de Python.
3.  **Vault Sync (`/scripts/vault_sync.py`)**: Watcher para sincronizar Obsidian con el mapa 3D.
4.  **Supabase (`/supabase`)**: Esquema de nodos y conexiones de conocimiento.

## 🏁 Inicio Rápido

### 1. Configuración Web
```bash
npm install
# Configurar .env.local con credenciales de Supabase y URL de la API
npm run dev
```

### 2. Configuración de Agentes (Servidor Proxmox)
```bash
pip install fastapi uvicorn supabase watchdog
python scripts/api_bridge.py
python scripts/vault_sync.py
```

---
*Desarrollado por Luis & Antigravity AI.*
