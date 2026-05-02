import os
import re
import time
import uuid
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from supabase import create_client, Client

# Configuración (Configurar vía variables de entorno)
SUPABASE_URL = os.getenv("SUPABASE_URL", "TU_URL_DE_SUPABASE")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "TU_SERVICE_ROLE_KEY")
VAULT_PATH = os.getenv("VAULT_PATH", "/path/to/your/obsidian/vault")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def extract_metadata(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    title = os.path.basename(file_path).replace(".md", "")
    # Buscar links estilo [[Nota]]
    links = re.findall(r'\[\[(.*?)\]\]', content)
    
    return {
        "title": title,
        "content_summary": content[:200] + "...",
        "file_path": os.path.relpath(file_path, VAULT_PATH),
        "links": links
    }

def sync_file(file_path):
    if not file_path.endswith(".md"):
        return
    
    print(f"Sincronizando: {file_path}")
    data = extract_metadata(file_path)
    
    # Upsert nodo
    node_data = {
        "title": data["title"],
        "content_summary": data["content_summary"],
        "file_path": data["file_path"],
        "category": "obsidian"
    }
    
    result = supabase.table("knowledge_nodes").upsert(node_data, on_conflict="file_path").execute()
    node_id = result.data[0]["id"]
    
    # Procesar links (esto es simplificado, requiere que los destinos ya existan)
    for link in data["links"]:
        # Buscar el ID del nodo destino
        target = supabase.table("knowledge_nodes").select("id").eq("title", link).execute()
        if target.data:
            edge_data = {
                "source_id": node_id,
                "target_id": target.data[0]["id"]
            }
            supabase.table("knowledge_edges").upsert(edge_data, on_conflict="source_id,target_id").execute()

class VaultHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if not event.is_directory:
            sync_file(event.src_path)

    def on_created(self, event):
        if not event.is_directory:
            sync_file(event.src_path)

if __name__ == "__main__":
    print(f"Iniciando Watcher de Vault en: {VAULT_PATH}")
    # Sincronización inicial
    for root, dirs, files in os.walk(VAULT_PATH):
        for file in files:
            sync_file(os.path.join(root, file))
    
    event_handler = VaultHandler()
    observer = Observer()
    observer.schedule(event_handler, VAULT_PATH, recursive=True)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
