"""
Mock service implementing the full pipeline:
1. Sai's grounding pipeline - split image into 4x4 grid with classifications
2. Sid's Gemini integration - answer questions based on grounding data
3. Change detection - compare before/after grids
"""
import uuid
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from io import BytesIO
from PIL import Image
from .query_service import QueryRouter


def scale_grounding_output(
    grounding_json: Dict[str, Any],
    original_width: int,
    original_height: int
) -> Dict[str, Any]:
    """
    Scale Sai's grounding output to match actual image dimensions.

    Sai's model operates on a grid (e.g., 4x4) with bounding boxes in normalized
    or grid-relative coordinates. This function scales them to real pixel coordinates.

    Args:
        grounding_json: Raw output from Sai's grounding pipeline
        original_width: Original image width in pixels
        original_height: Original image height in pixels

    Returns:
        Scaled grounding JSON with corrected image_width, image_height, and bbox coords
    """
    # Extract grid dimensions from the grounding output
    grid_info = grounding_json.get("grid", {})
    grid_rows = grid_info.get("rows", 4)
    grid_cols = grid_info.get("cols", 4)

    # Calculate scale factors (internal grid to pixel coordinates)
    # If Sai's pipeline uses a 256x256 grid internally:
    # scale_x = original_width / 256, scale_y = original_height / 256
    # But if it uses grid units: scale_x = original_width / grid_cols, etc.
    scale_x = original_width / grid_cols
    scale_y = original_height / grid_rows

    # Scale the tiles
    scaled_tiles = []
    for tile in grounding_json.get("tiles", []):
        scaled_tile = tile.copy()

        if "bbox" in tile:
            # bbox format: [x_min, y_min, x_max, y_max]
            bbox = tile["bbox"]
            scaled_bbox = [
                int(bbox[0] * scale_x),
                int(bbox[1] * scale_y),
                int(bbox[2] * scale_x),
                int(bbox[3] * scale_y),
            ]
            scaled_tile["bbox"] = scaled_bbox

        scaled_tiles.append(scaled_tile)

    # Build the scaled output
    scaled_output = grounding_json.copy()
    scaled_output["tiles"] = scaled_tiles
    scaled_output["image_width"] = original_width
    scaled_output["image_height"] = original_height

    return scaled_output


class GroundingTile:
    """Represents a single tile from the 4x4 grounding grid"""

    CLASSES = ["Agriculture", "Water", "Vegetation", "Built-up", "Barren"]

    def __init__(self, tile_id: int, class_name: str, confidence: float, bbox: List[int]):
        self.tile_id = tile_id
        self.class_name = class_name
        self.confidence = confidence
        self.bbox = bbox  # [x_min, y_min, x_max, y_max]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tile_id": self.tile_id,
            "class": self.class_name,
            "confidence": round(self.confidence, 3),
            "bbox": self.bbox
        }


class GroundingResult:
    """Represents the grounding pipeline output (4x4 grid analysis)"""

    GRID_SIZE = 4  # 4x4 grid to match Sai's pipeline

    def __init__(self, image_name: str, image_width: int, image_height: int):
        self.image_name = image_name
        self.image_width = image_width
        self.image_height = image_height
        self.timestamp = datetime.utcnow().isoformat()
        self.tiles = self._generate_tiles()

    def _generate_tiles(self) -> List[GroundingTile]:
        """Generate mock 4x4 grid with random classifications and bounding boxes"""
        import random

        tiles = []
        tile_w = self.image_width // self.GRID_SIZE
        tile_h = self.image_height // self.GRID_SIZE

        tile_id = 0
        for row in range(self.GRID_SIZE):
            for col in range(self.GRID_SIZE):
                x_min = col * tile_w
                y_min = row * tile_h
                x_max = x_min + tile_w if col < self.GRID_SIZE - 1 else self.image_width
                y_max = y_min + tile_h if row < self.GRID_SIZE - 1 else self.image_height

                class_name = random.choice(GroundingTile.CLASSES)
                confidence = round(random.uniform(0.75, 0.99), 3)
                bbox = [x_min, y_min, x_max, y_max]

                tiles.append(
                    GroundingTile(
                        tile_id=tile_id,
                        class_name=class_name,
                        confidence=confidence,
                        bbox=bbox
                    )
                )
                tile_id += 1

        return tiles

    def get_summary(self) -> str:
        """Generate a text summary of the grounding result"""
        class_counts = {}
        for tile in self.tiles:
            class_counts[tile.class_name] = class_counts.get(tile.class_name, 0) + 1

        summary = "Grid analysis: "
        parts = []
        for class_name, count in sorted(class_counts.items()):
            parts.append(f"{count} tiles of {class_name}")
        summary += ", ".join(parts)
        return summary

    def to_dict(self) -> Dict[str, Any]:
        return {
            "image_id": self.image_name,
            "image_name": self.image_name,
            "image_width": self.image_width,
            "image_height": self.image_height,
            "timestamp": self.timestamp,
            "grid": {"rows": self.GRID_SIZE, "cols": self.GRID_SIZE},
            "tiles": [tile.to_dict() for tile in self.tiles],
            "summary": self.get_summary()
        }


class GeminiSimulator:
    """Wraps Sid's QueryRouter for answering questions with real Gemini integration"""

    def __init__(self):
        """Initialize the query router with Gemini client"""
        self.router = QueryRouter()

    def answer_question(self, question: str, grounding_data: Dict[str, Any]) -> str:
        """
        Use Sid's QueryRouter to answer a question based on grounding data.

        Args:
            question: User's natural language question
            grounding_data: The grounding result from Sai's pipeline

        Returns:
            Natural language answer from Gemini (or fallback)
        """
        return self.router.process_query(question, grounding_data)


class ChangeDetector:
    """Detects changes between before and after grounding results"""

    @staticmethod
    def detect_changes(
        before_grounding: GroundingResult,
        after_grounding: GroundingResult,
        before_question: str,
        after_question: str
    ) -> Dict[str, Any]:
        """
        Compare two grounding results and identify changes.

        Args:
            before_grounding: Grounding result from before image
            after_grounding: Grounding result from after image
            before_question: Question about before image
            after_question: Question about after image

        Returns:
            Dictionary with detailed change detection results
        """
        changes = []
        unchanged = 0

        # Compare each tile
        for i in range(9):
            before_tile = before_grounding.tiles[i]
            after_tile = after_grounding.tiles[i]

            if before_tile.class_name != after_tile.class_name:
                changes.append({
                    "tile_id": i,
                    "before_class": before_tile.class_name,
                    "after_class": after_tile.class_name,
                    "confidence_change": round(
                        after_tile.confidence - before_tile.confidence, 3
                    )
                })
            else:
                unchanged += 1

        # Generate summary
        change_summary = f"Detected {len(changes)} tile changes out of 9 tiles. {unchanged} tiles remained unchanged."

        if changes:
            change_details = []
            for change in changes:
                tile_num = change["tile_id"] + 1
                before = change["before_class"]
                after = change["after_class"]
                change_details.append(f"Tile {tile_num}: {before} → {after}")

            detailed_summary = change_summary + " Changes: " + "; ".join(change_details)
        else:
            detailed_summary = change_summary

        return {
            "change_count": len(changes),
            "unchanged_count": unchanged,
            "changes": changes,
            "summary": detailed_summary,
            "before_question": before_question,
            "after_question": after_question
        }


class MockPipeline:
    """Main mock pipeline orchestrating Sai's grounding and Sid's Gemini integration"""

    def __init__(self):
        self.query_history = []
        self.gemini = GeminiSimulator()

    @staticmethod
    def get_image_dimensions(image_data: bytes) -> tuple:
        """
        Extract image dimensions using PIL.

        Args:
            image_data: Image bytes

        Returns:
            Tuple of (width, height)
        """
        try:
            image = Image.open(BytesIO(image_data))
            return image.size  # Returns (width, height)
        except Exception as e:
            # Fallback to a default size if PIL fails
            raise ValueError(f"Failed to read image dimensions: {str(e)}")

    def process_query(
        self,
        image_data: bytes,
        question: str,
        filename: str
    ) -> Dict[str, Any]:
        """
        Process a single image query through the full pipeline.

        Pipeline:
        1. Extract image dimensions using PIL
        2. Run Sai's grounding pipeline (4x4 grid analysis)
        3. Scale grounding output to match original image dimensions
        4. Run Sid's Gemini simulator (answer question based on grounding)

        Args:
            image_data: Image bytes
            question: User's question
            filename: Original filename

        Returns:
            Dictionary with grounding data and answer
        """
        query_id = str(uuid.uuid4())[:8]

        # Step 1: Get image dimensions
        image_width, image_height = self.get_image_dimensions(image_data)

        # Step 2: Sai's grounding pipeline (with image dimensions)
        grounding = GroundingResult(
            image_name=filename,
            image_width=image_width,
            image_height=image_height
        )

        # Step 3: Scale grounding output (ensures coordinates match actual image)
        grounding_dict = grounding.to_dict()
        scaled_grounding = scale_grounding_output(
            grounding_json=grounding_dict,
            original_width=image_width,
            original_height=image_height
        )

        # Step 4: Sid's Gemini integration
        answer = self.gemini.answer_question(question, scaled_grounding)

        result = {
            "query_id": query_id,
            "filename": filename,
            "question": question,
            "grounding": scaled_grounding,
            "answer": answer,
            "timestamp": datetime.utcnow().isoformat()
        }

        self.query_history.append(result)
        return result

    def detect_changes(
        self,
        before_image: bytes,
        after_image: bytes,
        before_question: str,
        after_question: str,
        before_filename: str,
        after_filename: str
    ) -> Dict[str, Any]:
        """
        Detect changes between two satellite images.

        Pipeline:
        1. Extract dimensions from both images
        2. Run Sai's grounding on before image
        3. Run Sai's grounding on after image
        4. Scale both grounding outputs to match original image dimensions
        5. Compare and detect changes
        6. Generate natural language summary

        Args:
            before_image: Before image bytes
            after_image: After image bytes
            before_question: Question about before image
            after_question: Question about after image
            before_filename: Before image filename
            after_filename: After image filename

        Returns:
            Dictionary with before/after grounding and change analysis
        """
        change_id = str(uuid.uuid4())[:8]

        # Get image dimensions
        before_width, before_height = self.get_image_dimensions(before_image)
        after_width, after_height = self.get_image_dimensions(after_image)

        # Run grounding on both images
        before_grounding = GroundingResult(
            image_name=before_filename,
            image_width=before_width,
            image_height=before_height
        )
        after_grounding = GroundingResult(
            image_name=after_filename,
            image_width=after_width,
            image_height=after_height
        )

        # Scale grounding outputs
        scaled_before = scale_grounding_output(
            grounding_json=before_grounding.to_dict(),
            original_width=before_width,
            original_height=before_height
        )
        scaled_after = scale_grounding_output(
            grounding_json=after_grounding.to_dict(),
            original_width=after_width,
            original_height=after_height
        )

        # Detect changes
        change_detection = ChangeDetector.detect_changes(
            before_grounding=before_grounding,
            after_grounding=after_grounding,
            before_question=before_question,
            after_question=after_question
        )

        result = {
            "change_id": change_id,
            "before": {
                "filename": before_filename,
                "question": before_question,
                "image_width": before_width,
                "image_height": before_height,
                "grounding": scaled_before
            },
            "after": {
                "filename": after_filename,
                "question": after_question,
                "image_width": after_width,
                "image_height": after_height,
                "grounding": scaled_after
            },
            "change_detection": change_detection,
            "timestamp": datetime.utcnow().isoformat()
        }

        self.query_history.append(result)
        return result
