"""
Intent definitions for SatQuery AI - Query Understanding Layer.

This module defines the closed set of intents that any incoming
user question must be classified into before being routed to the
appropriate prompt template and grounding-data retrieval logic.

Design note: This is intentionally a CLOSED enum (not open-ended
free text) so that downstream routing logic (prompt selection,
JSON schema validation, etc.) can rely on exhaustive handling.
Any question that cannot be confidently mapped to one of the first
four categories MUST fall back to `UNSUPPORTED`.
"""

from enum import Enum


class QueryIntent(Enum):
    """
    Enumerates the five supported query intents for SatQuery AI.

    Each member represents a distinct class of user question about
    satellite-derived land cover data. The classifier (upstream of
    this module) is responsible for mapping raw natural language
    input to one of these members.
    """

    # Sample question: "What is the land cover class at this location?"
    # Intent: Direct, single-point classification lookup — the user
    # wants to know WHAT is present (e.g. Agriculture, Water, Urban)
    # without necessarily asking WHERE or comparing across time.
    LAND_COVER = "land_cover"

    # Sample question: "Where is the nearest water body in this grid?"
    # Intent: Spatial/location-seeking query — the user wants
    # coordinates, a bounding box, or a relative position for a
    # given land cover class within the analyzed grid.
    LAND_COVER_LOCATION = "land_cover_location"

    # Sample question: "Summarize the overall land cover distribution
    # in this region."
    # Intent: Aggregate/statistical overview — the user wants a
    # roll-up across all grid cells (e.g. percentage breakdown of
    # Agriculture vs Water vs Urban) rather than a single point.
    LAND_COVER_SUMMARY = "land_cover_summary"

    # Sample question: "How has this area changed between 2019 and 2023?"
    # Intent: Temporal comparison — the user wants a diff between two
    # (or more) time-stamped grounding datasets, highlighting class
    # transitions (e.g. Agriculture -> Urban).
    CHANGE_DETECTION = "change_detection"

    # Sample question: "What's the best crop to plant here?" or
    # "Is this a good investment location?"
    # Intent: Catch-all for anything outside the system's evidentiary
    # scope — questions requiring opinion, prediction, or domain
    # knowledge not present in the Grounding Facts JSON. Must always
    # be routed to a polite decline, never to a best-effort guess.
    UNSUPPORTED = "unsupported"

    @classmethod
    def values(cls) -> list[str]:
        """Convenience helper: returns all intent string values."""
        return [member.value for member in cls]

    def __str__(self) -> str:
        return self.value
