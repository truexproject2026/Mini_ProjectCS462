# ✍️ Thai Handwriting ML System (๓๖ - ๔๐)

ระบบทำนายลายมือตัวเลขไทยในช่วง **๓๖, ๓๗, ๓๘, ๓๙ และ ๔๐** พัฒนาด้วยเทคโนโลยีสมัยใหม่แบบ Full-stack ร่วมกับ Machine Learning (Random Forest) เพื่อการเรียนรู้และจำแนกลายมืออย่างแม่นยำ

---

## 🌟 Features

- **🎯 Real-time Prediction:** วาดตัวเลขและทำนายผลทันทีผ่าน AI Backend
- **📁 Dataset Collection:** ระบบเก็บข้อมูลลายมืออัตโนมัติ เพื่อนำไปเทรนโมเดลให้ฉลาดขึ้น
- **📊 Admin Dashboard:** ดูค่าสถิติความแม่นยำ (Metrics) และจัดการไฟล์โมเดล (.pkl)
- **☁️ Google Drive Integration:** สำรองข้อมูล Dataset ขึ้นระบบ Cloud โดยอัตโนมัติ
- **📱 Responsive Design:** ใช้งานได้ทั้งบนคอมพิวเตอร์และแท็บเล็ต (Touch support)

---

## 🏗️ Tech Stack

- **Frontend:** [Next.js 15](https://nextjs.org/) (React, TypeScript, Tailwind CSS)
- **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **ML Library:** Scikit-learn, NumPy, Pillow (PIL)
- **Database/Storage:** Local Storage & Google Drive API

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)

### 2. Setup Backend (Python)
```powershell
# เข้าไปที่โฟลเดอร์โปรเจค
cd thai-handwriting-next

# สร้าง Virtual Environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# ติดตั้ง Library
pip install -r backend/requirements.txt

# รัน Backend Server
python backend/main.py
```

### 3. Setup Frontend (Next.js)
```powershell
# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env.local และกำหนดค่า
# BACKEND_URL=http://localhost:8000

# รัน Frontend
npm run dev
```
เข้าใช้งานที่: `http://localhost:3000`

---

## 🧠 Machine Learning Pipeline

1. **Data Collection:** เก็บรูปภาพจาก Canvas ขนาด 400x400 px
2. **Preprocessing:** 
   - แปลงเป็น Grayscale
   - **Centering:** จัดตำแหน่งตัวเลขให้อยู่กึ่งกลางภาพ
   - **Resize:** ย่อขนาดเหลือ 28x28 px
   - **Normalization:** ปรับค่าสีเป็น 0.0 - 1.0 (Inverted)
3. **Training:** ใช้ **Random Forest Classifier** (100 estimators)
4. **Deployment:** บันทึกโมเดลเป็นไฟล์ `.pkl` และโหลดเข้าหน่วยความจำผ่าน FastAPI

---

## 📂 Project Structure

```text
├── backend/            # Python FastAPI Backend
├── dataset/            # ที่เก็บรูปภาพแยกตาม Class (๓๖-๔๐)
├── models/             # ไฟล์โมเดล (.pkl) และ Metrics (.json)
├── public/             # Static Assets
├── src/                # Next.js Frontend (App Router)
│   ├── app/            # Pages & API Routes
│   └── components/     # React Components (DrawingCanvas)
├── train_model.py      # Script สำหรับเทรนโมเดลใหม่
└── AGENTS.md           # หน่วยความจำและ Concept ของโปรเจค
```

---
**CS462 Machine Learning Assignment**
