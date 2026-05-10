import os
import numpy as np
from PIL import Image, ImageOps, ImageFilter
import pickle
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
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
    ฟังก์ชันปรับแต่งภาพระดับสูง:
    - หาขอบเขตและจัดกึ่งกลาง
    - ทำ Thresholding (ทำให้เป็นขาวดำสนิท)
    """
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
        # เพิ่มขอบเป็น 10 พิกเซล เพื่อให้หางเลข ๓๘, ๓๙ ไม่โดนตัด
        size = max(w, h) + 10
        new_img = Image.new('L', (size, size), 255)
        new_img.paste(digit, ((size - w) // 2, (size - h) // 2))
        img = new_img.resize(IMG_SIZE, Image.Resampling.LANCZOS)
    else:
        img = img.resize(IMG_SIZE)

    # 3. Binary Thresholding: ทำให้เป็นขาวดำสนิท (ปรับเข้มขึ้นเป็น 190)
    fn = lambda x : 255 if x > 190 else 0
    img = img.point(fn, mode='L')
    
    return img

# ---------------------------------------------------------
# 2. โหลดชุดข้อมูลและเพิ่มจำนวน (Load & Augment)
# ---------------------------------------------------------

def load_dataset():
    X = []
    y = []
    
    print("--- กำลังอ่านและเพิ่มจำนวนข้อมูล (Augmentation) ---")
    
    # นับจำนวนรูปภาพในแต่ละคลาส
    class_counts = {}
    for label in LABELS:
        label_dir = os.path.join(DATASET_DIR, label)
        if os.path.exists(label_dir):
            count = len([f for f in os.listdir(label_dir) if f.lower().endswith((".png", ".jpg"))])
            class_counts[label] = count
    
    print(f"จำนวนรูปภาพต้นฉบับ: {class_counts}")

    for label in LABELS:
        label_dir = os.path.join(DATASET_DIR, label)
        if not os.path.exists(label_dir): continue
            
        for img_name in os.listdir(label_dir):
            if img_name.lower().endswith((".png", ".jpg")):
                img_path = os.path.join(label_dir, img_name)
                try:
                    raw_img = Image.open(img_path)
                    clean_img = preprocess_image(raw_img)
                    
                    # ปรับ Augmentation ตามความยากและจำนวนข้อมูล
                    if label in ["๓๘", "๓๙", "๔๐"]:
                        aug_count = 25 
                    else:
                        aug_count = 12 
                    
                    variants = []
                    variants.append(clean_img) 
                    
                    for _ in range(aug_count - 1):
                        v = clean_img
                        choice = random.choice(['rotate', 'shift', 'both', 'zoom'])
                        
                        if choice in ['rotate', 'both']:
                            # เลข 38/39 ไม่ควรหมุนเยอะเกินไปเดี๋ยวหางเพี้ยน
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
                        img_array = 1.0 - img_array # เส้น=1, พื้น=0
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

    # 1. การแบ่งข้อมูล
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # 2. การสร้างโมเดล (ปรับจูนให้ฉลาดขึ้น แต่ยังคุม RAM)
    # เพิ่ม n_estimators เป็น 300 และ max_depth เป็น 35
    model = RandomForestClassifier(
        n_estimators=300, 
        max_depth=35,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    
    # 3. Cross-validation
    print("--- กำลังทำ Cross-validation (5-Fold)... ---")
    cv_scores = cross_val_score(model, X, y, cv=5)
    print(f"Cross-validation Accuracy: {cv_scores.mean():.4f}")

    # 4. การเทรนโมเดลจริง
    print("--- กำลังเทรนโมเดล... ---")
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
