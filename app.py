import os
import sys
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

# Add root and backend directories to sys.path
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(ROOT_DIR / "backend") not in sys.path:
    sys.path.insert(0, str(ROOT_DIR / "backend"))

import gradio as gr
from backend.config import settings
from backend.routes import health, query

# Create Gradio Blocks UI
with gr.Blocks(title="SatQuery AI API") as demo:
    gr.Markdown("# 🛰️ SatQuery AI — Remote Sensing Vision Engine")
    gr.Markdown(
        "Live FastAPI backend running **GeoRSCLIP (ViT-B-32)** zero-shot spatial grounding.\n\n"
        "- **Health Endpoint**: `/api/health`\n"
        "- **Single Query**: `POST /api/query`\n"
        "- **Change Detection**: `POST /api/query/change`\n"
        "- **Interactive API Docs**: `/docs`"
    )

# Gradio's internal engine is FastAPI (demo.app)
# Mount CORS middleware & SatQuery routers directly onto demo.app
demo.app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

demo.app.include_router(health.router, prefix=settings.api_prefix, tags=["health"])
demo.app.include_router(query.router, prefix=settings.api_prefix, tags=["query"])

# Standard Hugging Face Gradio launch
if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
