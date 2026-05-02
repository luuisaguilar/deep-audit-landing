# 📖 Runbook Operativo: Deep Audit

## 🏗️ Despliegue en Proxmox

### 1. Preparación del LXC / VM
- Ubuntu 22.04+ con Node.js 20+ y Python 3.10+.
- Puertos necesarios: `3001` (Next.js) y `8000` (FastAPI Bridge).

### 2. Despliegue del Bridge (Backend)
El script `scripts/api_bridge.py` es el punto de entrada para los agentes.
```bash
cd /path/to/project
pip install fastapi uvicorn cors pydantic
python scripts/api_bridge.py
```
*Recomendación: Usar PM2 o Systemd para mantenerlo corriendo.*

### 3. Sincronización de Obsidian (Vault Sync)
Para que el Mapa 3D funcione, este script debe estar activo:
```bash
python scripts/vault_sync.py
```
*Asegúrate de configurar `VAULT_PATH` en el script con la ruta real de tu carpeta de Obsidian.*

### 4. Configuración de Variables (.env.local)
Crucial para la comunicación Dashboard <-> Proxmox:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://<IP_LOCAL_PROXMOX>:8000
```

### 5. Configuración de Supabase
Ejecutar el script SQL en `/supabase/migrations/20260430_knowledge_graph.sql` para crear las tablas de nodos y aristas.

## 🛠️ Mantenimiento y Logs
- **Logs de Agentes**: Revisa la salida de `api_bridge.py` para ver las peticiones entrantes.
- **Realtime**: Si el mapa no se actualiza, verifica que el Realtime esté habilitado para la tabla `knowledge_nodes` en el dashboard de Supabase.

---
*Fin del Runbook.*
