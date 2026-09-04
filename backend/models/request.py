"""
Request models for API endpoints
"""
from pydantic import BaseModel
from typing import Optional


class QueryRequest(BaseModel):
    """Request model for single image query"""
    question: str
    image: Optional[str] = None


class QueryChangeRequest(BaseModel):
    """Request model for before/after change detection"""
    before_question: str
    after_question: str
    before_image: Optional[str] = None
    after_image: Optional[str] = None
