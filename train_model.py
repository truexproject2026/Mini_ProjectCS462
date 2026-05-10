import os
import numpy as np
from PIL import Image, ImageOps, ImageFilter
import pickle
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import ExtraTreesClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix
import json
import random

# ---------------------------------------------------------
# 1. การตั้งค่าพื้นฐาน (Configuration)
# ---------------------------------------------------------
DATASET_DIR = "dataset"
MODEL_PATH = "models/current_model.pkl"
METRICS_PATH = "models/metrics.json"
IMG_SIZE = (28, 28)
LABELS = ["๓๖", "๓๗", "๓๘", "๓๙", "๔๐"]

def preprocess_image(image):
    """
    V5 Update: เน้นเส้นหนาแบบธรรมชาติ (รูไม่ตัน หางไม่หาย)
    """
    # 1. แปลงเป็น Grayscale
    img = image.convert('L')
    
    # 2. Centering: หาขอบเขตตัวเลข
    img_array = np.array(img)
    inverted_img = 255 - img_array
    coords = np.column_stack(np.where(inverted_img > 30)) 
    
    if coords.size > 0:
        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)
        digit = img.crop((x_min, y_min, x_max + 1, y_max + 1))
        
        w, h = digit.size
        # เพิ่มขอบ (Padding) ให้สมดุล
        size = max(w, h) + 12
        new_img = Image.new('L', (size, size), 255)
        new_img.paste(digit, ((size - w) // 2, (size - h) // 2))
        
        # 3. เบ่งเส้นก่อนย่อเพื่อให้ความหนาคงที่ (ใช้ 3x3 filter ที่ถูกต้อง)
        # ทำแค่กับรูปที่ดูเส้นบาง (Threshold < 200)
        new_img = new_img.filter(ImageFilter.MinFilter(3))
        
        img = new_img.resize(IMG_SIZE, Image.Resampling.LANCZOS)
    else:
        img = img.resize(IMG_SIZE)

    # 4. Binary Thresholding (ปรับให้ดูนุ่มนวลขึ้นที่ 160)
    fn = lambda x : 255 if x > 160 else 0
    img = img.point(fn, mode='L')
    
    return img

# ---------------------------------------------------------
# 2. โหลดชุดข้อมูลและเพิ่มจำนวน (Load & Augment)
# ---------------------------------------------------------

def load_dataset():
    X = []
    y = []
    
    print("--- กำลังอ่านและเพิ่มจำนวนข้อมูล (V5: Natural Thickness) ---")
    
    for label in LABELS:
        label_dir = os.path.join(DATASET_DIR, label)
        if not os.path.exists(label_dir): continue
            
        for img_name in os.listdir(label_dir):
            if img_name.lower().endswith((".png", ".jpg")):
                img_path = os.path.join(label_dir, img_name)
                try:
                    raw_img = Image.open(img_path)
                    clean_img = preprocess_image(raw_img)
                    
                    # ๓๘ และ ๓๙ ยังปั๊มเยอะเหมือนเดิม
                    aug_count = 25 if label in ["๓๘", "๓๙"] else 15
                    
                    variants = []
                    variants.append(clean_img) 
                    
                    for _ in range(aug_count - 1):
                        v = clean_img
                        choice = random.choice(['rotate', 'shift', 'both', 'zoom'])
                        
                        if choice in ['rotate', 'both']:
                            angle = random.uniform(-10, 10)
                            v = v.rotate(angle, fillcolor=255)
                        
                        if choice in ['shift', 'both']:
                            tx = random.randint(-2, 2)
                            ty = random.randint(-2, 2)
                            shifted = Image.new('L', IMG_SIZE, 255)
                            shifted.paste(v, (tx, ty))
                            v = shifted

                        if choice == 'zoom':
                            zoom_factor = random.uniform(0.9, 1.1)
                            w, h = v.size
                            new_w, new_h = int(w * zoom_factor), int(h * zoom_factor)
                            v_resized = v.resize((new_w, new_h), Image.Resampling.LANCZOS)
                            v = Image.new('L', IMG_SIZE, 255)
                            v.paste(v_resized, ((IMG_SIZE[0]-new_w)//2, (IMG_SIZE[1]-new_h)//2))
                        
                        variants.append(v)
                    
                    for v in variants:
                        img_array = np.array(v).astype('float32') / 255.0
                        img_array = 1.0 - img_array
                        X.append(img_array.flatten())
                        y.append(label)
                        
                except Exception as e:
                    print(f"Error: {img_path} - {e}")
                    
    return np.array(X), np.array(y)

# ---------------------------------------------------------
# 3. การเทรน (Training)
# ---------------------------------------------------------

def train():
    X, y = load_dataset()
    if len(X) == 0: return print("Error: No data")

    print(f"จำนวนข้อมูลรวมหลัง Augmentation: {len(X)} รูป")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # 2. การสร้างโมเดล (V5: คุมขนาดให้เบาแต่ฉลาด)
    model = ExtraTreesClassifier(
        n_estimators=180, 
        max_depth=35,
        min_samples_leaf=1,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    
    print("--- กำลังเทรนโมเดล V5... ---")
    model.fit(X_train, y_train)

    # 5. ประเมินผล
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='weighted')
    
    metrics = {
        "accuracy": float(acc),
        "f1_score": float(f1),
        "labels": LABELS,
        "report": classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    }

    print(f"Final Accuracy: {acc:.4f} | F1: {f1:.4f}")

    # 6. บันทึกผล
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH, compress=9)
    
    with open(METRICS_PATH, 'w', encoding='utf-8') as f:
        json.dump(metrics, f, ensure_ascii=False, indent=4)
    print(f"--- บันทึกเรียบร้อย! ขนาดโมเดล: {os.path.getsize(MODEL_PATH)/1024/1024:.2f} MB ---")

if __name__ == "__main__":
    train()
