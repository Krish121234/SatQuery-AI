# SatQuery-AI Backend

A FastAPI-based backend service for satellite image querying and processing.

## Project Structure

```
backend/
├── main.py              # FastAPI application with all endpoints
├── mock_service.py      # Mock query service for development
├── requirements.txt     # Python dependencies
├── __init__.py          # Package initialization
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the Backend

```bash
python -m uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check
- **GET** `/api/health`
  - Returns service status and version
  - **Response**: `{"status": "healthy", "version": "1.0.0", "service": "SatQuery-AI Backend"}`

### Submit Query
- **POST** `/api/query`
  - Submit a new satellite query
  - **Request Body**:
    ```json
    {
      "location": "San Francisco, CA",
      "date_range": {
        "start": "2024-01-01",
        "end": "2024-01-31"
      },
      "query_type": "satellite_imagery",
      "parameters": {
        "cloud_cover_max": 20,
        "resolution": "10m"
      }
    }
    ```
  - **Response**:
    ```json
    {
      "query_id": "a1b2c3d4",
      "status": "completed",
      "location": "San Francisco, CA",
      "results": {
        "images": 12,
        "resolution": "10m",
        "cloud_cover": 15.5,
        "coverage_percentage": 85.0,
        "source": "Sentinel-2",
        ...
      },
      "message": "Successfully queried satellite imagery for San Francisco, CA"
    }
    ```

### Change Query
- **POST** `/api/query/change`
  - Modify parameters of an existing query
  - **Request Body**:
    ```json
    {
      "query_id": "a1b2c3d4",
      "parameters": {
        "cloud_cover_max": 15,
        "resolution": "5m"
      },
      "reason": "Need higher resolution imagery"
    }
    ```
  - **Response**:
    ```json
    {
      "query_id": "a1b2c3d4",
      "status": "updated",
      "message": "Query a1b2c3d4 updated successfully",
      "updated_parameters": {
        "cloud_cover_max": 15,
        "resolution": "5m"
      }
    }
    ```

## Features

### CORS Support
- Cross-Origin Resource Sharing is enabled for all origins
- Configured for development; in production, specify allowed origins

### Request Validation
- Pydantic models for request/response validation
- Type hints throughout for better IDE support
- Clear error messages for invalid requests

### Mock Service
- In-memory query storage for development
- Realistic satellite imagery mock data
- Query lifecycle management (create, update, retrieve)

### Logging
- Comprehensive logging for debugging
- Logged at INFO level by default

## Documentation

### Interactive API Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Development Notes

### Mock Service Features

The `MockQueryService` provides:
- `execute_query()` - Process a new satellite query
- `update_query()` - Modify query parameters
- `get_query()` - Retrieve a specific query
- `list_queries()` - Get recent queries
- `delete_query()` - Remove a query
- `clear_all_queries()` - Reset for testing

### Error Handling

- HTTP 400: Bad Request (invalid input)
- HTTP 404: Not Found (query doesn't exist)
- HTTP 500: Internal Server Error

All errors return JSON responses with error details.

## Next Steps

1. **Frontend Integration**: Connect the frontend to these endpoints
2. **Real Query Service**: Replace `MockQueryService` with actual satellite API integration
3. **Database**: Add persistence layer (PostgreSQL, MongoDB, etc.)
4. **Authentication**: Add API key or OAuth authentication
5. **Rate Limiting**: Implement rate limiting for production
6. **Testing**: Add pytest test suite
7. **Deployment**: Configure Docker and deployment pipeline

## Dependencies

- **FastAPI** (0.104.1): Modern Python web framework
- **Uvicorn** (0.24.0): ASGI server
- **Pydantic** (2.5.0): Data validation
- **Python-dotenv** (1.0.0): Environment variable management
- **httpx** (0.25.2): Async HTTP client (for future integrations)

