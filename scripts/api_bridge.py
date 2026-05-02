import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

# Configuración de Logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DeepAudit-Bridge")

app = FastAPI(title="Deep Audit Agent Bridge")

# Configuración de CORS (Permite que el Dashboard se conecte)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción, cambia esto por tu dominio de Cloudflare
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos de Datos
class AnalysisRequest(BaseModel):
    url: str

# Endpoints
@app.get("/")
async def health_check():
    return {"status": "online", "version": "2.0.0", "engine": "DeepAudit-Emerald"}

@app.post("/analyze/youtube")
async def analyze_youtube(request: AnalysisRequest):
    logger.info(f"🎥 Recibida orden de análisis YouTube: {request.url}")
    try:
        # AQUÍ: Inserta la llamada a tu script actual de YouTube Agent
        # Ejemplo: subprocess.run(["python", "youtube_agent.py", request.url])
        
        return {
            "status": "success",
            "message": "Agente de YouTube activado correctamente",
            "target": request.url
        }
    except Exception as e:
        logger.error(f"Error al activar agente: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/docgrab")
async def analyze_docgrab(request: AnalysisRequest):
    logger.info(f"🕷️ Recibida orden de DocGrab: {request.url}")
    try:
        # AQUÍ: Inserta la llamada a tu script actual de DocGrab
        return {
            "status": "success",
            "message": "Agente DocGrab iniciado en segundo plano",
            "target": request.url
        }
    except Exception as e:
        logger.error(f"Error al activar DocGrab: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    logger.info("🚀 Iniciando Deep Audit Bridge en http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
