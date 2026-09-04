"""
Health check routes
"""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint to verify the backend is running.

    Returns:
        dict: Status of the backend service
    """
    return {
        "status": "healthy",
        "message": "SatQuery-AI backend is running"
    }
