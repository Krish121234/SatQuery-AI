# SatQuery-AI Backend - Complete Setup Guide

## Overview

SatQuery-AI is a satellite image analysis platform that combines multiple specialized components:

- **Sai's Grounding Pipeline**: Analyzes satellite images and classifies them into a 3x3 grid with land cover classes
- **Sid's Gemini Integration**: Answers natural language questions based on the grounding data
- **Change Detection**: Compares before/after images to identify changes

This backend provides a complete FastAPI implementation with a full mock pipeline for development and testing.

---

## Project Structure

```
SatQuery-AI/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration and settings management
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example            # Environment variables template
│   ├── .gitignore              # Git ignore rules
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── health.py           # GET /api/health endpoint
│   │   └── query.py            # POST /api/query and /api/query/change
│   ├── models/
│   │   ├── __init__.py
│   │   └── request.py          # Pydantic request models
│   └── services/
│       ├── __init__.py
│       └── mock_service.py     # Complete mock pipeline implementation
├── day1-final.html             # Day 1 completion summary
└── README.md                   # This file
```

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

```bash
# Copy the example
cp .env.example .env

# Edit .env with your settings (optional for development)
```

### 3. Run the Backend

```bash
python -m uvicorn main:app --reload
```

The backend will start at `http://localhost:8000`

---

## API Documentation

### Interactive Documentation

Once running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints

#### 1. Health Check
```
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "message": "SatQuery-AI backend is running"
}
```

---

#### 2. Single Image Query
```
POST /api/query
```

**Parameters:**
- `question` (form data): Natural language question about the image
- `file` (form data): Satellite image file (any image format)

**Example:**
```bash
curl -X POST http://localhost:8000/api/query \
  -F "file=@satellite_image.png" \
  -F "question=What agricultural areas are visible in this satellite image?"
```

**Response:**
```json
{
  "query_id": "a1b2c3d4",
  "filename": "satellite_image.png",
  "question": "What agricultural areas are visible?",
  "grounding": {
    "image_name": "satellite_image.png",
    "timestamp": "2024-01-15T10:30:45.123456",
    "grid_size": "3x3",
    "tiles": [
      {
        "tile_id": 0,
        "class": "Agriculture",
        "confidence": 0.95
      },
      {
        "tile_id": 1,
        "class": "Water",
        "confidence": 0.87
      },
      // ... 7 more tiles
    ],
    "summary": "Grid analysis: 2 tiles of Agriculture, 1 tiles of Barren, 2 tiles of Built-up, 2 tiles of Vegetation, 2 tiles of Water"
  },
  "answer": "Based on satellite analysis, Grid analysis: 2 tiles of Agriculture, 1 tiles of Barren, 2 tiles of Built-up, 2 tiles of Vegetation, 2 tiles of Water. The area shows significant agricultural presence with several tiles classified as Agriculture.",
  "timestamp": "2024-01-15T10:30:45.123456"
}
```

---

#### 3. Before/After Change Detection
```
POST /api/query/change
```

**Parameters:**
- `before_question` (form data): Question about the before image
- `after_question` (form data): Question about the after image
- `before_file` (form data): Before satellite image
- `after_file` (form data): After satellite image

**Example:**
```bash
curl -X POST http://localhost:8000/api/query/change \
  -F "before_file=@before.png" \
  -F "after_file=@after.png" \
  -F "before_question=What was the land cover before?" \
  -F "after_question=What is the land cover now?"
```

**Response:**
```json
{
  "change_id": "x9y8z7w6",
  "before": {
    "filename": "before.png",
    "question": "What was the land cover before?",
    "grounding": {
      "image_name": "before.png",
      "timestamp": "2024-01-15T10:30:45.123456",
      "grid_size": "3x3",
      "tiles": [
        {"tile_id": 0, "class": "Agriculture", "confidence": 0.92},
        {"tile_id": 1, "class": "Agriculture", "confidence": 0.88},
        // ... more tiles
      ],
      "summary": "Grid analysis: 4 tiles of Agriculture, 3 tiles of Vegetation, 2 tiles of Water"
    }
  },
  "after": {
    "filename": "after.png",
    "question": "What is the land cover now?",
    "grounding": {
      "image_name": "after.png",
      "timestamp": "2024-01-15T10:30:45.123456",
      "grid_size": "3x3",
      "tiles": [
        {"tile_id": 0, "class": "Water", "confidence": 0.91},
        {"tile_id": 1, "class": "Agriculture", "confidence": 0.89},
        // ... more tiles
      ],
      "summary": "Grid analysis: 2 tiles of Agriculture, 1 tiles of Built-up, 2 tiles of Vegetation, 4 tiles of Water"
    }
  },
  "change_detection": {
    "change_count": 2,
    "unchanged_count": 7,
    "changes": [
      {
        "tile_id": 0,
        "before_class": "Agriculture",
        "after_class": "Water",
        "confidence_change": -0.01
      },
      {
        "tile_id": 4,
        "before_class": "Vegetation",
        "after_class": "Built-up",
        "confidence_change": 0.03
      }
    ],
    "summary": "Detected 2 tile changes out of 9 tiles. 7 tiles remained unchanged. Changes: Tile 1: Agriculture → Water; Tile 5: Vegetation → Built-up"
  },
  "timestamp": "2024-01-15T10:30:45.123456"
}
```

---

## Configuration

### CORS Settings

The backend is pre-configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative frontend port)

To add more origins, edit `backend/config.py`:

```python
cors_origins: list = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://yourdomain.com",  # Add your domain here
]
```

### Environment Variables

Create a `.env` file (from `.env.example`) for additional configuration:

```env
DEBUG=True
APP_VERSION=1.0.0
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Mock Pipeline Architecture

### 1. Grounding Pipeline (Sai)

The grounding pipeline simulates satellite image analysis:

- **Input**: Satellite image
- **Process**: Analyzes image and creates a 3x3 grid (9 tiles)
- **Classification**: Each tile is classified into one of 5 land cover classes:
  - Agriculture
  - Water
  - Vegetation
  - Built-up
  - Barren
- **Confidence**: Each classification includes a confidence score (0.75-0.99)
- **Output**: Grid analysis with tiles and summary

**Key Classes:**
- `GroundingTile`: Represents a single tile with class and confidence
- `GroundingResult`: Represents the complete 3x3 grid analysis

### 2. Gemini Integration (Sid)

The Gemini simulator answers questions based on grounding data:

- **Input**: Question + Grounding data
- **Process**: Analyzes question keywords and grounding summary
- **Intelligence**: Context-aware responses based on question type
- **Output**: Natural language answer

**Key Class:**
- `GeminiSimulator`: Simulates Gemini API for question answering

### 3. Change Detection

Compares two grounding results to identify changes:

- **Input**: Before and after grounding results
- **Process**: 
  - Compares each tile's classification
  - Calculates confidence changes
  - Identifies unchanged tiles
- **Output**: Detailed change report with tile-by-tile breakdown

**Key Class:**
- `ChangeDetector`: Detects and reports changes between images

### 4. Pipeline Orchestration

The `MockPipeline` class orchestrates all three components:

```python
pipeline = MockPipeline()

# Process single image
result = pipeline.process_query(
    image_data=image_bytes,
    question="What agricultural areas are visible?",
    filename="image.png"
)

# Detect changes
changes = pipeline.detect_changes(
    before_image=before_bytes,
    after_image=after_bytes,
    before_question="What was here?",
    after_question="What is here now?",
    before_filename="before.png",
    after_filename="after.png"
)
```

---

## File Descriptions

### `main.py`
FastAPI application entry point. Sets up the app with CORS middleware and includes all route modules.

### `config.py`
Configuration management using Pydantic Settings. Loads from environment variables and .env file. Centralized settings for CORS origins, API keys, and app settings.

### `routes/health.py`
Simple health check endpoint that returns the backend status for monitoring and debugging.

### `routes/query.py`
Core query endpoints:
- `POST /api/query`: Single image query with question
- `POST /api/query/change`: Before/after change detection

Handles file uploads and routes requests to the mock pipeline.

### `models/request.py`
Pydantic request models for validation and API documentation:
- `QueryRequest`: Single image query model
- `QueryChangeRequest`: Before/after change detection model

### `services/mock_service.py`
Complete mock pipeline implementation with:
- `GroundingTile`: Individual tile in the 3x3 grid
- `GroundingResult`: Complete grounding analysis
- `GeminiSimulator`: Question answering based on grounding
- `ChangeDetector`: Change detection logic
- `MockPipeline`: Orchestration of all components

---

## Development Workflow

### Adding New Endpoints

1. Create a new router file in `routes/`
2. Define your endpoint functions with proper docstrings
3. Include the router in `main.py`:
   ```python
   app.include_router(new_router.router, prefix=settings.api_prefix, tags=["tag_name"])
   ```

### Integrating Real Models

Replace the mock implementations in `services/mock_service.py`:

1. **Replace Grounding**: Integrate actual GeoRSCLIP model
2. **Replace Gemini**: Call real Google Gemini API
3. **Update Change Detection**: Use actual comparison logic

### Testing

The endpoints can be tested using:

**Swagger UI**: http://localhost:8000/docs (interactive testing)

**cURL** (command line):
```bash
# Health check
curl http://localhost:8000/api/health

# Single image query
curl -X POST http://localhost:8000/api/query \
  -F "file=@image.png" \
  -F "question=What do you see?"

# Change detection
curl -X POST http://localhost:8000/api/query/change \
  -F "before_file=@before.png" \
  -F "after_file=@after.png" \
  -F "before_question=What?" \
  -F "after_question=What now?"
```

**Python**:
```python
import requests

# Health check
response = requests.get("http://localhost:8000/api/health")
print(response.json())

# Single image query
files = {
    "file": open("image.png", "rb"),
}
data = {
    "question": "What agricultural areas are visible?"
}
response = requests.post("http://localhost:8000/api/query", files=files, data=data)
print(response.json())
```

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| FastAPI | 0.104.1 | Modern web framework |
| Uvicorn | 0.24.0 | ASGI server |
| Pydantic | 2.5.0 | Data validation |
| pydantic-settings | 2.1.0 | Settings management |
| python-dotenv | 1.0.0 | Environment variable loading |
| python-multipart | 0.0.6 | File upload handling |
| httpx | 0.25.2 | Async HTTP client |

---

## Next Steps

### Phase 1: Integration
- [ ] Connect frontend to `/api/query` endpoint
- [ ] Connect frontend to `/api/query/change` endpoint
- [ ] Test with actual satellite images

### Phase 2: Real Models
- [ ] Replace mock grounding with GeoRSCLIP model
- [ ] Integrate Google Gemini API
- [ ] Add model loading and caching

### Phase 3: Infrastructure
- [ ] Add database layer (PostgreSQL/MongoDB)
- [ ] Implement authentication (API keys/OAuth)
- [ ] Add rate limiting
- [ ] Set up error logging and monitoring

### Phase 4: Production
- [ ] Write comprehensive test suite (pytest)
- [ ] Create Docker configuration
- [ ] Set up CI/CD pipeline
- [ ] Deploy to cloud platform

---

## Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is already in use
lsof -i :8000

# Use a different port
python -m uvicorn main:app --port 8001 --reload
```

### CORS errors in frontend
Check that your frontend origin is in `config.py`:
```python
cors_origins: list = ["http://localhost:5173", "http://localhost:3000"]
```

### File upload issues
Ensure `python-multipart` is installed:
```bash
pip install python-multipart
```

### Import errors
Make sure you're running from the `backend` directory and dependencies are installed:
```bash
cd backend
pip install -r requirements.txt
```

---

## Architecture Diagram

```
Frontend (localhost:5173)
        ↓
    CORS Middleware
        ↓
    FastAPI Router
    ├── /api/health → Health Check
    ├── /api/query → Query Handler
    │   └── MockPipeline
    │       ├── GroundingResult (3x3 grid analysis)
    │       ├── GeminiSimulator (Q&A)
    │       └── Query History
    └── /api/query/change → Change Detection Handler
        └── MockPipeline
            ├── Before Grounding
            ├── After Grounding
            ├── ChangeDetector (comparison)
            └── Query History
```

---

## Support

For issues, questions, or feature requests, refer to:
- Interactive API docs: http://localhost:8000/docs
- Day 1 summary: `day1-final.html`
- Backend README: `backend/README.md`

---

## Team

- **Lakshya**: Backend development
- **Sai**: Grounding pipeline
- **Sid**: Gemini integration

---

**Build Date**: 2024-01-15  
**Status**: Ready for frontend integration  
**Version**: 1.0.0
