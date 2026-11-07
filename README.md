# GeoVision AI

GeoVision AI is a smart-city image segmentation application that analyzes satellite imagery and classifies pixels into urban and environmental categories.

Repository: https://github.com/ranggays/geovision

## Main features

- Upload two satellite images for analysis.
- Send images to a prediction API.
- Generate a semantic segmentation mask for the uploaded image.
- Display class-level pixel statistics for the analyzed image.
- Present the result through a Next.js frontend.

## Model and classes

The backend uses a U-Net model with a ResNet34 encoder through `segmentation_models_pytorch`. Images are resized to 256 × 256 pixels, normalized, and processed with PyTorch.

The six output classes are:

- Buildings
- Land
- Roads
- Vegetation
- Water
- Other/unlabeled areas

## Architecture and technologies

- Frontend: Next.js, React, TypeScript, and Tailwind CSS.
- Backend: FastAPI and Python.
- Machine learning: PyTorch, U-Net, `segmentation_models_pytorch`, NumPy, OpenCV, and Pillow.

## Repository structure

```text
geovision/
├── backend/     FastAPI prediction endpoint and model inference
└── frontend/    Next.js upload and result interface
```

## API

The backend exposes `POST /predict/`. It accepts an uploaded image, performs segmentation, and returns a base64-encoded PNG mask together with class percentage statistics.
