import os
import sys
from pathlib import Path

# Add root and backend directories to sys.path
ROOT_DIR = Path(__file__).resolve().parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
if str(ROOT_DIR / "backend") not in sys.path:
    sys.path.insert(0, str(ROOT_DIR / "backend"))

import gradio as gr
from backend.main import app

with gr.Blocks(title="SatQuery AI API") as demo:
    gr.Markdown("# 🛰️ SatQuery AI — Remote Sensing Vision Engine")
    gr.Markdown(
        "Live FastAPI backend running **GeoRSCLIP (ViT-B-32)** zero-shot spatial grounding.\n\n"
        "- **Health Endpoint**: `/api/health`\n"
        "- **Single Query**: `POST /api/query`\n"
        "- **Change Detection**: `POST /api/query/change`\n"
        "- **Interactive API Docs**: `/docs`"
    )

# Mount Gradio interface onto FastAPI backend
app = gr.mount_gradio_app(app, demo, path="/")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
