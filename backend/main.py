from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import torch
import numpy as np
import cv2
import segmentation_models_pytorch as smp
import base64
from io import BytesIO
from PIL import Image

app = FastAPI(title="GeoVision Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Backend berjalan menggunakan: {device}")

model = smp.Unet(
    encoder_name="resnet34",
    encoder_weights=None,
    in_channels=3,
    classes=6 
)

model.load_state_dict(torch.load("model_tata_kota_6_kelasV3.pth", map_location=device))
model.to(device)
model.eval()

warna_kelas = {
    0: [60, 16, 152],   # Bangunan (Biru Tua)
    1: [132, 41, 246],  # Tanah (Ungu)
    2: [110, 193, 228], # Jalan (Biru Muda)
    3: [254, 221, 58],  # Pohon (Kuning)
    4: [226, 169, 41],  # Air (Mustard)
    5: [155, 155, 155]  # Unlabeled (Abu-abu)
}
nama_kelas = ["Bangunan", "Tanah", "Jalanan", "Vegetasi", "Perairan", "Lainnya"]
palette = np.array(list(warna_kelas.values()), dtype=np.uint8)

@app.post("/predict/")
async def predict_city(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    image_res = cv2.resize(image, (256, 256), interpolation=cv2.INTER_LINEAR)
    
    img_normalized = image_res.astype(np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    img_normalized = (img_normalized - mean) / std
    
    img_tensor = torch.from_numpy(img_normalized.transpose(2, 0, 1)).float()
    img_tensor = img_tensor.unsqueeze(0).to(device)
    
    model.eval()
    with torch.no_grad():
        output = model(img_tensor)
        prediksi_index = torch.argmax(output, dim=1).squeeze().cpu().numpy()

    mask_rgb = palette[prediksi_index]
    
    total_piksel = 256 * 256
    statistik = {}
    for idx, nama in enumerate(nama_kelas):
        jumlah_piksel_kelas = np.sum(prediksi_index == idx)
        persentase = (jumlah_piksel_kelas / total_piksel) * 100
        statistik[nama] = round(persentase, 2)
        
    mask_pil = Image.fromarray(mask_rgb.astype(np.uint8))
    buffered = BytesIO()
    mask_pil.save(buffered, format="PNG")
    mask_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    return {
        "status": "success",
        "mask_base64": f"data:image/png;base64,{mask_base64}",
        "statistik_kota": statistik
    }