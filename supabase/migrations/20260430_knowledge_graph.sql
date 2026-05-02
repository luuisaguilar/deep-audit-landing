-- Crear tabla de nodos de conocimiento
CREATE TABLE IF NOT EXISTS public.knowledge_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT DEFAULT 'general', -- 'youtube', 'docgrab', 'obsidian', 'personal'
    content_summary TEXT,
    file_path TEXT UNIQUE, -- Ruta relativa en el Vault
    tags TEXT[],
    pos_x FLOAT DEFAULT 0,
    pos_y FLOAT DEFAULT 0,
    pos_z FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de conexiones (aristas)
CREATE TABLE IF NOT EXISTS public.knowledge_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE,
    target_id UUID REFERENCES public.knowledge_nodes(id) ON DELETE CASCADE,
    relation_type TEXT DEFAULT 'link',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(source_id, target_id)
);

-- Habilitar Realtime para estas tablas
ALTER PUBLICATION supabase_realtime ADD TABLE knowledge_nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE knowledge_edges;

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_knowledge_nodes_updated_at
    BEFORE UPDATE ON knowledge_nodes
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
