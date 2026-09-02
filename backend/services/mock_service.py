"""
Mock service implementing the full pipeline:
1. Sai's grounding pipeline - split image into 3x3 grid with classifications
2. Sid's Gemini integration - answer questions based on grounding data
3. Change detection - compare before/after grids
"""
import uuid
import json
from datetime import datetime
from typing import Dict, List, Any, Optional


class GroundingTile:
    """Represents a single tile from the 3x3 grounding grid"""

    CLASSES = ["Agriculture", "Water", "Vegetation", "Built-up", "Barren"]

    def __init__(self, tile_id: int, class_name: str, confidence: float):
        self.tile_id = tile_id
        self.class_name = class_name
        self.confidence = confidence

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tile_id": self.tile_id,
            "class": self.class_name,
            "confidence": round(self.confidence, 3)
        }


class GroundingResult:
    """Represents the grounding pipeline output (3x3 grid analysis)"""

    def __init__(self, image_name: str):
        self.image_name = image_name
        self.tiles = self._generate_tiles()
        self.timestamp = datetime.utcnow().isoformat()

    def _generate_tiles(self) -> List[GroundingTile]:
        """Generate mock 3x3 grid with random classifications"""
        import random

        tiles = []
        # Create 9 tiles for 3x3 grid
        for i in range(9):
            class_name = random.choice(GroundingTile.CLASSES)
            confidence = round(random.uniform(0.75, 0.99), 3)
            tiles.append(GroundingTile(tile_id=i, class_name=class_name, confidence=confidence))

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
            "image_name": self.image_name,
            "timestamp": self.timestamp,
            "grid_size": "3x3",
            "tiles": [tile.to_dict() for tile in self.tiles],
            "summary": self.get_summary()
        }


class GeminiSimulator:
    """Simulates Sid's Gemini integration for answering questions"""

    @staticmethod
    def answer_question(question: str, grounding_data: Dict[str, Any]) -> str:
        """
        Simulate Gemini answering a question based on grounding data.

        Args:
            question: User's natural language question
            grounding_data: The grounding result from Sai's pipeline

        Returns:
            Natural language answer based on the grounding data
        """
        summary = grounding_data.get("summary", "")

        # Generate contextual answer based on question keywords
        if "agriculture" in question.lower() or "farm" in question.lower():
            return f"Based on satellite analysis, {summary}. The area shows significant agricultural presence with several tiles classified as Agriculture."

        elif "water" in question.lower() or "lake" in question.lower() or "river" in question.lower():
            return f"Analyzing the satellite imagery, {summary}. Water bodies are detected in the region as shown in the grounding tiles."

        elif "vegetation" in question.lower() or "forest" in question.lower() or "green" in question.lower():
            return f"The satellite data indicates {summary}. Vegetation coverage is present across multiple tiles in the analyzed region."

        elif "built" in question.lower() or "urban" in question.lower() or "city" in question.lower() or "development" in question.lower():
            return f"Urban analysis shows {summary}. Built-up areas are identified with the corresponding confidence levels shown in the grounding tiles."

        elif "change" in question.lower() or "difference" in question.lower():
            return f"Comparing the imagery, {summary}. Changes in land classification are visible across the grid tiles."

        else:
            # Generic answer
            return f"Based on the satellite grounding analysis, {summary}. The image shows diverse land classifications across the 3x3 grid."


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

    def process_query(
        self,
        image_data: bytes,
        question: str,
        filename: str
    ) -> Dict[str, Any]:
        """
        Process a single image query through the full pipeline.

        Pipeline:
        1. Run Sai's grounding pipeline (3x3 grid analysis)
        2. Run Sid's Gemini simulator (answer question based on grounding)

        Args:
            image_data: Image bytes
            question: User's question
            filename: Original filename

        Returns:
            Dictionary with grounding data and answer
        """
        query_id = str(uuid.uuid4())[:8]

        # Step 1: Sai's grounding pipeline
        grounding = GroundingResult(image_name=filename)

        # Step 2: Sid's Gemini integration
        answer = GeminiSimulator.answer_question(question, grounding.to_dict())

        result = {
            "query_id": query_id,
            "filename": filename,
            "question": question,
            "grounding": grounding.to_dict(),
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
        1. Run Sai's grounding on before image
        2. Run Sai's grounding on after image
        3. Compare and detect changes
        4. Generate natural language summary

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

        # Step 1 & 2: Run grounding on both images
        before_grounding = GroundingResult(image_name=before_filename)
        after_grounding = GroundingResult(image_name=after_filename)

        # Step 3: Detect changes
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
                "grounding": before_grounding.to_dict()
            },
            "after": {
                "filename": after_filename,
                "question": after_question,
                "grounding": after_grounding.to_dict()
            },
            "change_detection": change_detection,
            "timestamp": datetime.utcnow().isoformat()
        }

        self.query_history.append(result)
        return result
