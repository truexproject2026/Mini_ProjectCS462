import sys
import os
import types

# --- EMERGENCY WORKAROUND FOR CORRUPTED PYTHON ENVIRONMENT ---
# This system has Null Byte corruption in core libraries (asyncio, email, etc.)
# and is missing distutils (Python 3.14). We must mock these to allow imports.

def apply_workarounds():
    site_packages = os.path.join(os.path.dirname(sys.executable), "Lib", "site-packages")
    if site_packages not in sys.path:
        sys.path.append(site_packages)
    
    # Mock modules that are corrupted or missing
    broken_modules = [
        "asyncio", "asyncio.windows_events", "asyncio.windows_utils",
        "distutils", "distutils.version", "email", "email.headerregistry"
    ]
    for mod_name in broken_modules:
        if mod_name not in sys.modules:
            m = types.ModuleType(mod_name)
            sys.modules[mod_name] = m
            if mod_name == "distutils":
                m.concurrency_safe_rename = lambda x, y: os.rename(x, y)

    # Force joblib.Parallel to be a simple sequential loop to bypass AST issues
    try:
        import joblib
        class SequentialParallel:
            def __init__(self, *args, **kwargs): pass
            def __call__(self, iterable):
                return [func(*args, **kwargs) for func, args, kwargs in iterable]
        joblib.Parallel = SequentialParallel
    except:
        pass

apply_workarounds()
# -------------------------------------------------------------

import numpy as np
from PIL import Image
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import ExtraTreesClassifier
from sklearn.metrics import accuracy_score, f1_score, classification_report
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
    V6 Update: ปิด Dilation (เพราะปากกาหนาพอแล้ว) เพื่อรักษา 'รู' ของเลข 36
    """
    # 1. แปลงเป็น Grayscale
    img = image.convert('L')
    
    # 2. Centering: หาขอบเขตตัวเลข
    img_array = np.array(img)
    inverted_img = 255 - img_array
    coords = np.column_stack(np.where(inverted_img > 40)) 
    
    if coords.size > 0:
        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)
        digit = img.crop((x_min, y_min, x_max + 1, y_max + 1))
        
        w, h = digit.size
        # เพิ่มขอบ (Padding) - ปรับลดจาก 14 เป็น 8 เพื่อให้ตัวเลขใหญ่ขึ้น
        padding = 8
        size = max(w, h) + padding
        new_img = Image.new('L', (size, size), 255)
        new_img.paste(digit, ((size - w) // 2, (size - h) // 2))
        
        # V6: ไม่ใช้ Filter เบ่งเส้นแล้ว เพื่อความคมชัดของรูตัวเลข
        img = new_img.resize(IMG_SIZE, Image.Resampling.LANCZOS)
    else:
        img = img.resize(IMG_SIZE)

    # 3. Binary Thresholding (ปรับให้คมชัดที่ 170)
    fn = lambda x : 255 if x > 170 else 0
    img = img.point(fn, mode='L')
    
    return img

# ---------------------------------------------------------
# 2. โหลดชุดข้อมูลและเพิ่มจำนวน (Load & Augment)
# ---------------------------------------------------------

def load_dataset():
    X = []
    y = []
    
    print("--- กำลังอ่านและเพิ่มจำนวนข้อมูล (V8: Enhanced Class 36) ---")
    
    for label in LABELS:
        label_dir = os.path.join(DATASET_DIR, label)
        if not os.path.exists(label_dir): continue
            
        for img_name in os.listdir(label_dir):
            if img_name.lower().endswith((".png", ".jpg")):
                img_path = os.path.join(label_dir, img_name)
                try:
                    raw_img = Image.open(img_path)
                    clean_img = preprocess_image(raw_img)
                    
                    # V8.2: ปรับ Augmentation ให้สมดุลตามจำนวนข้อมูลจริงในเครื่อง
                    if label == "๓๘":
                        aug_count = 12  # ข้อมูลน้อยสุด (159) -> ~1900
                    elif label == "๓๗":
                        aug_count = 7   # ข้อมูลปานกลาง (298) -> ~2000
                    elif label == "๓๖":
                        aug_count = 6   # ข้อมูล (354) -> ~2100
                    elif label == "๓๙":
                        aug_count = 5   # ข้อมูล (397) -> ~1985
                    else:
                        aug_count = 4   # ข้อมูลเยอะสุด (537) -> ~2148
                    
                    variants = [clean_img]
                    
                    for _ in range(aug_count - 1):
                        v = clean_img
                        choice = random.choice(['rotate', 'shift', 'zoom'])
                        
                        if choice == 'rotate':
                            angle = random.uniform(-8, 8)
                            v = v.rotate(angle, fillcolor=255)
                        elif choice == 'shift':
                            tx, ty = random.randint(-1, 1), random.randint(-1, 1)
                            shifted = Image.new('L', IMG_SIZE, 255)
                            shifted.paste(v, (tx, ty))
                            v = shifted
                        elif choice == 'zoom':
                            zoom_factor = random.uniform(0.95, 1.05)
                            w, h = v.size
                            new_w, new_h = int(w * zoom_factor), int(h * zoom_factor)
                            v_resized = v.resize((new_w, new_h), Image.Resampling.LANCZOS)
                            v = Image.new('L', IMG_SIZE, 255)
                            v.paste(v_resized, ((IMG_SIZE[0]-new_w)//2, (IMG_SIZE[1]-new_h)//2))
                        
                        variants.append(v)
                    
                    for v in variants:
                        # ใช้ float16 หรือเก็บเป็น uint8 ก่อนถ้าจำเป็น แต่ในที่นี้ลดจำนวนรูปน่าจะพอ
                        img_array = np.array(v, dtype='uint8')
                        X.append(img_array.flatten())
                        y.append(label)
                        
                except Exception as e:
                    print(f"Error: {img_path} - {e}")
                    
    # แปลงเป็น float32 ตอนจะเทรนเท่านั้น
    return np.array(X, dtype='uint8'), np.array(y)

# ---------------------------------------------------------
# 3. การเทรน (Training)
# ---------------------------------------------------------

def train():
    X_raw, y = load_dataset()
    if len(X_raw) == 0: return print("Error: No data")

    # แปลงข้อมูลเป็น Normalize float32 เฉพาะตอนใช้งาน
    X = X_raw.astype('float32') / 255.0
    X = 1.0 - X
    del X_raw # คืนค่า Memory ทันที

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # V7: ลด n_estimators เหลือ 100 เพื่อประหยัด RAM และลดขนาดไฟล์โมเดล
    model = ExtraTreesClassifier(
        n_estimators=100, 
        max_depth=30,
        min_samples_leaf=1,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    
    print(f"--- กำลังเทรนโมเดล V7 (Dataset Size: {len(X)}) ---")
    model.fit(X_train, y_train)

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

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH, compress=9)
    
    with open(METRICS_PATH, 'w', encoding='utf-8') as f:
        json.dump(metrics, f, ensure_ascii=False, indent=4)
    print(f"--- บันทึกเรียบร้อย! ขนาดโมเดล: {os.path.getsize(MODEL_PATH)/1024/1024:.2f} MB ---")

if __name__ == "__main__":
    train()
