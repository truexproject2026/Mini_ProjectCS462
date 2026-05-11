# Project: Thai Handwriting ML System (๓๖-๔๐)

## 🎯 Concept & Goal
โปรเจคนี้คือระบบทำนายลายมือตัวเลขไทยในช่วง **๓๖, ๓๗, ๓๘, ๓๙, ๔๐** โดยใช้เทคโนโลยี Hybrid ระหว่าง **Next.js** (Frontend) และ **FastAPI** (Machine Learning Backend) เพื่อสร้างระบบที่ใช้งานง่ายและขยายผลได้จริง

---

## 🏗️ System Architecture

### 1. Frontend (Next.js 15)
- **Tech Stack:** React, Tailwind CSS, Lucide Icons, Cloudinary SDK
- **Key Features:**
    - **Canvas Drawing:** ระบบวาดภาพลายมือที่รองรับทั้ง Mouse และ Touch
    - **Prediction Interface:** แสดงผลทำนายพร้อมค่าความเชื่อมั่น (Confidence Score)
    - **Data Collection:** ระบบเก็บตัวอย่างลายมือ อัปโหลดตรงไปที่ **Cloudinary**
    - **Admin Dashboard:** สำหรับอัปโหลดโมเดลและดู Metrics (Accuracy, Precision, etc.) แบบ Real-time

### 2. ML Backend (FastAPI / Python)
- **Tech Stack:** FastAPI, Scikit-learn, Pillow, Numpy, python-multipart
- **Core Logic:**
    - **Preprocessing V8.1:** (Grayscale -> Centering -> Padding 8px -> Thresholding) ปรับจูนเพื่อรองรับลายมือจริง
    - **Prediction:** ใช้โมเดล **ExtraTreesClassifier** (V8.1 Accuracy: 96.36%)
    - **API Endpoints:** `/predict` (ทำนาย), `/upload-model` (อัปเดตโมเดลและ Metrics ทันที)

### 3. Data & Model
- **Storage:** รูปภาพที่วาดถูกเก็บแบบถาวรบน **Cloudinary** (แทนที่ Google Drive เดิม)
- **Model File:** บันทึกเป็น `models/current_model.pkl`
- **Dataset Expansion:** เน้นการเพิ่มข้อมูลเลข **๓๖** (ปัจจุบันมี 285 รูป) เพื่อความสมดุล

---

## 🛠️ How to Maintain (Next Steps)

1. **เมื่อจะเริ่มทำงานใหม่:**
    - เปิด Backend: `python backend/main.py` (Port 8000)
    - เปิด Frontend: `npm run dev` (Port 3000)

2. **การพัฒนาความแม่นยำ:**
    - วาดตัวเลขเพิ่มในหน้า **"Dataset"** เพื่อสะสมข้อมูลเข้า Cloudinary
    - รัน `python train_model.py` เพื่อฝึกสอนโมเดลใหม่
    - อัปโหลดไฟล์ที่ได้ผ่านหน้าเว็บ (Admin) เพื่อใช้งานทันที

3. **ข้อควรระวัง:**
    - ไฟล์ `.env.local` ต้องมีค่า Config ของ Cloudinary และ URL ของ Backend ที่ถูกต้อง
    - การเทรนโมเดลใช้หน่วยความจำสูง (Optimized ใน V7+ ให้รันบน Render Free Tier ได้)

---
*บันทึกโดย Gemini CLI - 11 พฤษภาคม 2026 (Model V8.1 Update)*
