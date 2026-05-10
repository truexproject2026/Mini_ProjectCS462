import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
import pickle
import base64
import io
from PIL import Image
import numpy as np
import os
from fastapi.middleware.cors import CORSMiddleware

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
# 1. การโหลดโมเดล
# ---------------------------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "current_model.pkl")
model = None

def load_model():
    global model
    try:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                model = pickle.load(f)
            print(f"--- โมเดลถูกโหลดแล้วจาก: {MODEL_PATH} ---")
            return True
        return False
    except Exception as e:
        print(f"--- โหลดโมเดลไม่สำเร็จ: {e} ---")
        return False

load_model()

# ---------------------------------------------------------
# 2. ฟังก์ชันปรับแต่งภาพ (Preprocessing)
# ---------------------------------------------------------
def preprocess_image(image):
    img = image.convert('L')
    img_array = np.array(img)
    inverted_img = 255 - img_array
    coords = np.column_stack(np.where(inverted_img > 30))
    
    if coords.size > 0:
        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)
        digit = img.crop((x_min, y_min, x_max + 1, y_max + 1))
        
        w, h = digit.size
        size = max(w, h) + 4
        new_img = Image.new('L', (size, size), 255)
        new_img.paste(digit, ((size - w) // 2, (size - h) // 2))
        img = new_img.resize((28, 28), Image.Resampling.LANCZOS)
    else:
        img = img.resize((28, 28))

    fn = lambda x : 255 if x > 180 else 0
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
        
        confidence = 0.0
        if hasattr(model, 'predict_proba'):
            probs = model.predict_proba(img_array)
            confidence = float(np.max(probs))

        return {"prediction": str(prediction), "confidence": confidence}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-model")
async def upload_model(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith('.pkl'):
            raise HTTPException(status_code=400, detail="ต้องเป็นไฟล์ .pkl เท่านั้น")
            
        with open(MODEL_PATH, "wb") as f:
            content = await file.read()
            f.write(content)
            
        if load_model():
            return {"status": "success", "filename": file.filename}
        else:
            return {"status": "error", "message": "โหลดโมเดลใหม่ไม่สำเร็จ"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reload-model")
async def reload_model():
    if load_model():
        return {"status": "success"}
    raise HTTPException(status_code=500, detail="Failed to reload")

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
