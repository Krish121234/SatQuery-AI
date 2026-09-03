import argparse
import json

import torch
import open_clip
from huggingface_hub import hf_hub_download
from PIL import Image


# ---- model loading (from notebook Section 2) -------------------------------

def load_model():
    device = "cuda" if torch.cuda.is_available() else "cpu"

    clip_model, _, clip_preprocess = open_clip.create_model_and_transforms(
        "ViT-B-32", pretrained="openai"
    )
    clip_tokenizer = open_clip.get_tokenizer("ViT-B-32")

    ckpt_path = hf_hub_download(repo_id="Zilun/GeoRSCLIP", filename="ckpt/RS5M_ViT-B-32.pt")
    checkpoint = torch.load(ckpt_path, map_location="cpu")
    clip_model.load_state_dict(checkpoint, strict=False)

    clip_model = clip_model.to(device).eval()
    return clip_model, clip_preprocess, clip_tokenizer, device


# ---- labels, class names, grid size (from notebook Section 4) --------------

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


# ---- tile classification + grid splitting (from notebook Section 4) --------

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

    tiles = []
    tile_id = 0
    for row in range(grid_size):
        for col in range(grid_size):
            x_min = col * tile_w
            y_min = row * tile_h
            x_max = x_min + tile_w if col < grid_size - 1 else width
            y_max = y_min + tile_h if row < grid_size - 1 else height

            tile_img = image.crop((x_min, y_min, x_max, y_max))
            predicted_class, confidence = classify_tile(
                tile_img, clip_model, clip_preprocess, clip_tokenizer, device
            )

            tiles.append({
                "tile_id": tile_id,
                "class": predicted_class,
                "confidence": round(confidence, 3),
                "bbox": [x_min, y_min, x_max, y_max],
            })
            tile_id += 1

    return tiles


# ---- assemble output matching the Day 2 task shape --------------------------

def summarize(tiles):
    counts = {}
    for t in tiles:
        counts[t["class"]] = counts.get(t["class"], 0) + 1
    return counts


def build_output(tiles, image_id, grid_size):
    return {
        "image_id": image_id,
        "grid": {"rows": grid_size, "cols": grid_size},
        "tiles": tiles,
        "summary": summarize(tiles),
    }


def validate_output(result):
    for key in ["image_id", "grid", "tiles", "summary"]:
        assert key in result, f"Missing key: {key}"
    for t in result["tiles"]:
        for key in ["tile_id", "class", "confidence", "bbox"]:
            assert key in t, f"Tile missing key: {key}"
    print("Validation passed: JSON structure matches schema.")


# ---- entry point -------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("image_path")
    parser.add_argument("--out", default="grounding_output.json")
    args = parser.parse_args()

    clip_model, clip_preprocess, clip_tokenizer, device = load_model()
    image = Image.open(args.image_path).convert("RGB")

    tiles = grid_classify_image(image, clip_model, clip_preprocess, clip_tokenizer, device)
    image_id = args.image_path.split("/")[-1].split(".")[0]
    result = build_output(tiles, image_id, GRID_SIZE)

    validate_output(result)

    output_json = json.dumps(result, indent=2)
    print(output_json)

    with open(args.out, "w") as f:
        f.write(output_json)
    print(f"Written to {args.out}")


if __name__ == "__main__":
    main()

