"""
Query routes - handles satellite image querying and change detection
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from models.request import QueryRequest, QueryChangeRequest
from services.mock_service import MockPipeline

router = APIRouter()
pipeline = MockPipeline()


@router.post("/query")
async def query_image(
    question: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Process a satellite image query.

    Takes an image and a user question, runs through the mock pipeline:
    1. Sai's grounding pipeline - analyzes the image
    2. Sid's Gemini integration - answers the question

    Args:
        question: User's natural language question about the image
        file: Satellite image file to analyze

    Returns:
        dict: Grounding data (tiles with classifications) and answer
    """
    try:
        # Read the uploaded file
        contents = await file.read()

        if not contents:
            raise HTTPException(status_code=400, detail="File is empty")

        # Process through pipeline
        result = pipeline.process_query(
            image_data=contents,
            question=question,
            filename=file.filename
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query/change")
async def detect_change(
    before_question: str = Form(""),
    after_question: str = Form(""),
    before_file: UploadFile = File(...),
    after_file: UploadFile = File(...)
):
    """
    Detect changes between two satellite images (before/after).

    Takes two images and optional questions, runs through the mock pipeline:
    1. Process both images through grounding pipeline
    2. Compare the grids and detect changes
    3. Return a natural language summary of changes

    Args:
        before_question: Question about the before image
        after_question: Question about the after image
        before_file: Before satellite image
        after_file: After satellite image

    Returns:
        dict: Before grounding, after grounding, and change summary
    """
    try:
        # Read both files
        before_contents = await before_file.read()
        after_contents = await after_file.read()

        if not before_contents or not after_contents:
            raise HTTPException(status_code=400, detail="One or both files are empty")

        # Process through pipeline
        result = pipeline.detect_changes(
            before_image=before_contents,
            after_image=after_contents,
            before_question=before_question,
            after_question=after_question,
            before_filename=before_file.filename,
            after_filename=after_file.filename
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
