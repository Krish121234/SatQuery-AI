# -*- coding: utf-8 -*-
"""
change_detection/flood_detector.py

Determines whether a tile's class change qualifies as "flood" —
specifically a flip from any land class to water_body.

This is intentionally kept separate from diff.py so the flood-specific
rule can be adjusted or extended (e.g. adding other change types later)
without touching the core before/after comparison logic.
"""

# Any class that counts as "land" for flood-detection purposes.
# Must match CLASS_NAMES in grounding_pipeline.py minus water_body.
LAND_CLASSES = {
    "forest",
    "urban_builtup",
    "agricultural_land",
    "barren_land",
    "road",
}

WATER_CLASS = "water_body"


def is_flood_flip(before_class: str, after_class: str) -> bool:
    """True if a tile flipped from a land class to water — a flood signal."""
    return before_class in LAND_CLASSES and after_class == WATER_CLASS


def is_recession_flip(before_class: str, after_class: str) -> bool:
    """True if a tile flipped from water to a land class — water receding.
    Not asked for in the Day 5 task, but included since it's the natural
    inverse of a flood flip and diff.py may want it later.
    """
    return before_class == WATER_CLASS and after_class in LAND_CLASSES


def classify_change_type(changed_tile_details: list) -> str:
    """
    Given a list of {tile_id, before_class, after_class} dicts (only the
    tiles that actually changed), decide the overall change_type label
    for the whole before/after pair.

    Rule: if ANY tile shows a land-to-water flip, label the whole
    detection "flood". Otherwise, label it "land_cover_change" as a
    generic fallback.
    """
    if not changed_tile_details:
        return "no_change"

    flood_flips = [
        t for t in changed_tile_details
        if is_flood_flip(t["before_class"], t["after_class"])
    ]

    if flood_flips:
        return "flood"

    return "land_cover_change"
