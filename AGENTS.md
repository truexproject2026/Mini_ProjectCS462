# Project: Thai Handwriting ML System (๓๖-๔๐)

## 🎯 Concept & Goal
โปรเจคนี้คือระบบทำนายลายมือตัวเลขไทยในช่วง **๓๖, ๓๗, ๓๘, ๓๙, ๔๐** โดยใช้เทคโนโลยี Hybrid ระหว่าง **Next.js** (Frontend) และ **FastAPI** (Machine Learning Backend) เพื่อสร้างระบบที่ใช้งานง่ายและขยายผลได้จริง

---

## 🏗️ System Architecture

### 1. Frontend (Next.js 15)
- **Tech Stack:** React, Tailwind CSS, Lucide Icons
- **Key Features:**
    - **Canvas Drawing:** ระบบวาดภาพลายมือที่รองรับทั้ง Mouse และ Touch
    - **Prediction Interface:** แสดงผลทำนายพร้อมค่าความเชื่อมั่น (Confidence Score)
    - **Data Collection:** ระบบเก็บตัวอย่างลายมือเพื่อสร้าง Dataset
    - **Admin Dashboard:** สำหรับอัปโหลดโมเดลและดู Metrics (Accuracy, Precision, etc.)

### 2. ML Backend (FastAPI / Python)
- **Tech Stack:** FastAPI, Scikit-learn, Pillow, Numpy
- **Core Logic:**
    - **Preprocessing:** การจัดการรูปภาพ (Grayscale -> Centering -> Inversion -> Normalization) เพื่อให้ AI ประมวลผลได้แม่นยำ
    - **Prediction:** ใช้โมเดล **Random Forest** ในการจำแนกตัวเลข
    - **API Endpoints:** `/predict` (ทำนาย), `/reload-model` (โหลดโมเดลใหม่ทันที)

### 3. Data & Model
- **Storage:** รูปภาพที่วาดจะถูกเก็บใน `dataset/` (Local) และอัปโหลดขึ้น **Google Drive** (ผ่าน Service Account)
- **Model File:** บันทึกเป็น `models/current_model.pkl`
- **Training Pipeline:** ใช้ `train_model.py` ในการเทรนใหม่เมื่อมีข้อมูลเพิ่มขึ้น

---

## 🛠️ How to Maintain (Next Steps)

1. **เมื่อจะเริ่มทำงานใหม่:**
    - เปิด Backend: `python backend/main.py` (Port 8000)
    - เปิด Frontend: `npm run dev` (Port 3000)

2. **การพัฒนาความแม่นยำ:**
    - วาดตัวเลขเพิ่มในเมนู **"Dataset"** เพื่อสะสมข้อมูล
    - รัน `python train_model.py` เพื่ออัปเดตโมเดล
    - ระบบจะรีโหลดโมเดลใหม่ให้อัตโนมัติ (ไม่ต้อง Restart Backend)

3. **ข้อควรระวัง:**
    - ตรวจสอบสิทธิ์ Google Drive ใน `google-credentials.json` หากการอัปโหลด Dataset ล้มเหลว
    - ไฟล์ `.env.local` ต้องมี `BACKEND_URL=http://localhost:8000`

---
*บันทึกโดย Gemini CLI - 8 พฤษภาคม 2026*
