"""
Query routes - handles satellite image querying and change detection with real GeoRSCLIP
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
try:
    from ..services.grounding_service import GroundingService
except ImportError:
    from services.grounding_service import GroundingService

router = APIRouter()
service = GroundingService()


@router.post("/query")
async def query_image(
    question: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Process a satellite image query.

    Takes an image and a user question, runs through the real GeoRSCLIP pipeline:
    1. Sai's GeoRSCLIP grounding pipeline - 8x8 (64-tile) zero-shot satellite land-cover classification
    2. Sid's Gemini 2.0 integration - answers the question grounded in tile telemetry

    Args:
        question: User's natural language question about the image
        file: Satellite image file to analyze

    Returns:
        dict: Grounding data (64 tiles with classifications, confidences, bboxes) and answer
    """
    try:
        # Read the uploaded file
        contents = await file.read()

        if not contents:
            raise HTTPException(status_code=400, detail="File is empty")

        # Process through real GeoRSCLIP pipeline
        result = service.process_query(
            image_data=contents,
            question=question,
            filename=file.filename or "satellite_image.jpg"
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

    Takes two images and optional questions, runs through the GeoRSCLIP pipeline:
    1. Process both images through GeoRSCLIP 8x8 zero-shot classification
    2. Compare tile-by-tile transitions and evaluate flood flips
    3. Return structured change telemetry and natural language summary

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

        # Process through real pipeline
        result = service.detect_changes(
            before_image=before_contents,
            after_image=after_contents,
            before_question=before_question,
            after_question=after_question,
            before_filename=before_file.filename or "before_epoch.jpg",
            after_filename=after_file.filename or "after_epoch.jpg"
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
