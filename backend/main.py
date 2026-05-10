import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import joblib
import base64
import io
from PIL import Image
import numpy as np
import os
import json
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

app = FastAPI()

# ---------------------------------------------------------
# 0. CORS Configuration
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# 1. การจัดการ Path และโมเดล
# ---------------------------------------------------------
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR) if os.path.basename(CURRENT_DIR) == 'backend' else CURRENT_DIR
MODELS_DIR = os.path.join(BASE_DIR, "models")

if not os.path.exists(MODELS_DIR):
    os.makedirs(MODELS_DIR)

MODEL_PATH = os.path.join(MODELS_DIR, "current_model.pkl")
METRICS_PATH = os.path.join(MODELS_DIR, "metrics.json")

model = None

def load_model():
    global model
    try:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
            print(f"--- Loaded Model (Joblib): {MODEL_PATH} ---")
            return True
        print(f"--- Model not found at: {MODEL_PATH} ---")
        return False
    except Exception as e:
        print(f"--- Load Error: {e} ---")
        return False

load_model()

# ---------------------------------------------------------
# 2. ฟังก์ชันปรับแต่งภาพ (Preprocessing)
# ---------------------------------------------------------
def preprocess_image(image):
    # 1. แปลงเป็น Grayscale
    img = image.convert('L')
    
    # 2. Centering: หาขอบเขตตัวเลขและวางกึ่งกลาง
    img_array = np.array(img)
    inverted_img = 255 - img_array
    coords = np.column_stack(np.where(inverted_img > 40)) 
    
    if coords.size > 0:
        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)
        digit = img.crop((x_min, y_min, x_max + 1, y_max + 1))
        
        w, h = digit.size
        # เพิ่มขอบเป็น 10 พิกเซล (V2) เพื่อให้หางเลข ๓๘, ๓๙ ไม่โดนตัด
        size = max(w, h) + 10
        new_img = Image.new('L', (size, size), 255)
        new_img.paste(digit, ((size - w) // 2, (size - h) // 2))
        img = new_img.resize((28, 28), Image.Resampling.LANCZOS)
    else:
        img = img.resize((28, 28))

    # 3. Binary Thresholding: ทำให้เป็นขาวดำสนิท (V2 ปรับเข้มขึ้นเป็น 190)
    fn = lambda x : 255 if x > 190 else 0
    img = img.point(fn, mode='L')
    
    return img

class ImageInput(BaseModel):
    image_data: str

@app.post("/predict")
async def predict(input_data: ImageInput):
    if model is None:
        return {"prediction": "ไม่พบโมเดล", "confidence": 0.0}
    try:
        header, encoded = input_data.image_data.split(",", 1)
        image_bytes = base64.b64decode(encoded)
        raw_image = Image.open(io.BytesIO(image_bytes))
        processed_img = preprocess_image(raw_image)
        img_array = np.array(processed_img).astype('float32') / 255.0
        img_array = 1.0 - img_array
        img_array = img_array.reshape(1, -1)
        prediction = model.predict(img_array)[0]
        confidence = float(np.max(model.predict_proba(img_array))) if hasattr(model, 'predict_proba') else 0.0
        return {"prediction": str(prediction), "confidence": confidence}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-model")
async def upload_model(file: UploadFile = File(...), metrics_file: Optional[UploadFile] = File(None)):
    try:
        with open(MODEL_PATH, "wb") as f:
            content = await file.read()
            f.write(content)
        
        if metrics_file:
            content = await metrics_file.read()
            with open(METRICS_PATH, "wb") as f:
                f.write(content)
        
        if load_model():
            return {"status": "success", "has_metrics": metrics_file is not None}
        return {"status": "error", "message": "โหลดโมเดลใหม่ล้มเหลว"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/metrics")
async def get_metrics():
    if os.path.exists(METRICS_PATH):
        with open(METRICS_PATH, 'r', encoding='utf-8') as f:
            return {"status": "success", "metrics": json.load(f)}
    return {"status": "error", "message": f"ไม่พบไฟล์ที่ {METRICS_PATH}"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
