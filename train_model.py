import os
import numpy as np
from PIL import Image, ImageOps, ImageFilter
import pickle
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
    - ลด Noise
    """
    # 1. แปลงเป็น Grayscale
    img = image.convert('L')
    
    # 2. Centering: หาขอบเขตตัวเลขและวางกึ่งกลาง
    img_array = np.array(img)
    inverted_img = 255 - img_array
    coords = np.column_stack(np.where(inverted_img > 30)) # Threshold เบื้องต้นหาตัวเลข
    
    if coords.size > 0:
        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)
        digit = img.crop((x_min, y_min, x_max + 1, y_max + 1))
        
        w, h = digit.size
        size = max(w, h) + 4 # เพิ่มขอบนิดหน่อย
        new_img = Image.new('L', (size, size), 255)
        new_img.paste(digit, ((size - w) // 2, (size - h) // 2))
        img = new_img.resize(IMG_SIZE, Image.Resampling.LANCZOS)
    else:
        img = img.resize(IMG_SIZE)

    # 3. Binary Thresholding: ทำให้เป็นขาวดำสนิท (กำจัดสีเทาที่ทำให้ AI งง)
    # ถ้าค่าความสว่าง < 200 (คือส่วนที่เป็นเส้น) ให้เป็น 0 (ดำ) ถ้าสว่างกว่านั้นให้เป็น 255 (ขาว)
    fn = lambda x : 255 if x > 180 else 0
    img = img.point(fn, mode='L')
    
    return img

def augment_image(image):
    """
    ฟังก์ชันสร้าง 'ร่างแยก' ให้รูปภาพ (Data Augmentation):
    - หมุนภาพเล็กน้อย
    - ขยับตำแหน่งเล็กน้อย
    """
    augmented_images = []
    
    # 1. รูปต้นฉบับ
    augmented_images.append(image)
    
    # 2. หมุนซ้าย-ขวา (-10 ถึง 10 องศา)
    for _ in range(3):
        angle = random.uniform(-12, 12)
        rotated = image.rotate(angle, fillcolor=255)
        augmented_images.append(rotated)
        
    # 3. ขยับตำแหน่ง (Shift)
    for _ in range(3):
        tx = random.randint(-2, 2)
        ty = random.randint(-2, 2)
        shifted = Image.new('L', IMG_SIZE, 255)
        shifted.paste(image, (tx, ty))
        augmented_images.append(shifted)
        
    return augmented_images

# ---------------------------------------------------------
# 2. โหลดชุดข้อมูลและเพิ่มจำนวน (Load & Augment)
# ---------------------------------------------------------

def load_dataset():
    X = []
    y = []
    
    print("--- กำลังอ่านและเพิ่มจำนวนข้อมูล (Augmentation) ---")
    
    # นับจำนวนรูปภาพในแต่ละคลาสเพื่อใช้ในการทำ Balanced Augmentation
    class_counts = {}
    for label in LABELS:
        label_dir = os.path.join(DATASET_DIR, label)
        if os.path.exists(label_dir):
            count = len([f for f in os.listdir(label_dir) if f.lower().endswith((".png", ".jpg"))])
            class_counts[label] = count
    
    max_count = max(class_counts.values()) if class_counts else 0

    for label in LABELS:
        label_dir = os.path.join(DATASET_DIR, label)
        if not os.path.exists(label_dir): continue
            
        for img_name in os.listdir(label_dir):
            if img_name.lower().endswith((".png", ".jpg")):
                img_path = os.path.join(label_dir, img_name)
                try:
                    # โหลดและทำ Preprocess ขั้นพื้นฐาน
                    raw_img = Image.open(img_path)
                    clean_img = preprocess_image(raw_img)
                    
                    # ตัดสินใจจำนวน Augmentation ตามความสมดุลของข้อมูล
                    # ถ้าข้อมูลน้อย ให้ปั๊มรูปเพิ่มมากกว่าปกติ
                    aug_count = 7 # พื้นฐาน
                    if class_counts[label] < 50:
                        aug_count = 20 # ถ้าข้อมูลน้อยกว่า 50 รูป ให้เพิ่มเป็น 20 variants
                    
                    # สร้างรูปเพิ่มจากรูปเดิม (Augmentation)
                    variants = []
                    variants.append(clean_img) # ต้นฉบับ
                    
                    # เพิ่ม variants จนครบตามที่ต้องการ
                    for _ in range(aug_count - 1):
                        # สุ่มเลือกระหว่างหมุนหรือขยับ
                        choice = random.choice(['rotate', 'shift', 'both'])
                        v = clean_img
                        if choice in ['rotate', 'both']:
                            angle = random.uniform(-15, 15)
                            v = v.rotate(angle, fillcolor=255)
                        if choice in ['shift', 'both']:
                            tx = random.randint(-3, 3)
                            ty = random.randint(-3, 3)
                            shifted = Image.new('L', IMG_SIZE, 255)
                            shifted.paste(v, (tx, ty))
                            v = shifted
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

    print(f"จำนวนข้อมูลหลัง Augmentation: {len(X)} รูป")

    # 1. การแบ่งข้อมูล
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # 2. การสร้างโมเดล (Random Forest) - เพิ่ม class_weight='balanced'
    model = RandomForestClassifier(n_estimators=300, max_depth=25, class_weight='balanced', random_state=42)
    
    # 3. Cross-validation (+5 Extra Points)
    print("--- กำลังทำ Cross-validation (5-Fold)... ---")
    cv_scores = cross_val_score(model, X, y, cv=5)
    cv_mean = cv_scores.mean()
    print(f"Cross-validation Accuracy: {cv_mean:.4f}")

    # 4. การเทรนโมเดลจริง
    print("--- กำลังเทรนโมเดลจริง... ---")
    model.fit(X_train, y_train)

    # 5. ประเมินผล (Evaluation & Metrics)
    y_pred = model.predict(X_test)
    
    # คำนวณค่าต่าง ๆ ตาม Requirement 7
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    
    # Error Analysis (Confusion Matrix) (+5 Extra Points)
    conf_matrix = confusion_matrix(y_test, y_pred, labels=LABELS)
    
    metrics = {
        "accuracy": float(acc),
        "precision": float(prec),
        "recall": float(rec),
        "f1_score": float(f1),
        "cv_accuracy": float(cv_mean),
        "confusion_matrix": conf_matrix.tolist(),
        "labels": LABELS,
        "report": classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    }

    print(f"Accuracy: {acc:.4f} | F1: {f1:.4f}")

    # 6. บันทึกผล
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    with open(METRICS_PATH, 'w', encoding='utf-8') as f:
        json.dump(metrics, f, ensure_ascii=False, indent=4)
    print("--- บันทึกโมเดลและ Metrics เรียบร้อยแล้ว ---")

if __name__ == "__main__":
    train()
