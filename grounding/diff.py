# -*- coding: utf-8 -*-
"""
change_detection/diff.py

Compares two grounding JSON files (output of grounding_pipeline.py) for
the same location's before/after images, and produces change.json
matching the Day 5 contract:

    {
        "change_type": "flood" | "land_cover_change" | "no_change",
        "changed_tiles": [tile_id, tile_id, ...],
        "summary": {
            "changed_area_percent": float,
            "total_tiles": int,
            "changed_tile_count": int
        }
    }

Usage:
    python diff.py before.json after.json --out change.json
"""

import argparse
import json

from flood_detector import classify_change_type


def load_grounding_json(path: str) -> dict:
    with open(path, "r") as f:
        return json.load(f)


def check_alignment(before: dict, after: dict):
    """
    Sanity check: before/after must be the same grid over the same
    dimensions for a tile-by-tile diff to be valid. Tanaya's Day 5 job
    is to guarantee this — this check catches it if something slipped.
    """
    if before["image_width"] != after["image_width"] or before["image_height"] != after["image_height"]:
        raise ValueError(
            f"Image dimensions don't match: before={before['image_width']}x{before['image_height']}, "
            f"after={after['image_width']}x{after['image_height']}. "
            "Before/after pair must be aligned to the same dimensions."
        )

    if before["grid"] != after["grid"]:
        raise ValueError(
            f"Grid sizes don't match: before={before['grid']}, after={after['grid']}. "
            "Both images must be run through the pipeline with the same GRID_SIZE."
        )

    if len(before["tiles"]) != len(after["tiles"]):
        raise ValueError(
            f"Tile counts don't match: before has {len(before['tiles'])}, "
            f"after has {len(after['tiles'])}."
        )


def diff_tiles(before: dict, after: dict) -> list:
    """
    Compare tiles by tile_id and return details for every tile whose
    class changed between before and after.
    """
    after_by_id = {t["tile_id"]: t for t in after["tiles"]}

    changed = []
    for before_tile in before["tiles"]:
        tile_id = before_tile["tile_id"]
        after_tile = after_by_id.get(tile_id)

        if after_tile is None:
            # Shouldn't happen if check_alignment passed, but guard anyway.
            continue

        if before_tile["class"] != after_tile["class"]:
            changed.append({
                "tile_id": tile_id,
                "before_class": before_tile["class"],
                "after_class": after_tile["class"],
            })

    return changed


def build_change_json(before: dict, after: dict) -> dict:
    check_alignment(before, after)

    changed_tile_details = diff_tiles(before, after)
    change_type = classify_change_type(changed_tile_details)

    total_tiles = len(before["tiles"])
    changed_count = len(changed_tile_details)
    changed_area_percent = round((changed_count / total_tiles) * 100, 1) if total_tiles else 0.0

    # Per Arka's confirmed format: changed_tiles is a plain array of tile_ids,
    # not full objects. Frontend looks up bbox from its own afterGroundingData.
    changed_tiles = [t["tile_id"] for t in changed_tile_details]

    return {
        "change_type": change_type,
        "changed_tiles": changed_tiles,
        "summary": {
            "changed_area_percent": changed_area_percent,
            "total_tiles": total_tiles,
            "changed_tile_count": changed_count,
        },
    }


def validate_output(result: dict):
    for key in ["change_type", "changed_tiles", "summary"]:
        assert key in result, f"Missing key: {key}"
    assert isinstance(result["changed_tiles"], list), "changed_tiles must be a list"
    for key in ["changed_area_percent", "total_tiles", "changed_tile_count"]:
        assert key in result["summary"], f"Missing summary key: {key}"
    print("Validation passed: change.json structure is correct.")


def main():
    parser = argparse.ArgumentParser(description="Diff two grounding JSON files and produce change.json")
    parser.add_argument("before_json", help="Path to the before image's grounding JSON")
    parser.add_argument("after_json", help="Path to the after image's grounding JSON")
    parser.add_argument("--out", default="change.json", help="Path to write the output change.json")
    args = parser.parse_args()

    before = load_grounding_json(args.before_json)
    after = load_grounding_json(args.after_json)

    result = build_change_json(before, after)
    validate_output(result)

    output_json = json.dumps(result, indent=2)
    print(output_json)

    with open(args.out, "w") as f:
        f.write(output_json)
    print(f"Written to {args.out}")


if __name__ == "__main__":
    main()
