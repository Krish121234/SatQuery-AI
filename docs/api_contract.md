# API Contract (Draft — finalize together on Day 1)

This is the shape of data passed between frontend ↔ backend ↔ grounding ↔ language layer.
Lock this early so frontend and backend can build in parallel against mock data.

## POST /api/query

**Request** (from frontend → backend)
```json
{
  "image_id": "sample_001",
  "question": "What percentage of this region is forest cover?"
}
```

## Grounding pipeline output (internal — backend calls grounding module)

```json
{
  "image_id": "sample_001",
  "detections": [
    {
      "class": "forest",
      "confidence": 0.91,
      "area_percent": 34.2,
      "bbox": null
    },
    {
      "class": "water_body",
      "confidence": 0.87,
      "area_percent": 8.5,
      "bbox": [120, 340, 210, 410]
    },
    {
      "class": "building",
      "confidence": 0.78,
      "count": 47,
      "bbox_list": [[10,20,30,40], [55,60,70,80]]
    }
  ]
}
```

## Language layer output (internal — backend calls language module with question + grounding JSON above)

```json
{
  "answer": "Approximately 34% of this region is covered by forest, based on the detected vegetation area.",
  "evidence": ["forest"],
  "confidence": "high"
}
```

## Final response (backend → frontend)

```json
{
  "image_id": "sample_001",
  "question": "What percentage of this region is forest cover?",
  "answer": "Approximately 34% of this region is covered by forest, based on the detected vegetation area.",
  "overlay": {
    "type": "highlight",
    "regions": [
      { "class": "forest", "area_percent": 34.2 }
    ]
  }
}
```

## Notes

- `bbox` format: `[x_min, y_min, x_max, y_max]` in pixel coordinates relative to the original image.
- Frontend should render `overlay.regions` as highlighted/colored areas or boxes on top of the source image.
- This contract will evolve — whoever changes it should ping the whole team, since both frontend and backend depend on it staying in sync.
