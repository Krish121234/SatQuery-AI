import argparse
import json
from collections import defaultdict

import torch
import open_clip
from huggingface_hub import hf_hub_download
from PIL import Image


# ---------------------------------------------------------------------------
# STEP: model loading (from notebook Section 2 — copied as-is)
# ---------------------------------------------------------------------------

def load_model():
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")

    clip_model, _, clip_preprocess = open_clip.create_model_and_transforms(
        "ViT-B-32", pretrained="openai"
    )
    clip_tokenizer = open_clip.get_tokenizer("ViT-B-32")

    ckpt_path = hf_hub_download(repo_id="Zilun/GeoRSCLIP", filename="ckpt/RS5M_ViT-B-32.pt")
    checkpoint = torch.load(ckpt_path, map_location="cpu")
    clip_model.load_state_dict(checkpoint, strict=False)

    clip_model = clip_model.to(device).eval()
    print("GeoRSCLIP model loaded.")

    return clip_model, clip_preprocess, clip_tokenizer, device


# ---------------------------------------------------------------------------
# STEP: image loading (rewritten from notebook Section 3 —
# replaces google.colab.files.upload() with a plain local file path)
# ---------------------------------------------------------------------------

def load_image(image_path: str) -> Image.Image:
    return Image.open(image_path).convert("RGB")


# ---------------------------------------------------------------------------
# STEP: labels, class names, grid size (from notebook Section 4 —
# copied as-is; do not reword the phrasing, CLIP is sensitive to it)
# ---------------------------------------------------------------------------

CANDIDATE_LABELS = [
    "a satellite image of dense forest or vegetation",
    "a satellite image of a water body such as a river or lake",
    "a satellite image of urban or built-up area with buildings",
    "a satellite image of agricultural farmland",
    "a satellite image of barren or bare land",
    "a satellite image of a road or transportation network",
]

CLASS_NAMES = [
    "forest",
    "water_body",
    "urban_builtup",
    "agricultural_land",
    "barren_land",
    "road",
]

GRID_SIZE = 4  # 4x4 grid = 16 tiles


# ---------------------------------------------------------------------------
# STEP: tile classification + grid splitting (from notebook Section 4 —
# copied as-is, model/preprocess/tokenizer now passed in as arguments
# instead of relying on notebook globals)
# ---------------------------------------------------------------------------

def classify_tile(tile_image, clip_model, clip_preprocess, clip_tokenizer, device):
    image_input = clip_preprocess(tile_image).unsqueeze(0).to(device)
    text_input = clip_tokenizer(CANDIDATE_LABELS).to(device)

    with torch.no_grad():
        image_features = clip_model.encode_image(image_input)
        text_features = clip_model.encode_text(text_input)
        image_features /= image_features.norm(dim=-1, keepdim=True)
        text_features /= text_features.norm(dim=-1, keepdim=True)
        probs = (100.0 * image_features @ text_features.T).softmax(dim=-1).cpu().numpy()[0]

    best_idx = probs.argmax()
    return CLASS_NAMES[best_idx], float(probs[best_idx])


def grid_classify_image(image, clip_model, clip_preprocess, clip_tokenizer, device, grid_size=GRID_SIZE):
    width, height = image.size
    tile_w = width // grid_size
    tile_h = height // grid_size

    results = []
    for row in range(grid_size):
        for col in range(grid_size):
            x_min = col * tile_w
            y_min = row * tile_h
            x_max = x_min + tile_w if col < grid_size - 1 else width
            y_max = y_min + tile_h if row < grid_size - 1 else height

            tile = image.crop((x_min, y_min, x_max, y_max))
            predicted_class, confidence = classify_tile(
                tile, clip_model, clip_preprocess, clip_tokenizer, device
            )

            results.append({
                "row": row,
                "col": col,
                "bbox": [x_min, y_min, x_max, y_max],
                "class": predicted_class,
                "confidence": round(confidence, 3),
            })
    return results


# ---------------------------------------------------------------------------
# STEP: aggregation into contract JSON (from notebook Section 5 — copied
# as-is. NOTE: this produces a "detections" (per-class, aggregated) shape,
# not a per-tile "tiles[]" shape. Confirm with Lakshya/Sid this is what
# api_contract.md actually expects before treating this as frozen.
# ---------------------------------------------------------------------------

def aggregate_to_grounding_json(tile_results, image_id="sample_001"):
    class_tile_counts = defaultdict(int)
    class_confidences = defaultdict(list)

    for t in tile_results:
        class_tile_counts[t["class"]] += 1
        class_confidences[t["class"]].append(t["confidence"])

    total_tiles = len(tile_results)
    detections = []
    for class_name, count in class_tile_counts.items():
        area_percent = round((count / total_tiles) * 100, 1)
        avg_confidence = round(sum(class_confidences[class_name]) / len(class_confidences[class_name]), 3)
        detections.append({
            "class": class_name,
            "confidence": avg_confidence,
            "area_percent": area_percent,
            "bbox": None,
        })

    detections.sort(key=lambda d: d["area_percent"], reverse=True)

    return {
        "image_id": image_id,
        "detections": detections,
    }


# ---------------------------------------------------------------------------
# STEP: schema check (new — added for Day 2's "JSON validates against
# schema" test requirement, not from the notebook)
# ---------------------------------------------------------------------------

def validate_output(result: dict):
    assert "image_id" in result, "Missing image_id"
    assert "detections" in result, "Missing detections"
    assert isinstance(result["detections"], list) and len(result["detections"]) > 0, \
        "detections must be a non-empty list"

    for d in result["detections"]:
        for key in ["class", "confidence", "area_percent", "bbox"]:
            assert key in d, f"Detection missing key: {key}"
        assert isinstance(d["confidence"], float), "confidence must be a float"
        assert isinstance(d["area_percent"], float), "area_percent must be a float"

    print("Validation passed: JSON structure matches schema.")


# ---------------------------------------------------------------------------
# STEP: entry point (rewritten from notebook Section 7 — replaces
# files.download() with a local file write, driven by CLI args)
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Run GeoRSCLIP grounding pipeline on one image")
    parser.add_argument("image_path", help="Path to the input image, e.g. image_01.jpg")
    parser.add_argument("--out", default="grounding_output.json", help="Path to write the output JSON")
    parser.add_argument("--image-id", default=None, help="Optional image_id to use in the output (defaults to filename)")
    args = parser.parse_args()

    clip_model, clip_preprocess, clip_tokenizer, device = load_model()
    image = load_image(args.image_path)

    tile_results = grid_classify_image(image, clip_model, clip_preprocess, clip_tokenizer, device)
    print(f"Classified {len(tile_results)} tiles.")

    image_id = args.image_id or args.image_path.split("/")[-1].split(".")[0]
    result = aggregate_to_grounding_json(tile_results, image_id=image_id)

    validate_output(result)

    output_json = json.dumps(result, indent=2)
    print(output_json)

    with open(args.out, "w") as f:
        f.write(output_json)
    print(f"Written to {args.out}")


if __name__ == "__main__":
    main()
